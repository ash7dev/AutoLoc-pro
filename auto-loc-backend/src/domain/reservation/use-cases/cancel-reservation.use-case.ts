import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutReservation, StatutPaiement, SensTransaction, TypeTransactionWallet, FournisseurPaiement, ModePaiementReservation } from '@prisma/client';
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
import { PaymentService } from '../../../infrastructure/payment/payment.service';

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
    commissionRetained: string;
    ownerCompensationAmount: string;
    ownerPenaltyAmount: string;
    warnings: string[];
}

interface EffectiveCancellationResult extends CancellationResult {
    ownerCompensationAmount: Prisma.Decimal;
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
        private readonly payment: PaymentService,
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

        // ── 2. Fetch reservation with relations + LOCK to prevent race condition ────
        // Use transaction with FOR UPDATE to prevent simultaneous cancellations
        const reservation = await this.prisma.$transaction(async (tx) => {
            const res = await tx.reservation.findUnique({
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
                    modePaiement: true,
                    montantPayeEnLigne: true,
                    montantSoldeCheckin: true,
                    montantCommissionEnLigne: true,
                    montantProprietaireEnLigne: true,
                    vehicule: { select: { marque: true, modele: true, ville: true } },
                    paiement: {
                        select: {
                            id: true,
                            statut: true,
                            montant: true,
                            fournisseur: true,
                            idTransactionFournisseur: true,
                            telephonePaiement: true,
                        },
                    },
                    locataire: { select: { telephone: true, prenom: true, nom: true, email: true } },
                    proprietaire: { select: { telephone: true, prenom: true, email: true } },
                },
            });

            if (!res) throw new NotFoundException('Réservation introuvable');

            // Lock the reservation to prevent parallel cancellations
            await tx.$executeRaw`SELECT id FROM "Reservation" WHERE id = ${reservationId} FOR UPDATE`;

            // Check if already cancelled
            if (res.statut === StatutReservation.ANNULEE) {
                throw new BusinessRuleException(
                    'Cette réservation a déjà été annulée',
                    'ALREADY_CANCELLED',
                );
            }

            return res;
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

        const effectivePolicy = this.applyCapturedPaymentPolicy(
            policy,
            reservation,
            isLocataire,
        );

        // ── 6. Atomic transaction (RepeatableRead) ─────────────────────────────

        const hasRefund = effectivePolicy.refundAmount.gt(0) &&
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

                // 6c. Paiement → EN_ATTENTE_REMBOURSEMENT (si applicable)
                // L'admin devra traiter le remboursement InTouch manuellement via /admin/refunds
                if (hasRefund && reservation.paiement) {
                    await tx.paiement.update({
                        where: { id: reservation.paiement.id },
                        data: {
                            statut: StatutPaiement.EN_ATTENTE_REMBOURSEMENT,
                            montantRembourse: effectivePolicy.refundAmount,
                        },
                    });
                }

                if (
                    isLocataire &&
                    effectivePolicy.ownerCompensationAmount.gt(0)
                ) {
                    const wallet = await tx.wallet.upsert({
                        where: { utilisateurId: reservation.proprietaireId },
                        create: {
                            utilisateurId: reservation.proprietaireId,
                            soldeDisponible: 0,
                        },
                        update: {},
                        select: { id: true, soldeDisponible: true },
                    });

                    const nouveauSolde = wallet.soldeDisponible
                        .add(effectivePolicy.ownerCompensationAmount)
                        .toDecimalPlaces(2);

                    await tx.transactionWallet.create({
                        data: {
                            walletId: wallet.id,
                            reservationId,
                            type: TypeTransactionWallet.CREDIT_LOCATION,
                            montant: effectivePolicy.ownerCompensationAmount,
                            sens: SensTransaction.CREDIT,
                            soldeApres: nouveauSolde,
                            fournisseur: reservation.paiement?.fournisseur,
                        },
                    });

                    await tx.wallet.update({
                        where: { id: wallet.id },
                        data: { soldeDisponible: nouveauSolde },
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

        // 7a. Remboursement automatique Wave IMMÉDIAT et SYNCHRONE
        if (hasRefund && reservation.paiement && reservation.paiement.fournisseur === FournisseurPaiement.WAVE) {
            const refundVal = Number(effectivePolicy.refundAmount);
            const paiementId = reservation.paiement.id;
            const telephonePaiement = reservation.paiement.telephonePaiement;
            const locataireNom = `${reservation.locataire.prenom} ${reservation.locataire.nom}`;

            this.logger.log(`🔄 Remboursement Wave IMMÉDIAT - Réservation ${reservationId} - Montant: ${refundVal} FCFA`);

            // Vérifier que le téléphone existe
            if (!telephonePaiement) {
                this.logger.error(`⚠️ Téléphone de paiement manquant pour ${reservationId} - Remboursement manuel requis`);
                await this.telegram.sendAdminAlert(
                    `⚠️ <b>Remboursement Wave impossible - Téléphone manquant</b>\n` +
                    `Réservation : <code>${reservationId.slice(0, 8).toUpperCase()}</code>\n` +
                    `Montant : ${refundVal} FCFA\n` +
                    `Client : ${locataireNom}\n` +
                    `Action : Rembourser manuellement via Wave Business`
                ).catch(() => {});
            } else {
                // Exécuter le remboursement de manière synchrone
                try {
                    await this.payment.refundPayment(
                        'WAVE',
                        reservation.paiement.idTransactionFournisseur || '',
                        refundVal,
                        telephonePaiement,
                        locataireNom,
                    );

                    // Marquer comme remboursé
                    await this.prisma.paiement.update({
                        where: { id: paiementId },
                        data: {
                            statut: StatutPaiement.REMBOURSE,
                            rembourseLe: new Date(),
                            montantRembourse: refundVal,
                        },
                    });

                    this.logger.log(`✅ Remboursement Wave réussi pour ${reservationId} - ${refundVal} FCFA → ${telephonePaiement}`);
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    this.logger.error(`❌ Échec remboursement Wave pour ${reservationId}: ${errorMsg}`);

                    // Alerte admin en cas d'échec
                    await this.telegram.sendAdminAlert(
                        `❌ <b>Échec remboursement Wave automatique</b>\n` +
                        `Réservation : <code>${reservationId.slice(0, 8).toUpperCase()}</code>\n` +
                        `Montant : ${refundVal} FCFA\n` +
                        `Client : ${locataireNom}\n` +
                        `Téléphone : ${telephonePaiement}\n` +
                        `Erreur : ${errorMsg}\n` +
                        `Action : Rembourser manuellement`
                    ).catch(() => {});
                }
            }
        }

        // 7b. Cancel scheduled expiry jobs
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
        this.revalidate.revalidatePath('/reservations').catch(() => { });
        if (city) {
            this.revalidate.revalidatePath(`/location/${encodeURIComponent(city)}`).catch(() => { });
        }

        // 7c. Notify both parties separately
        const notificationData = {
            reservationId,
            cancelledBy: isLocataire ? 'LOCATAIRE' : 'PROPRIETAIRE',
            raison: input.raison,
            refundAmount: effectivePolicy.refundAmount.toString(),
            refundPercentage: effectivePolicy.refundPercentage,
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
                `💸 <b>REMBOURSEMENT À TRAITER</b>\n` +
                `Par : Locataire\n` +
                `Motif : ${input.raison.slice(0, 100)}\n` +
                `Montant : ${effectivePolicy.refundAmount} FCFA (${effectivePolicy.refundPercentage}%)\n` +
                `⚠️ ACTION REQUISE : Faire le virement InTouch puis valider\n` +
                `<a href="https://autoloc.sn/dashboard/admin/refunds">Traiter le remboursement →</a>`,
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
                    refundAmount: effectivePolicy.refundAmount.toString(),
                    refundPercentage: effectivePolicy.refundPercentage.toString(),
                    commissionRetained: effectivePolicy.commissionRetained.toString(),
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
            refundAmount: effectivePolicy.refundAmount.toString(),
            refundPercentage: effectivePolicy.refundPercentage,
            commissionRetained: effectivePolicy.commissionRetained.toString(),
            ownerCompensationAmount: effectivePolicy.ownerCompensationAmount.toString(),
            ownerPenaltyAmount: policy.ownerPenaltyAmount.toString(),
            warnings: policy.warnings,
        };
    }

    private applyCapturedPaymentPolicy(
        policy: CancellationResult,
        reservation: {
            modePaiement: ModePaiementReservation;
            totalLocataire: Prisma.Decimal;
            montantCommission: Prisma.Decimal;
            montantProprietaireEnLigne: Prisma.Decimal;
            paiement: { statut: StatutPaiement; montant: Prisma.Decimal } | null;
        },
        isLocataire: boolean,
    ): EffectiveCancellationResult {
        const zero = new Prisma.Decimal(0);
        const confirmedOnlineAmount =
            reservation.paiement?.statut === StatutPaiement.CONFIRME
                ? reservation.paiement.montant.toDecimalPlaces(2)
                : zero;

        if (confirmedOnlineAmount.eq(0)) {
            return {
                ...policy,
                refundAmount: zero,
                commissionRetained: zero,
                ownerCompensationAmount: zero,
            };
        }

        if (reservation.modePaiement !== ModePaiementReservation.ACOMPTE_SOLDE_CHECKIN) {
            return {
                ...policy,
                ownerCompensationAmount: zero,
            };
        }

        const refundRatio = reservation.totalLocataire.gt(0)
            ? Prisma.Decimal.min(
                new Prisma.Decimal(1),
                Prisma.Decimal.max(zero, policy.refundAmount.div(reservation.totalLocataire)),
            )
            : zero;
        const refundAmount = Prisma.Decimal.min(
            confirmedOnlineAmount,
            confirmedOnlineAmount.mul(refundRatio),
        )
            .toDecimalPlaces(2);
        const retainedOnline = Prisma.Decimal.max(
            zero,
            confirmedOnlineAmount.sub(refundAmount),
        ).toDecimalPlaces(2);
        const commissionRetained = Prisma.Decimal.min(
            policy.commissionRetained,
            retainedOnline,
        ).toDecimalPlaces(2);
        const ownerCompensationAmount = isLocataire
            ? Prisma.Decimal.min(
                reservation.montantProprietaireEnLigne,
                Prisma.Decimal.max(zero, retainedOnline.sub(commissionRetained)),
            ).toDecimalPlaces(2)
            : zero;

        return {
            ...policy,
            refundAmount,
            commissionRetained,
            ownerCompensationAmount,
        };
    }
}
