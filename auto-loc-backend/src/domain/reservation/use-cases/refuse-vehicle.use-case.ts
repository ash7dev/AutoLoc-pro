import {
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutReservation, TypeEtatLieu } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { TelegramService } from '../../../infrastructure/telegram/telegram.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';
import { ReservationStateMachine } from '../reservation.state-machine';

export interface RefuseVehicleInput {
    raison: string;
}

export interface RefuseVehicleResult {
    reservationId: string;
    statut: StatutReservation;
    litigeId: string;
}

@Injectable()
export class RefuseVehicleUseCase {
    private readonly logger = new Logger(RefuseVehicleUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly telegram: TelegramService,
        private readonly stateMachine: ReservationStateMachine,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
        input: RefuseVehicleInput,
    ): Promise<RefuseVehicleResult> {
        // ── 1. Intervenant ─────────────────────────────────────────
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true, nom: true, prenom: true },
        });
        if (!utilisateur) throw new ForbiddenException('Profil incomplet');

        // ── 2. Récupération Réservation ────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                locataireId: true,
                proprietaireId: true,
                dateDebut: true,
                locataire: { select: { prenom: true, nom: true, telephone: true } },
                proprietaire: { select: { prenom: true, nom: true, telephone: true } },
            },
        });

        if (!reservation) {
            throw new NotFoundException('Réservation introuvable');
        }

        if (reservation.locataireId !== utilisateur.id) {
            throw new ForbiddenException('Seul le locataire peut refuser le véhicule lors du check-in');
        }

        // ── 3. Vérification de la Machine à États ──────────────────
        try {
            this.stateMachine.transition(reservation.statut, StatutReservation.LITIGE);
        } catch (e) {
            throw new BusinessRuleException(
                `Le refus du véhicule n'est pas possible dans le statut actuel (${reservation.statut}).`,
                'REFUSAL_INVALID_STATUS',
            );
        }

        // ── 4. Validation des photos obligatoires ──────────────────
        const photoCount = await this.prisma.photoEtatLieu.count({
            where: { reservationId, type: TypeEtatLieu.CHECKIN },
        });

        if (photoCount < 1) {
            throw new BusinessRuleException(
                "Vous devez fournir au moins une photo prouvant la non-conformité du véhicule.",
                'REFUSAL_PHOTOS_REQUIRED',
            );
        }

        if (!input.raison || input.raison.length < 15) {
            throw new BusinessRuleException(
                "Le motif du refus doit faire au moins 15 caractères.",
                'REFUSAL_REASON_TOO_SHORT',
            );
        }

        // ── 5. Transaction Atomique ────────────────────────────────
        const result = await this.prisma.$transaction(
            async (tx) => {
                // a. Mettre à jour la réservation vers LITIGE
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: {
                        statut: StatutReservation.LITIGE,
                        updatedBySystem: false,
                    },
                });

                // b. Créer le Litige
                const litige = await tx.litige.create({
                    data: {
                        reservationId,
                        description: `[REFUS AU CHECK-IN] ${input.raison}`,
                        statut: 'EN_ATTENTE',
                    },
                });

                // c. Historique
                await tx.reservationHistorique.create({
                    data: {
                        reservationId,
                        ancienStatut: reservation.statut,
                        nouveauStatut: StatutReservation.LITIGE,
                        modifiePar: utilisateur.id,
                    },
                });

                return litige;
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
        );

        this.logger.log(`Réservation ${reservationId} passée en LITIGE (Refus du Locataire)`);

        // ── 6. Effets de bord asynchrones ──────────────────────────
        
        // Alerte au support
        await this.telegram.sendAdminAlert(
            `🚨 <b>NO-GO AU CHECK-IN (REFUS VÉHICULE)</b>\n` +
            `Locataire: ${reservation.locataire.prenom} ${reservation.locataire.nom}\n` +
            `Proprietaire: ${reservation.proprietaire.prenom} ${reservation.proprietaire.nom}\n` +
            `Motif : ${input.raison}\n` +
            `Photos fournies : ${photoCount}\n` +
            `Action : La location est bloquée en statut LITIGE.\n` +
            `<a href="https://autoloc.sn/dashboard/admin/litiges">Examiner le litige →</a>`
        ).catch((err) => this.logger.error(`Erreur notification Telegram: ${err.message}`));

        // Notification asynchrone pour avertir le propriétaire (Optionnel mais recommandé)
        await this.queue.scheduleNotification({
            type: 'reservation.dispute_opened',
            data: {
                reservationId,
                role: 'PROPRIETAIRE',
                raison: 'Le locataire a refusé le véhicule. L\'équipe AutoLoc va examiner la situation.',
                prenomDeclarant: reservation.locataire.prenom ?? 'Le locataire',
            },
        }).catch(() => {});

        return {
            reservationId,
            statut: StatutReservation.LITIGE,
            litigeId: result.id,
        };
    }
}
