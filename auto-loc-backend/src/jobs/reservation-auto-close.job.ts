import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatutReservation, Prisma, TypeTransactionWallet, SensTransaction, FournisseurPaiement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationService } from '../infrastructure/notifications/notification.service';
import { TelegramService } from '../infrastructure/telegram/telegram.service';
import { TacitCheckinUseCase } from '../domain/reservation/use-cases/tacit-checkin.use-case';
import { RevalidateService } from '../infrastructure/revalidate/revalidate.service';
import { isPastCheckoutInspectionWindow } from '../domain/reservation/reservation-checkin.constants';

/**
 * Auto-cancel unchecked-in reservations.
 *
 * Business rule: if a reservation is CONFIRMEE and dateDebut was ≥5h ago
 * without any check-in from either party, the reservation is auto-cancelled
 * to protect both parties from no-shows.
 *
 * NOTE (F2): Les crons handleCheckinReminderVeille (13h UTC) et handleCheckinReminderJourJ (22h UTC)
 * ont été supprimés. Ils dupliquaient les rappels déjà programmés par scheduleCheckinReminder()
 * (appelé depuis confirm-reservation.use-case.ts) SANS déduplication, causant des doublons.
 * Le système de queue gère correctement : T-24h (veille), T+0 (jour express), T+2h (no-show urgent).
 */
@Injectable()
export class ReservationAutoCloseJob {
    private readonly logger = new Logger(ReservationAutoCloseJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly notification: NotificationService,
        private readonly telegram: TelegramService,
        private readonly tacitCheckinUseCase: TacitCheckinUseCase,
        private readonly revalidate: RevalidateService,
    ) { }

    /**
     * Runs every 10 minutes.
     * Système d'enforcement du check-in en 2 paliers :
     * - T+3h : Alerte urgente aux deux parties
     * - T+5h : Annulation automatique avec remboursement selon responsabilité
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleAutoCancel() {
        const now = new Date();
        const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
        const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

        // ── PALIER 1 : T+3h - Alerte urgente ──────────────────────────────────
        const alertCandidates = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { lte: threeHoursAgo, gte: fiveHoursAgo },
                checkinProprietaireLe: null,
                checkinLocataireLe: null,
            },
            select: {
                id: true,
                dateDebut: true,
                locataireId: true,
                proprietaireId: true,
                locataire: { select: { telephone: true, prenom: true, email: true } },
                proprietaire: { select: { telephone: true, prenom: true, email: true } },
                vehicule: { select: { marque: true, modele: true } },
            },
        });

        for (const res of alertCandidates) {
            // Vérifier si alerte déjà envoyée
            const alreadyAlerted = await this.prisma.reservationHistorique.count({
                where: {
                    reservationId: res.id,
                    modifiePar: 'SYSTEM_CHECKIN_ALERT_3H',
                },
            });

            if (alreadyAlerted === 0) {
                await this.sendUrgentCheckinAlert(res);
            }
        }

        // ── PALIER 2 : T+5h - Annulation automatique ──────────────────────────
        const stale = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { lte: fiveHoursAgo },
                checkinProprietaireLe: null,
                checkinLocataireLe: null,
            },
            select: {
                id: true,
                dateDebut: true,
                totalLocataire: true,
                paiement: {
                    select: {
                        id: true,
                        statut: true,
                        montant: true,
                    },
                },
            },
        });

        if (stale.length === 0) return;

        this.logger.warn(
            `Auto-cancelling ${stale.length} stale reservation(s) with no check-in`,
        );

        for (const r of stale) {
            try {
                await this.handleNoshowCancellationWithResponsibility(r.id);
            } catch (err) {
                this.logger.error(`Failed to auto-cancel reservation ${r.id}`, err);
            }
        }
    }

    /**
     * Validation tacite check-in locataire (24h après check-in proprio + photos).
     * Runs every 10 minutes.
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleTacitCheckinDeadline(): Promise<void> {
        await this.tacitCheckinUseCase.processDue(new Date());
    }

    /**
     * Auto-close EN_COURS → TERMINEE après fin de location + 24h (fenêtre inspection proprio).
     * Runs every 30 minutes.
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleAutoClose() {
        const now = new Date();

        const candidates = await this.prisma.reservation.findMany({
            where: {
                statut: StatutReservation.EN_COURS,
                checkoutLe: null,
            },
            select: { id: true, dateFin: true },
        });

        const expired = candidates.filter((r) =>
            isPastCheckoutInspectionWindow(r.dateFin, now),
        );

        if (expired.length === 0) return;

        this.logger.log(`Auto-closing ${expired.length} EN_COURS reservation(s) after inspection window`);

        for (const r of expired) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.reservation.update({
                        where: { id: r.id },
                        data: {
                            statut: StatutReservation.TERMINEE,
                            checkoutLe: now,
                            updatedBySystem: true,
                        },
                    });
                    await tx.reservationHistorique.create({
                        data: {
                            reservationId: r.id,
                            ancienStatut: StatutReservation.EN_COURS,
                            nouveauStatut: StatutReservation.TERMINEE,
                            modifiePar: 'SYSTEM_AUTOCLOSE_POST_INSPECTION',
                        },
                    });
                });
                await this.queue.schedulePostCheckout(r.id).catch(() => { });

                // F4: Notifier les deux parties + demander avis après auto-close
                await this.notifyAutoClose(r.id).catch((err) =>
                    this.logger.error(`Failed to notify auto-close for ${r.id}`, err),
                );

                // Invalider le cache frontend pour cette réservation
                await this.revalidate.revalidateReservation(r.id).catch((err) =>
                    this.logger.error(`Failed to revalidate cache for ${r.id}`, err),
                );
            } catch (err) {
                this.logger.error(`Failed to auto-close reservation ${r.id}`, err);
            }
        }
    }

    /**
     * Tous les jours à 01h00 UTC.
     * Désactive les mises en avant dont featuredUntil est dépassé.
     */
    @Cron('0 1 * * *')
    async handleExpireFeaturedVehicles(): Promise<void> {
        const { count } = await this.prisma.vehicule.updateMany({
            where: { isFeatured: true, featuredUntil: { lte: new Date() } },
            data: { isFeatured: false, featuredUntil: null },
        });
        if (count > 0) {
            this.logger.log(`${count} mise(s) en avant expirée(s) désactivée(s)`);
        }
    }

    // ── Helpers de gestion no-show ───────────────────────────────────────────────

    /**
     * Envoie l'alerte urgente T+3h aux deux parties
     */
    private async sendUrgentCheckinAlert(res: any): Promise<void> {
        const vehicule = res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'véhicule';
        const heureDebut = new Date(res.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Notifier les deux parties
        await Promise.all([
            this.notification.send({
                type: 'reservation.checkin.reminder_urgent',
                userId: res.locataireId,
                email: res.locataire?.email ?? undefined,
                phone: res.locataire?.telephone ?? undefined,
                data: {
                    reservationId: res.id,
                    vehicule,
                    heureDebut,
                    isOwner: false,
                },
            }),
            this.notification.send({
                type: 'reservation.checkin.reminder_urgent',
                userId: res.proprietaireId,
                email: res.proprietaire?.email ?? undefined,
                phone: res.proprietaire?.telephone ?? undefined,
                data: {
                    reservationId: res.id,
                    vehicule,
                    heureDebut,
                    isOwner: true,
                },
            }),
        ]).catch(() => { });

        // Marquer l'alerte comme envoyée
        await this.prisma.reservationHistorique.create({
            data: {
                reservationId: res.id,
                ancienStatut: 'CONFIRMEE',
                nouveauStatut: 'CONFIRMEE',
                modifiePar: 'SYSTEM_CHECKIN_ALERT_3H',
            },
        });

        this.logger.log(`Urgent checkin alert sent for reservation ${res.id} (T+3h)`);
    }

    /**
     * Gère l'annulation no-show T+5h avec remboursement selon responsabilité
     */
    private async handleNoshowCancellationWithResponsibility(reservationId: string): Promise<void> {
        // Récupérer la réservation complète avec toutes les données nécessaires
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                paiement: true,
                litige: true,
                proprietaire: { select: { id: true, prenom: true } },
                locataire: { select: { id: true, prenom: true } },
            },
        });

        if (!reservation) return;

        // Déterminer la responsabilité et les montants
        let refundPercent = 0;
        let ownerCompensationPercent = 0;
        let reason = '';
        let caseType = '';

        // Vérifier si proprio a signalé "Locataire absent"
        const ownerSignaledNoshow = await this.prisma.reservationHistorique.count({
            where: {
                reservationId,
                modifiePar: 'OWNER_SIGNAL_TENANT_NOSHOW',
            },
        });

        // CAS 1 : Litige déclaré par locataire → 100% remboursement
        if (reservation.litige && reservation.litige.statut === 'EN_ATTENTE') {
            refundPercent = 100;
            ownerCompensationPercent = 0;
            reason = `Annulation automatique : Litige "${reservation.litige.motif}" non résolu`;
            caseType = 'OWNER_FAULT';
        }
        // CAS 2 : Proprio a signalé "Locataire absent" → 30% remboursement
        else if (ownerSignaledNoshow > 0) {
            refundPercent = 30;
            ownerCompensationPercent = 50;
            reason = 'Annulation automatique : No-show locataire confirmé par le propriétaire';
            caseType = 'TENANT_NOSHOW';
        }
        // CAS 3 : Aucune partie n'a réagi → 80% remboursement (protection client)
        else {
            refundPercent = 80;
            ownerCompensationPercent = 10;
            reason = 'Annulation automatique : Aucun check-in effectué, responsabilité indéterminée';
            caseType = 'UNDETERMINED';
        }

        const montantTotal = reservation.paiement?.montant || reservation.totalLocataire;
        const montantRembourse = Math.round((Number(montantTotal) * refundPercent) / 100);
        const montantProprietaire = Math.round((Number(montantTotal) * ownerCompensationPercent) / 100);

        const hasRefund = montantRembourse > 0 &&
            reservation.paiement &&
            reservation.paiement.statut === 'CONFIRME';

        // Transaction pour tout annuler et rembourser
        await this.prisma.$transaction(async (tx) => {
            const now = new Date();

            // 1. Annuler la réservation
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    statut: 'ANNULEE',
                    annuleLe: now,
                    raisonAnnulation: reason,
                    updatedBySystem: true,
                },
            });

            // 2. Gérer le remboursement
            if (hasRefund && reservation.paiement) {
                await tx.paiement.update({
                    where: { id: reservation.paiement.id },
                    data: {
                        statut: 'EN_ATTENTE_REMBOURSEMENT',
                        montantRembourse,
                    },
                });
            }

            // 3. Créer transaction de compensation proprio (si > 0)
            if (montantProprietaire > 0) {
                const wallet = await tx.wallet.upsert({
                    where: { utilisateurId: reservation.proprietaireId },
                    create: {
                        utilisateurId: reservation.proprietaireId,
                        soldeDisponible: 0,
                    },
                    update: {},
                });

                const newSolde = wallet.soldeDisponible.add(new Prisma.Decimal(montantProprietaire));
                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { soldeDisponible: newSolde },
                });

                await tx.transactionWallet.create({
                    data: {
                        walletId: wallet.id,
                        reservationId,
                        type: TypeTransactionWallet.CREDIT_LOCATION,
                        montant: montantProprietaire,
                        sens: SensTransaction.CREDIT,
                        soldeApres: newSolde,
                        fournisseur: reservation.paiement?.fournisseur,
                    },
                });
            }

            // 4. Créer l'historique
            await tx.reservationHistorique.create({
                data: {
                    reservationId,
                    ancienStatut: 'CONFIRMEE',
                    nouveauStatut: 'ANNULEE',
                    modifiePar: `SYSTEM_AUTO_CANCEL_${caseType}`,
                },
            });
        });

        // 2b. Planifier le remboursement automatique Wave quasi-immédiat (10 secondes)
        if (hasRefund && reservation.paiement && reservation.paiement.fournisseur === FournisseurPaiement.WAVE) {
            try {
                await this.queue.scheduleWaveRefund(
                    reservationId,
                    reservation.paiement.id,
                    montantRembourse,
                );
                this.logger.log(`Remboursement Wave planifié (10s) pour no-show - Réservation ${reservationId}`);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.logger.error(`Échec de la planification du remboursement Wave (no-show) : ${errorMsg}`);
            }
        }

        this.logger.log(
            `Reservation ${reservationId} auto-cancelled (T+5h) - ` +
            `Case: ${caseType}, Refund: ${refundPercent}%, Owner compensation: ${ownerCompensationPercent}%`
        );

        // Notifier les deux parties
        await this.notifyAutoCancel(reservationId, refundPercent, ownerCompensationPercent, caseType).catch((err) =>
            this.logger.error(`Failed to notify auto-cancel for ${reservationId}`, err),
        );

        // Alerte admin Telegram si cas indéterminé
        if (caseType === 'UNDETERMINED') {
            await this.telegram.sendAdminAlert(
                `🤖 <b>Annulation automatique - Responsabilité indéterminée</b>\n\n` +
                `Réservation : <code>${reservationId.slice(0, 8).toUpperCase()}</code>\n` +
                `Locataire : ${reservation.locataire?.prenom ?? 'N/A'}\n` +
                `Propriétaire : ${reservation.proprietaire?.prenom ?? 'N/A'}\n` +
                `Montant : ${montantTotal} FCFA\n` +
                `Remboursement : ${montantRembourse} FCFA (${refundPercent}%)\n` +
                `Compensation proprio : ${montantProprietaire} FCFA (${ownerCompensationPercent}%)\n\n` +
                `⚠️ <b>Investigation recommandée</b> pour déterminer la responsabilité\n` +
                `<a href="https://autoloc.sn/dashboard/admin/reservations/${reservationId}">Voir la réservation →</a>`,
            ).catch(() => { });
        }
    }

    // ── Helpers de notification ──────────────────────────────────────────────────

    /**
     * F4: Notifie les deux parties après auto-close (EN_COURS → TERMINEE)
     * et programme la demande d'avis au locataire.
     */
    private async notifyAutoClose(reservationId: string): Promise<void> {
        const res = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                locataireId: true,
                proprietaireId: true,
                locataire: { select: { email: true, telephone: true } },
                proprietaire: { select: { email: true, telephone: true } },
                vehicule: { select: { marque: true, modele: true } },
            },
        });
        if (!res) return;

        const vehicule = res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'véhicule';

        // Notifier locataire — location terminée
        await this.notification.send({
            type: 'reservation.checkout',
            userId: res.locataireId,
            email: res.locataire?.email ?? undefined,
            phone: res.locataire?.telephone ?? undefined,
            data: { reservationId, vehicule, isOwner: false },
        }).catch(() => { });

        // Notifier propriétaire — location terminée
        await this.notification.send({
            type: 'reservation.checkout',
            userId: res.proprietaireId,
            email: res.proprietaire?.email ?? undefined,
            phone: res.proprietaire?.telephone ?? undefined,
            data: { reservationId, vehicule, isOwner: true },
        }).catch(() => { });

        // Demande d'avis au locataire (2 min après)
        await this.queue.scheduleAvisRequest(reservationId).catch(() => { });
    }

    /**
     * F5: Notifie les deux parties après auto-cancel (CONFIRMEE → ANNULEE)
     * avec détails du remboursement selon responsabilité
     */
    private async notifyAutoCancel(
        reservationId: string,
        refundPercent: number,
        ownerCompensationPercent: number,
        caseType: string
    ): Promise<void> {
        const res = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                locataireId: true,
                proprietaireId: true,
                dateDebut: true,
                dateFin: true,
                totalLocataire: true,
                locataire: { select: { email: true, telephone: true, prenom: true } },
                proprietaire: { select: { email: true, telephone: true, prenom: true } },
                vehicule: { select: { marque: true, modele: true } },
            },
        });
        if (!res) return;

        const vehicule = res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'véhicule';

        // Messages selon le type de cas
        let raisonLocataire = '';
        let raisonProprietaire = '';

        if (caseType === 'OWNER_FAULT') {
            raisonLocataire = `Annulation : Litige non résolu. Vous serez remboursé intégralement (100%).`;
            raisonProprietaire = `Annulation : Litige non résolu de votre part. Aucune compensation.`;
        } else if (caseType === 'TENANT_NOSHOW') {
            raisonLocataire = `Annulation : No-show confirmé. Remboursement partiel (${refundPercent}%).`;
            raisonProprietaire = `Annulation : Locataire absent. Compensation de ${ownerCompensationPercent}% créditée.`;
        } else {
            raisonLocataire = `Annulation automatique : Aucun check-in effectué. Remboursement de ${refundPercent}% par protection client.`;
            raisonProprietaire = `Annulation automatique : Aucun check-in effectué. Compensation de ${ownerCompensationPercent}% créditée.`;
        }

        await Promise.all([
            this.notification.send({
                type: 'reservation.cancelled',
                userId: res.locataireId,
                email: res.locataire?.email ?? undefined,
                phone: res.locataire?.telephone ?? undefined,
                data: {
                    reservationId,
                    vehicule,
                    dateDebut: res.dateDebut,
                    dateFin: res.dateFin,
                    cancelledBy: 'SYSTEM',
                    raison: raisonLocataire,
                    refundPercent,
                    isOwner: false,
                },
            }),
            this.notification.send({
                type: 'reservation.cancelled',
                userId: res.proprietaireId,
                email: res.proprietaire?.email ?? undefined,
                phone: res.proprietaire?.telephone ?? undefined,
                data: {
                    reservationId,
                    vehicule,
                    dateDebut: res.dateDebut,
                    dateFin: res.dateFin,
                    cancelledBy: 'SYSTEM',
                    raison: raisonProprietaire,
                    ownerCompensationPercent,
                    isOwner: true,
                },
            }),
        ]).catch(() => { });
    }
}
