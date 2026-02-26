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

export interface CheckOutResult {
    reservationId: string;
    statut: StatutReservation;
    checkoutLe: Date;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CheckOutUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly stateMachine: ReservationStateMachine,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
    ): Promise<CheckOutResult> {
        // ── 1. Resolve proprietaire ────────────────────────────────────────
        const proprietaire = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!proprietaire) throw new ForbiddenException('Profile not completed');

        // ── 2. Fetch reservation ───────────────────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                locataire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');

        // ── 3. Ownership check ─────────────────────────────────────────────
        if (reservation.proprietaireId !== proprietaire.id) {
            throw new ForbiddenException('Access denied');
        }

        // ── 4. State machine: EN_COURS → TERMINEE ─────────────────────────
        this.stateMachine.transition(
            reservation.statut,
            StatutReservation.TERMINEE,
        );

        // ── 5. Transaction ─────────────────────────────────────────────────
        const checkoutLe = new Date();
        await this.prisma.$transaction(async (tx) => {
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    statut: StatutReservation.TERMINEE,
                    checkoutLe,
                },
            });

            await tx.reservationHistorique.create({
                data: {
                    reservationId,
                    ancienStatut: reservation.statut,
                    nouveauStatut: StatutReservation.TERMINEE,
                    modifiePar: proprietaire.id,
                },
            });
        });

        // ── 6. Side effects ────────────────────────────────────────────────
        // POST_CHECKOUT job for ratings, reviews, etc.
        await this.queue
            .schedulePostCheckout(reservationId)
            .catch(() => { });

        await this.queue
            .scheduleNotification({
                type: 'reservation.checkout',
                data: {
                    reservationId,
                    locatairePhone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                },
            })
            .catch(() => { });

        return {
            reservationId,
            statut: StatutReservation.TERMINEE,
            checkoutLe,
        };
    }
}
