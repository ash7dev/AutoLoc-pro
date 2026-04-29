import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { RequestUser } from '../../../common/types/auth.types';
import { ReservationStateMachine } from '../reservation.state-machine';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ConfirmReservationResult {
    reservationId: string;
    statut: StatutReservation;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class ConfirmReservationUseCase {
    private readonly logger = new Logger(ConfirmReservationUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
        input: { heureDebut: string }
    ): Promise<ConfirmReservationResult> {
        // 1. Resolve proprietaire
        const proprietaire = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!proprietaire) throw new ForbiddenException('Profil incomplet');

        // 2. Fetch reservation
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                locataireId: true,
                dateDebut: true,
                dateFin: true,
                vehicule: { select: { marque: true, modele: true } },
                locataire: { select: { telephone: true, prenom: true, statutKyc: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Réservation introuvable');

        // 3. Ownership check
        if (reservation.proprietaireId !== proprietaire.id) {
            throw new ForbiddenException('Accès refusé');
        }

        // 3.5. Idempotence — déjà confirmée, on retourne silencieusement
        if (reservation.statut === StatutReservation.CONFIRMEE) {
            return { reservationId, statut: StatutReservation.CONFIRMEE };
        }

        // 3.6. Vérification KYC locataire — seul le statut VERIFIE est accepté
        if (reservation.locataire?.statutKyc !== 'VERIFIE') {
            throw new BusinessRuleException(
                "Le locataire n'a pas encore été vérifié",
                'TENANT_KYC_NOT_VERIFIED',
            );
        }

        // 4. State machine: PAYEE → CONFIRMEE
        ReservationStateMachine.transition(
            reservation.statut,
            StatutReservation.CONFIRMEE,
        );

        // 4.5. Calculer les nouvelles dates avec heure fixe
        const [hours, minutes] = input.heureDebut.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new BusinessRuleException(
                "L'heure de début doit être au format HH:mm valide",
                'INVALID_TIME_FORMAT'
            );
        }

        const newDateDebut = new Date(reservation.dateDebut);
        newDateDebut.setUTCHours(hours, minutes, 0, 0);

        const newDateFin = new Date(reservation.dateFin);
        // Heure de fin = heure de début + 1 heure de courtoisie
        newDateFin.setUTCHours(hours + 1, minutes, 0, 0);

        // 5. Transactional update
        const updated = await this.prisma.$transaction(async (tx) => {
            const res = await tx.reservation.update({
                where: { id: reservationId },
                data: {
                    statut: StatutReservation.CONFIRMEE,
                    confirmeeLe: new Date(),
                    dateDebut: newDateDebut,
                    dateFin: newDateFin,
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
            .scheduleCheckoutReminder(reservationId, reservation.dateFin)
            .catch(() => { });

        this.queue.scheduleNotification({
                type: 'reservation.confirmed',
                data: {
                    reservationId,
                    userId: reservation.locataireId,
                    phone: reservation.locataire?.telephone ?? null,
                    locatairePrenom: reservation.locataire?.prenom ?? null,
                    vehicule: reservation.vehicule ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}` : 'véhicule',
                    dateDebut: newDateDebut,
                    dateFin: newDateFin,
                },
            })
            .catch(() => { });

        // 7. Regenerate contract PDF with ACTIF status (EN_COURS → ACTIF)
        // DÉLÉGUÉ À LA QUEUE pour rendre la réponse instantanée (Playwright + Cloudinary = LENT)
        await this.queue
            .scheduleContractGeneration(reservationId, { statutContrat: 'ACTIF' })
            .catch((err) => {
                this.logger.warn(`Failed to schedule contract regeneration for ${reservationId}: ${err.message}`);
            });

        return { reservationId: updated.id, statut: updated.statut };
    }
}
