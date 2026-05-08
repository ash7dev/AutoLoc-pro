import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../infrastructure/queue/queue.service';
import { NotificationService } from '../infrastructure/notifications/notification.service';
import { TacitCheckinUseCase } from '../domain/reservation/use-cases/tacit-checkin.use-case';
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
        private readonly tacitCheckinUseCase: TacitCheckinUseCase,
    ) { }

    /**
     * Runs every 10 minutes.
     * Finds CONFIRMEE reservations where the entire day of dateDebut has passed
     * (i.e. dateDebut < today at 00:00) and no check-in from either party.
     * This gives both parties the full day of the reservation to do the check-in,
     * regardless of the start time (e.g. 05h00 reservation → auto-cancel starts next day at 00:00).
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleAutoCancel() {
        // Use UTC midnight — Senegal is UTC+0 so this aligns with local midnight regardless of server timezone
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        const stale = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { lt: startOfToday },
                checkinProprietaireLe: null,
                checkinLocataireLe: null,
            },
            select: { id: true, dateDebut: true },
        });

        if (stale.length === 0) return;

        this.logger.warn(
            `Auto-cancelling ${stale.length} stale reservation(s) with no check-in after 5h`,
        );

        for (const r of stale) {
            try {
                await this.prisma.reservation.update({
                    where: { id: r.id },
                    data: {
                        statut: 'ANNULEE',
                        annuleLe: new Date(),
                        raisonAnnulation:
                            'Contrat résilié automatiquement : aucun check-in n\'a été effectué par les deux parties à la date convenue de la location.',
                    },
                });
                this.logger.log(`Reservation ${r.id} auto-cancelled (dateDebut was ${r.dateDebut.toISOString()})`);

                // F5: Notifier les deux parties de l'annulation automatique
                await this.notifyAutoCancel(r.id).catch((err) =>
                    this.logger.error(`Failed to notify auto-cancel for ${r.id}`, err),
                );
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
     * Auto-close EN_COURS → TERMINEE après fin de location + 48h (fenêtre inspection proprio).
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
     * quand personne n'a fait le check-in.
     */
    private async notifyAutoCancel(reservationId: string): Promise<void> {
        const res = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                locataireId: true,
                proprietaireId: true,
                dateDebut: true,
                dateFin: true,
                locataire: { select: { email: true, telephone: true } },
                proprietaire: { select: { email: true, telephone: true } },
                vehicule: { select: { marque: true, modele: true } },
            },
        });
        if (!res) return;

        const vehicule = res.vehicule ? `${res.vehicule.marque} ${res.vehicule.modele}` : 'véhicule';
        const data = {
            reservationId,
            vehicule,
            dateDebut: res.dateDebut,
            dateFin: res.dateFin,
            cancelledBy: 'SYSTEM',
            raison: 'Annulation automatique : aucun check-in effectué à la date convenue.',
        };

        await Promise.all([
            this.notification.send({
                type: 'reservation.cancelled',
                userId: res.locataireId,
                email: res.locataire?.email ?? undefined,
                phone: res.locataire?.telephone ?? undefined,
                data: { ...data, isOwner: false },
            }),
            this.notification.send({
                type: 'reservation.cancelled',
                userId: res.proprietaireId,
                email: res.proprietaire?.email ?? undefined,
                phone: res.proprietaire?.telephone ?? undefined,
                data: { ...data, isOwner: true },
            }),
        ]).catch(() => { });
    }
}
