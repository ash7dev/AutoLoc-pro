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
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { NotificationService } from '../../../infrastructure/notifications/notification.service';

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
        private readonly telegram: TelegramService,
        private readonly notifications: NotificationService,
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
        if (!utilisateur) throw new ForbiddenException('Profil incomplet');

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
                dateFin: true,
                totalLocataire: true,
                totalBase: true,
                montantCommission: true,
                netProprietaire: true,
                vehicule: { select: { marque: true, modele: true, ville: true } },
                paiement: {
                    select: {
                        id: true,
                        statut: true,
                        montant: true,
                    },
                },
                locataire: { select: { telephone: true, prenom: true, email: true } },
                proprietaire: { select: { telephone: true, prenom: true, email: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Réservation introuvable');

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
            const isConfirmed = reservation.statut === StatutReservation.CONFIRMEE;
            policy = this.cancellationPolicy.calculateForTenant(reservationData, now, isConfirmed);
        } else {
            // Propriétaire annule
            const isConfirmed = reservation.statut !== StatutReservation.PAYEE;
            policy = this.cancellationPolicy.calculateForOwner(reservationData, now, isConfirmed);
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

                // 6d. Wallet propriétaire : débiter TOUT le solde disponible
                if (isProprietaire) {
                    const wallet = await tx.wallet.findUnique({
                        where: { utilisateurId: reservation.proprietaireId },
                        select: { id: true, soldeDisponible: true },
                    });

                    if (wallet && wallet.soldeDisponible.gt(0)) {
                        // Débiter TOUT le wallet proprio (on récupère ce qu'on peut)
                        const montantDebite = wallet.soldeDisponible;

                        await tx.wallet.update({
                            where: { id: wallet.id },
                            data: { soldeDisponible: new Prisma.Decimal(0) },
                        });

                        await tx.transactionWallet.create({
                            data: {
                                walletId: wallet.id,
                                reservationId,
                                type: TypeTransactionWallet.DEBIT_PENALITE,
                                montant: montantDebite,
                                sens: SensTransaction.DEBIT,
                                soldeApres: new Prisma.Decimal(0),
                            },
                        });
                    }

                    // 6e. Créer pénalité différée si applicable
                    if (policy.ownerPenaltyAmount.gt(0)) {
                        await tx.penaliteProprietaire.create({
                            data: {
                                utilisateurId: reservation.proprietaireId,
                                reservationId,
                                montant: policy.ownerPenaltyAmount,
                                raison: `Annulation ${Math.floor(
                                    this.cancellationPolicy.daysUntilStart(reservation.dateDebut, now),
                                )} jours avant location - Pénalité ${policy.ownerPenaltyPercentage}%`,
                            },
                        });
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

        // 7c. Notify both parties separately
        const notificationData = {
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
            vehicule: reservation.vehicule ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}` : 'véhicule',
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            isRefusal: isProprietaire && reservation.statut === StatutReservation.PAYEE,
        };

        // Email au locataire
        this.queue.scheduleNotification({
                type: 'reservation.cancelled',
                data: {
                    ...notificationData,
                    userId: reservation.locataireId,
                    email: reservation.locataire?.email ?? undefined,
                    phone: reservation.locataire?.telephone ?? undefined,
                },
            })
            .catch(() => { });

        // Email/WhatsApp au propriétaire (seulement si ce n'est pas un simple refus de sa part)
        if (!notificationData.isRefusal) {
            this.queue.scheduleNotification({
                    type: 'reservation.cancelled',
                    data: {
                        ...notificationData,
                        userId: reservation.proprietaireId,
                        email: reservation.proprietaire?.email ?? undefined,
                        phone: reservation.proprietaire?.telephone ?? undefined,
                        isOwner: true,
                    },
                })
                .catch(() => { });
        }

        // 7d. Alerte admin Telegram pour les annulations actionnables
        if (isLocataire && hasRefund) {
            // Locataire annule après paiement → remboursement à traiter
            this.telegram.sendAdminAlert(
                `❌ <b>Annulation après paiement</b>\n` +
                `Par : Locataire\n` +
                `Motif : ${input.raison.slice(0, 100)}\n` +
                `Remboursement dû : ${policy.refundAmount} FCFA (${policy.refundPercentage}%)\n` +
                `<a href="https://autoloc.sn/dashboard/admin/reservations">Voir →</a>`,
            ).catch(() => { });
        } else if (isProprietaire && ([StatutReservation.PAYEE, StatutReservation.CONFIRMEE] as StatutReservation[]).includes(reservation.statut)) {
            // Propriétaire annule une réservation déjà payée ou confirmée → mauvaise expérience
            this.telegram.sendAdminAlert(
                `⚠️ <b>Annulation propriétaire</b>\n` +
                `Statut avant annulation : ${reservation.statut}\n` +
                `Motif : ${input.raison.slice(0, 100)}\n` +
                `Pénalité appliquée : ${policy.ownerPenaltyAmount} FCFA\n` +
                `<a href="https://autoloc.sn/dashboard/admin/reservations">Surveiller →</a>`,
            ).catch(() => { });
        }

        // 7e. Send admin emails
        const adminEmails = ['nstanislas03@gmail.com', 'jinicopi@gmail.com'];
        for (const adminEmail of adminEmails) {
            this.notifications.send({
                email: adminEmail,
                type: 'admin.reservation.cancelled',
                data: {
                    reservationId: reservationId.slice(0, 8).toUpperCase(),
                    vehicule: notificationData.vehicule,
                    cancelledBy: isLocataire ? 'Locataire' : 'Propriétaire',
                    dateDebut: reservation.dateDebut,
                    dateFin: reservation.dateFin,
                    raison: input.raison,
                    refundAmount: policy.refundAmount.toString(),
                    refundPercentage: policy.refundPercentage.toString(),
                    ownerPenaltyAmount: policy.ownerPenaltyAmount.toString(),
                    ownerPenaltyPercentage: policy.ownerPenaltyPercentage.toString(),
                    cancelledAt: now.toLocaleDateString('fr-FR'),
                },
            }).catch(() => { });
        }

        // 7f. Regenerate contract with ANNULÉ watermark — fire-and-forget.
        // PDF generation + Cloudinary upload can take 10-30s : on ne bloque pas la réponse HTTP.
        void this.contractGeneration
            .generateAndStore(reservationId, {
                statutContrat: 'ANNULE',
                raisonAnnulation: input.raison,
                dateAnnulation: new Date().toLocaleDateString('fr-FR'),
            })
            .catch((err: Error) => {
                this.logger.error(`Contract (ANNULE) generation failed for ${reservationId}: ${err.message}`);
            });

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
