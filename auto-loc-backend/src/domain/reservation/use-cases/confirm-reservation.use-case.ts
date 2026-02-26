import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { RequestUser } from '../../../common/types/auth.types';
import { ReservationStateMachine } from '../reservation.state-machine';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ConfirmReservationResult {
    reservationId: string;
    statut: StatutReservation;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class ConfirmReservationUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
    ): Promise<ConfirmReservationResult> {
        // 1. Resolve proprietaire
        const proprietaire = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!proprietaire) throw new ForbiddenException('Profile not completed');

        // 2. Fetch reservation
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                dateDebut: true,
                locataire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');

        // 3. Ownership check
        if (reservation.proprietaireId !== proprietaire.id) {
            throw new ForbiddenException('Access denied');
        }

        // 4. State machine: PAYEE → CONFIRMEE
        ReservationStateMachine.transition(
            reservation.statut,
            StatutReservation.CONFIRMEE,
        );

        // 5. Transactional update
        const updated = await this.prisma.$transaction(async (tx) => {
            const res = await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    statut: StatutReservation.CONFIRMEE,
                    confirmeeLe: new Date(),
                },
                select: { id: true, statut: true },
            });

            await tx.reservationHistorique.create({
                data: {
                    reservationId,
                    ancienStatut: reservation.statut,
                    nouveauStatut: StatutReservation.CONFIRMEE,
                    modifiePar: proprietaire.id,
                },
            });

            return res;
        });

        // 6. Side effects (best-effort)
        await this.queue
            .scheduleCheckinReminder(reservationId, reservation.dateDebut)
            .catch(() => { });

        await this.queue
            .scheduleNotification({
                type: 'reservation.confirmed',
                data: {
                    reservationId,
                    locatairePhone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                },
            })
            .catch(() => { });

        return { reservationId: updated.id, statut: updated.statut };
    }
}
