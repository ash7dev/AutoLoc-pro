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
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { RevalidateService } from '../../../infrastructure/revalidate/revalidate.service';

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
        private readonly revalidate: RevalidateService,
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
        if (!proprietaire) throw new ForbiddenException('Profil incomplet');

        // ── 2. Fetch reservation ───────────────────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                locataireId: true,
                dateFin: true,
                checkoutLe: true,
                locataire: { select: { telephone: true, prenom: true } },
                proprietaire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Réservation introuvable');

        // ── 3. Ownership check ─────────────────────────────────────────────
        if (reservation.proprietaireId !== proprietaire.id) {
            throw new ForbiddenException('Accès refusé');
        }

        // ── 4. Guards ──────────────────────────────────────────────────────
        if (reservation.checkoutLe) {
            throw new BusinessRuleException(
                'Le check-out a déjà été effectué',
                'CHECKOUT_ALREADY_FINALIZED',
            );
        }

        if (reservation.statut !== StatutReservation.EN_COURS) {
            throw new BusinessRuleException(
                `Le check-out n'est possible que pour une réservation en cours (statut : ${reservation.statut})`,
                'CHECKOUT_INVALID_STATUS',
            );
        }

        const now = new Date();
        const dateFin = new Date(reservation.dateFin);
        // Allow checkout from 00:00 on the return day
        dateFin.setHours(0, 0, 0, 0);
        if (now < dateFin) {
            throw new BusinessRuleException(
                `Le check-out n'est disponible qu'à partir du ${dateFin.toISOString().split('T')[0]}`,
                'CHECKOUT_TOO_EARLY',
            );
        }

        // ── 4b. State machine: EN_COURS → TERMINEE ────────────────────────
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

        // ── 6. Side effects ────────────────────────────────────────────────────────
        // POST_CHECKOUT job for ratings, reviews, etc.
        await this.queue
            .schedulePostCheckout(reservationId)
            .catch(() => { });

        await this.queue
            .scheduleAvisRequest(reservationId)
            .catch(() => { });

        // Notification locataire
        await this.queue
            .scheduleNotification({
                type: 'reservation.checkout',
                data: {
                    reservationId,
                    userId: reservation.locataireId,
                    phone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                    isOwner: false,
                },
            })
            .catch(() => { });

        // Notification propriétaire — informé que la location est terminée
        await this.queue
            .scheduleNotification({
                type: 'reservation.checkout',
                data: {
                    reservationId,
                    userId: reservation.proprietaireId,
                    phone: reservation.proprietaire?.telephone ?? null,
                    proprietairePrenom: reservation.proprietaire?.prenom ?? null,
                    isOwner: true,
                },
            })
            .catch(() => { });

        // ── 7. Revalidate Next.js cache ────────────────────────────────────
        // Invalider le cache pour que les changements soient immédiatement visibles
        this.revalidate.revalidateTag(`reservation-${reservationId}`).catch(() => { });
        this.revalidate.revalidatePath(`/dashboard/owner/reservations/${reservationId}`).catch(() => { });
        this.revalidate.revalidatePath(`/dashboard/renter/reservations/${reservationId}`).catch(() => { });
        this.revalidate.revalidatePath('/reservations').catch(() => { });

        return {
            reservationId,
            statut: StatutReservation.TERMINEE,
            checkoutLe,
        };
    }
}
