import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../infrastructure/queue/queue.service';

/**
 * Auto-cancel unchecked-in reservations.
 *
 * Business rule: if a reservation is CONFIRMEE and dateDebut was ≥5h ago
 * without any check-in from either party, the reservation is auto-cancelled
 * to protect both parties from no-shows.
 */
@Injectable()
export class ReservationAutoCloseJob {
    private readonly logger = new Logger(ReservationAutoCloseJob.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
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
            } catch (err) {
                this.logger.error(`Failed to auto-cancel reservation ${r.id}`, err);
            }
        }
    }

    /**
     * Runs every day at 13:00 UTC (= 13h00 Dakar, UTC+0).
     * Sends a reminder to both parties for reservations starting TOMORROW
     * that have not yet been checked in.
     */
    @Cron('0 13 * * *')
    async handleCheckinReminderVeille() {
        const tomorrowStart = new Date();
        tomorrowStart.setUTCHours(0, 0, 0, 0);
        tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setUTCDate(tomorrowEnd.getUTCDate() + 1);

        const upcoming = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { gte: tomorrowStart, lt: tomorrowEnd },
                checkinLe: null,
            },
            select: {
                id: true,
                dateDebut: true,
                proprietaire: { select: { prenom: true, email: true, telephone: true } },
                locataire: { select: { prenom: true, email: true, telephone: true } },
            },
        });

        if (upcoming.length === 0) return;
        this.logger.log(`Sending veille check-in reminders for ${upcoming.length} reservation(s)`);

        for (const r of upcoming) {
            const dateLabel = r.dateDebut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            const parties = [
                { prenom: r.proprietaire?.prenom, email: r.proprietaire?.email },
                { prenom: r.locataire?.prenom, email: r.locataire?.email },
            ];
            for (const party of parties) {
                if (!party.email) continue;
                await this.queue.scheduleNotification({
                    type: 'reservation.checkin.reminder_veille',
                    data: {
                        reservationId: r.id,
                        prenom: party.prenom ?? '',
                        dateDebut: dateLabel,
                        email: party.email,
                    },
                }).catch(() => { });
            }
        }
    }

    /**
     * Runs every day at 22:00 UTC (= 22h00 Dakar, UTC+0).
     * Sends an urgent reminder to both parties for reservations starting TODAY
     * that still have no finalized check-in — warns that auto-cancel happens at midnight.
     */
    @Cron('0 22 * * *')
    async handleCheckinReminderJourJ() {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const todayEnd = new Date(todayStart);
        todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

        const atRisk = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { gte: todayStart, lt: todayEnd },
                checkinLe: null,
            },
            select: {
                id: true,
                dateDebut: true,
                proprietaire: { select: { prenom: true, email: true, telephone: true } },
                locataire: { select: { prenom: true, email: true, telephone: true } },
            },
        });

        if (atRisk.length === 0) return;
        this.logger.warn(`Sending urgent jour-J check-in reminders for ${atRisk.length} reservation(s) at risk of auto-cancel`);

        for (const r of atRisk) {
            const dateLabel = r.dateDebut.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            const parties = [
                { prenom: r.proprietaire?.prenom, email: r.proprietaire?.email },
                { prenom: r.locataire?.prenom, email: r.locataire?.email },
            ];
            for (const party of parties) {
                if (!party.email) continue;
                await this.queue.scheduleNotification({
                    type: 'reservation.checkin.reminder_jour',
                    data: {
                        reservationId: r.id,
                        prenom: party.prenom ?? '',
                        dateDebut: dateLabel,
                        email: party.email,
                    },
                }).catch(() => { });
            }
        }
    }

    /**
     * Auto-close EN_COURS reservations past dateFin.
     * Runs every 30 minutes.
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleAutoClose() {
        const now = new Date();

        const expired = await this.prisma.reservation.findMany({
            where: {
                statut: 'EN_COURS',
                dateFin: { lt: now },
            },
            select: { id: true },
        });

        if (expired.length === 0) return;

        this.logger.log(`Auto-closing ${expired.length} expired EN_COURS reservation(s)`);

        for (const r of expired) {
            try {
                await this.prisma.reservation.update({
                    where: { id: r.id },
                    data: {
                        statut: 'TERMINEE',
                        checkoutLe: now,
                    },
                });
            } catch (err) {
                this.logger.error(`Failed to auto-close reservation ${r.id}`, err);
            }
        }
    }
}
