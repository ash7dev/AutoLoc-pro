import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

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

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Runs every 15 minutes.
     * Finds CONFIRMEE reservations where dateDebut + 5h ≤ now and no check-in.
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleAutoCancel() {
        const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);

        const stale = await this.prisma.reservation.findMany({
            where: {
                statut: 'CONFIRMEE',
                dateDebut: { lte: fiveHoursAgo },
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
                            'Auto-annulée : aucun check-in effectué dans les 5h suivant le début de la location.',
                    },
                });
                this.logger.log(`Reservation ${r.id} auto-cancelled (dateDebut was ${r.dateDebut.toISOString()})`);
            } catch (err) {
                this.logger.error(`Failed to auto-cancel reservation ${r.id}`, err);
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
