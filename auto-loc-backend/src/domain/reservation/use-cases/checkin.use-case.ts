import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { ReservationStateMachine } from '../reservation.state-machine';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CheckInResult {
    reservationId: string;
    statut: StatutReservation;
    checkinLe: Date;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CheckInUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly stateMachine: ReservationStateMachine,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
    ): Promise<CheckInResult> {
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
                dateDebut: true,
                dateFin: true,
                locataire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');

        // ── 3. Ownership check ─────────────────────────────────────────────
        if (reservation.proprietaireId !== proprietaire.id) {
            throw new ForbiddenException('Access denied');
        }

        // ── 4. State machine: CONFIRMEE → EN_COURS ─────────────────────────
        this.stateMachine.transition(
            reservation.statut,
            StatutReservation.EN_COURS,
        );

        // ── 5. Verify dateDebut (J-1 tolérance) ───────────────────────────
        const now = new Date();
        const dateDebut = new Date(reservation.dateDebut);
        const oneDayBefore = new Date(dateDebut.getTime() - 24 * 60 * 60 * 1000);

        if (now < oneDayBefore) {
            throw new BusinessRuleException(
                `Le check-in n'est possible qu'à partir de la veille de la date de début (${dateDebut.toISOString().split('T')[0]})`,
                'CHECKIN_TOO_EARLY',
            );
        }

        // ── 6. Transaction ─────────────────────────────────────────────────
        const checkinLe = now;
        await this.prisma.$transaction(async (tx) => {
            await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    statut: StatutReservation.EN_COURS,
                    checkinLe,
                },
            });

            await tx.reservationHistorique.create({
                data: {
                    reservationId,
                    ancienStatut: reservation.statut,
                    nouveauStatut: StatutReservation.EN_COURS,
                    modifiePar: proprietaire.id,
                },
            });
        });

        // ── 7. Side effects ────────────────────────────────────────────────
        // Schedule auto-close 24h after dateFin
        await this.queue
            .scheduleAutoClose(reservationId, reservation.dateFin)
            .catch(() => { });

        await this.queue
            .scheduleNotification({
                type: 'reservation.checkin',
                data: {
                    reservationId,
                    locatairePhone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                },
            })
            .catch(() => { });

        return {
            reservationId,
            statut: StatutReservation.EN_COURS,
            checkinLe,
        };
    }
}
