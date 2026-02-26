import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutReservation, StatutPaiement, SensTransaction, TypeTransactionWallet } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { ReservationStateMachine } from '../reservation.state-machine';
import {
    CancellationPolicyService,
    CancellationResult,
} from '../cancellation-policy.service';
import { ContractGenerationService } from '../contract-generation.service';
import { RevalidateService } from '../../../infrastructure/revalidate/revalidate.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const SEARCH_CACHE_PREFIX = 'vehicles:search:';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CancelReservationInput {
    raison: string;
}

export interface CancelReservationResultDto {
    reservationId: string;
    statut: StatutReservation;
    refundAmount: string;
    refundPercentage: number;
    ownerPenaltyAmount: string;
    warnings: string[];
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CancelReservationUseCase {
    private readonly logger = new Logger(CancelReservationUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly queue: QueueService,
        private readonly stateMachine: ReservationStateMachine,
        private readonly cancellationPolicy: CancellationPolicyService,
        private readonly contractGeneration: ContractGenerationService,
        private readonly revalidate: RevalidateService,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
        input: CancelReservationInput,
    ): Promise<CancelReservationResultDto> {
        // ── 1. Resolve actor ───────────────────────────────────────────────────
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!utilisateur) throw new ForbiddenException('Profile not completed');

        // ── 2. Fetch reservation with relations ────────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                locataireId: true,
                proprietaireId: true,
                vehiculeId: true,
                dateDebut: true,
                totalLocataire: true,
                totalBase: true,
                montantCommission: true,
                netProprietaire: true,
                vehicule: { select: { ville: true } },
                paiement: {
                    select: {
                        id: true,
                        statut: true,
                        montant: true,
                    },
                },
                locataire: { select: { telephone: true, prenom: true } },
                proprietaire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');

        // ── 3. Authorization: locataire OU proprietaire ────────────────────────
        const isLocataire = reservation.locataireId === utilisateur.id;
        const isProprietaire = reservation.proprietaireId === utilisateur.id;

        if (!isLocataire && !isProprietaire) {
            throw new ForbiddenException('Vous n\'êtes pas autorisé à annuler cette réservation');
        }

        // ── 4. Validate cancellable status ─────────────────────────────────────
        if (!this.stateMachine.isCancellable(reservation.statut)) {
            throw new BusinessRuleException(
                `Impossible d'annuler une réservation en statut ${reservation.statut}`,
                'CANCELLATION_INVALID_STATUS',
            );
        }

        // Validate state machine transition
        this.stateMachine.transition(reservation.statut, StatutReservation.ANNULEE);

        // ── 5. Calculate cancellation policy ───────────────────────────────────
        const now = new Date();
        const reservationData = {
            dateDebut: reservation.dateDebut,
            totalLocataire: reservation.totalLocataire,
            totalBase: reservation.totalBase,
            montantCommission: reservation.montantCommission,
            netProprietaire: reservation.netProprietaire,
        };

        let policy: CancellationResult;
        if (isLocataire) {
            policy = this.cancellationPolicy.calculateForTenant(reservationData, now);
        } else {
            policy = this.cancellationPolicy.calculateForOwner(reservationData, now);
        }

        if (!policy.canCancel) {
            throw new BusinessRuleException(
                policy.warnings.join('. '),
                'CANCELLATION_BLOCKED',
            );
        }

        // ── 6. Atomic transaction (RepeatableRead) ─────────────────────────────

        const hasRefund = policy.refundAmount.gt(0) &&
            reservation.paiement &&
            reservation.paiement.statut === StatutPaiement.CONFIRME;

        await this.prisma.$transaction(
            async (tx) => {
                // 6a. Update reservation → ANNULEE
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: {
                        statut: StatutReservation.ANNULEE,
                        annuleParId: utilisateur.id,
                        annuleLe: now,
                        raisonAnnulation: input.raison,
                    },
                });

                // 6b. Historique
                await tx.reservationHistorique.create({
                    data: {
                        reservationId,
                        ancienStatut: reservation.statut,
                        nouveauStatut: StatutReservation.ANNULEE,
                        modifiePar: utilisateur.id,
                    },
                });

                // 6c. Paiement → REMBOURSE (si applicable)
                if (hasRefund && reservation.paiement) {
                    await tx.paiement.update({
                        where: { id: reservation.paiement.id },
                        data: {
                            statut: StatutPaiement.REMBOURSE,
                            rembourseLe: now,
                            montantRembourse: policy.refundAmount,
                        },
                    });
                }

                // 6d. Wallet propriétaire — DEBIT_PENALITE si déjà crédité
                if (policy.ownerPenaltyAmount.gt(0)) {
                    const wallet = await tx.wallet.findUnique({
                        where: { utilisateurId: reservation.proprietaireId },
                        select: { id: true, soldeDisponible: true },
                    });

                    if (wallet) {
                        // Check if owner was already credited for this reservation
                        const existingCredit = await tx.transactionWallet.findUnique({
                            where: {
                                reservationId_type: {
                                    reservationId,
                                    type: TypeTransactionWallet.CREDIT_LOCATION,
                                },
                            },
                        });

                        if (existingCredit) {
                            const newSolde = wallet.soldeDisponible
                                .sub(policy.ownerPenaltyAmount)
                                .toDecimalPlaces(2);

                            await tx.wallet.update({
                                where: { id: wallet.id },
                                data: { soldeDisponible: newSolde },
                            });

                            await tx.transactionWallet.create({
                                data: {
                                    walletId: wallet.id,
                                    reservationId,
                                    type: TypeTransactionWallet.DEBIT_PENALITE,
                                    montant: policy.ownerPenaltyAmount,
                                    sens: SensTransaction.DEBIT,
                                    soldeApres: newSolde,
                                },
                            });
                        }
                    }
                }
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
        );

        // ── 7. Post-commit side effects ────────────────────────────────────────

        // 7a. Cancel scheduled expiry jobs
        // Note: cancelJob is best-effort, we use the reservationId pattern
        this.logger.log(`Reservation ${reservationId} cancelled by ${isLocataire ? 'locataire' : 'proprietaire'}`);

        // 7b. Invalidate vehicle cache (créneau freed)
        const city = reservation.vehicule?.ville?.toLowerCase?.() ?? '';
        const cachePattern = city
            ? `${SEARCH_CACHE_PREFIX}${city}:*`
            : `${SEARCH_CACHE_PREFIX}*`;
        await this.redis.delPattern(cachePattern).catch(() => { });

        // Invalidate Next.js cache
        if (reservation.vehicule) {
            this.revalidate.revalidatePath(`/vehicle/${reservation.vehiculeId}`).catch(() => { });
        }
        this.revalidate.revalidatePath('/explorer').catch(() => { });
        if (city) {
            this.revalidate.revalidatePath(`/location/${encodeURIComponent(city)}`).catch(() => { });
        }

        // 7c. Notify both parties
        await this.queue
            .scheduleNotification({
                type: 'reservation.cancelled',
                data: {
                    reservationId,
                    cancelledBy: isLocataire ? 'LOCATAIRE' : 'PROPRIETAIRE',
                    raison: input.raison,
                    refundAmount: policy.refundAmount.toString(),
                    refundPercentage: policy.refundPercentage,
                    ownerPenaltyAmount: policy.ownerPenaltyAmount.toString(),
                    locatairePhone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                    proprietairePhone: reservation.proprietaire?.telephone ?? null,
                    proprietairePrenom: reservation.proprietaire?.prenom ?? null,
                },
            })
            .catch(() => { });

        // 7d. Regenerate contract with ANNULÉ watermark
        await this.contractGeneration
            .generateAndStore(reservationId, {
                statutContrat: 'ANNULE',
                raisonAnnulation: input.raison,
                dateAnnulation: new Date().toLocaleDateString('fr-FR'),
            })
            .catch(() => { });

        return {
            reservationId,
            statut: StatutReservation.ANNULEE,
            refundAmount: policy.refundAmount.toString(),
            refundPercentage: policy.refundPercentage,
            ownerPenaltyAmount: policy.ownerPenaltyAmount.toString(),
            warnings: policy.warnings,
        };
    }
}
