import { Injectable, Logger } from '@nestjs/common';
import {
    CheckinLocataireSource,
    StatutReservation,
    TypeEtatLieu,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { CheckinSideEffectsService } from '../checkin-side-effects.service';
import { MIN_CHECKIN_ETAT_LIEU_PHOTOS } from '../reservation-checkin.constants';

const SYSTEM_TACIT_TAG = 'SYSTEM_TACIT_CHECKIN';

/**
 * Validation tacite du check-in locataire : après 24h sans action, même effet que double check-in
 * si état des lieux proprio présent et pas de litige.
 */
@Injectable()
export class TacitCheckinUseCase {
    private readonly logger = new Logger(TacitCheckinUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly checkinSideEffects: CheckinSideEffectsService,
        private readonly queue: QueueService,
    ) { }

    /** Appelé par un cron : traite toutes les réservations éligibles dont la fenêtre tacite est expirée. */
    async processDue(now: Date = new Date()): Promise<{ processed: number }> {
        const candidates = await this.prisma.reservation.findMany({
            where: {
                statut: StatutReservation.CONFIRMEE,
                checkinProprietaireLe: { not: null },
                checkinLocataireLe: null,
                tacitCheckinDeadlineLe: { lte: now },
                litige: null,
            },
            select: { id: true },
        });

        let processed = 0;
        for (const { id } of candidates) {
            const ok = await this.applyTacitCheckin(id, now);
            if (ok) processed += 1;
        }
        if (processed > 0) {
            this.logger.log(`Tacit check-in applied to ${processed} reservation(s)`);
        }
        return { processed };
    }

    private async applyTacitCheckin(reservationId: string, now: Date): Promise<boolean> {
        const snapshot = await this.prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.findFirst({
                where: {
                    id: reservationId,
                    statut: StatutReservation.CONFIRMEE,
                    checkinProprietaireLe: { not: null },
                    checkinLocataireLe: null,
                        tacitCheckinDeadlineLe: { lte: now },
                        litige: null,
                    },
                select: {
                    id: true,
                    dateFin: true,
                    locataire: { select: { telephone: true, prenom: true, email: true } },
                    proprietaire: { select: { telephone: true, prenom: true } },
                },
            });
            if (!reservation) return null;

            const photoCount = await tx.photoEtatLieu.count({
                where: { reservationId, type: TypeEtatLieu.CHECKIN },
            });
            if (photoCount < MIN_CHECKIN_ETAT_LIEU_PHOTOS) {
                this.logger.warn(
                    `Skip tacit check-in ${reservationId}: pas assez de photos CHECKIN (${photoCount})`,
                );
                return null;
            }

            const tacitTime = new Date();
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    checkinLocataireLe: tacitTime,
                    checkinLocataireSource: CheckinLocataireSource.SYSTEM_TACIT,
                    checkinLe: tacitTime,
                    statut: StatutReservation.EN_COURS,
                    tacitCheckinDeadlineLe: null,
                    updatedBySystem: true,
                },
            });

            await tx.reservationHistorique.create({
                data: {
                    reservationId,
                    ancienStatut: StatutReservation.CONFIRMEE,
                    nouveauStatut: StatutReservation.EN_COURS,
                    modifiePar: SYSTEM_TACIT_TAG,
                },
            });

            return {
                dateFin: reservation.dateFin,
                locataire: reservation.locataire,
                proprietaire: reservation.proprietaire,
            };
        });

        if (!snapshot) return false;

        try {
            await this.checkinSideEffects.runAfterFinalizedCheckin({
                reservationId,
                dateFin: snapshot.dateFin,
                locataire: snapshot.locataire,
                proprietaire: snapshot.proprietaire,
            });

            await this.queue
                .scheduleNotification({
                    type: 'reservation.checkin.tacit_applied',
                    data: {
                        reservationId,
                        locatairePhone: snapshot.locataire?.telephone ?? null,
                        locatairePrenom: snapshot.locataire?.prenom ?? null,
                        email: snapshot.locataire?.email ?? undefined,
                    },
                })
                .catch(() => { });
        } catch (err) {
            this.logger.error(`Post tacit check-in side effects failed for ${reservationId}`, err);
        }

        return true;
    }
}
