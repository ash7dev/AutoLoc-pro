import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CheckinLocataireSource, StatutReservation, TypeEtatLieu } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { RequestUser } from '../../../common/types/auth.types';
import { BusinessRuleException } from '../../../common/exceptions/business-rule.exception';

import { CheckinSideEffectsService } from '../checkin-side-effects.service';
import {
    MIN_CHECKIN_ETAT_LIEU_PHOTOS,
    TACIT_CHECKIN_MS,
} from '../reservation-checkin.constants';

// ── Types ──────────────────────────────────────────────────────────────────────

export enum CheckInRole {
    PROPRIETAIRE = 'PROPRIETAIRE',
    LOCATAIRE = 'LOCATAIRE',
}

export interface CheckInInput {
    role: CheckInRole;
    photoIds?: string[];
}

export interface CheckInResult {
    reservationId: string;
    statut: StatutReservation;
    checkinProprietaireLe: Date | null;
    checkinLocataireLe: Date | null;
    checkinLe: Date | null;
    /** true si les deux parties ont confirmé et le check-in est finalisé */
    finalized: boolean;
    /** Crédit wallet résultat (seulement si finalized) */
    walletCredited?: boolean;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class CheckInUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queue: QueueService,
        private readonly checkinSideEffects: CheckinSideEffectsService,
    ) { }

    async execute(
        user: RequestUser,
        reservationId: string,
        input: CheckInInput,
    ): Promise<CheckInResult> {
        // ── 1. Resolve utilisateur ─────────────────────────────────────────
        const utilisateur = await this.prisma.utilisateur.findUnique({
            where: { userId: user.sub },
            select: { id: true },
        });
        if (!utilisateur) throw new ForbiddenException('Profil incomplet');

        // ── 2. Fetch reservation ───────────────────────────────────────────
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            select: {
                id: true,
                statut: true,
                proprietaireId: true,
                locataireId: true,
                dateDebut: true,
                dateFin: true,
                checkinProprietaireLe: true,
                checkinLocataireLe: true,
                checkinLe: true,
                tacitCheckinDeadlineLe: true,
                locataire: { select: { telephone: true, prenom: true, email: true } },
                proprietaire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Réservation introuvable');

        // ── 3. Verify the user is the correct party ────────────────────────
        if (input.role === 'PROPRIETAIRE') {
            if (reservation.proprietaireId !== utilisateur.id) {
                throw new ForbiddenException('Seul le propriétaire peut confirmer en tant que propriétaire');
            }
        } else {
            if (reservation.locataireId !== utilisateur.id) {
                throw new ForbiddenException('Seul le locataire peut confirmer en tant que locataire');
            }
        }

        // ── 4. Already fully checked in? ───────────────────────────────────
        if (reservation.checkinLe) {
            throw new BusinessRuleException(
                'Le check-in a déjà été finalisé',
                'CHECKIN_ALREADY_FINALIZED',
            );
        }

        // ── 5. Already confirmed by this party? ────────────────────────────
        if (input.role === 'PROPRIETAIRE' && reservation.checkinProprietaireLe) {
            throw new BusinessRuleException(
                'Le propriétaire a déjà confirmé le check-in',
                'CHECKIN_ALREADY_CONFIRMED_OWNER',
            );
        }
        if (input.role === 'LOCATAIRE' && reservation.checkinLocataireLe) {
            throw new BusinessRuleException(
                'Le locataire a déjà confirmé le check-in',
                'CHECKIN_ALREADY_CONFIRMED_TENANT',
            );
        }

        // ── 6. State must be CONFIRMEE ─────────────────────────────────────
        if (reservation.statut !== StatutReservation.CONFIRMEE) {
            throw new BusinessRuleException(
                `Le check-in n'est possible que pour une réservation confirmée (statut actuel : ${reservation.statut})`,
                'CHECKIN_INVALID_STATUS',
            );
        }

        // ── 7. Verify dateDebut (J-1 tolérance) ───────────────────────────
        const now = new Date();
        const dateDebut = new Date(reservation.dateDebut);
        const oneDayBefore = new Date(dateDebut.getTime() - 24 * 60 * 60 * 1000);

        if (now < oneDayBefore) {
            throw new BusinessRuleException(
                `Le check-in n'est possible qu'à partir de la veille de la date de début (${dateDebut.toISOString().split('T')[0]})`,
                'CHECKIN_TOO_EARLY',
            );
        }

        // ── 7b. Propriétaire : au moins une photo d'état des lieux départ ───
        if (input.role === 'PROPRIETAIRE') {
            const photoCount = await this.prisma.photoEtatLieu.count({
                where: { reservationId, type: TypeEtatLieu.CHECKIN },
            });
            if (photoCount < MIN_CHECKIN_ETAT_LIEU_PHOTOS) {
                throw new BusinessRuleException(
                    'Au moins une photo d\'état des lieux (départ) est requise avant le check-in propriétaire.',
                    'CHECKIN_OWNER_PHOTOS_REQUIRED',
                );
            }
        }

        // ── 8. Determine if this confirmation finalizes check-in ───────────
        const otherPartyConfirmed =
            input.role === 'PROPRIETAIRE'
                ? !!reservation.checkinLocataireLe
                : !!reservation.checkinProprietaireLe;

        const willFinalize = otherPartyConfirmed;
        const confirmationTime = now;

        // ── 9. Transaction ─────────────────────────────────────────────────
        const updateData: Record<string, unknown> = {};
        if (input.role === 'PROPRIETAIRE') {
            updateData.checkinProprietaireLe = confirmationTime;
        } else {
            updateData.checkinLocataireLe = confirmationTime;
            updateData.checkinLocataireSource = CheckinLocataireSource.USER;
            updateData.tacitCheckinDeadlineLe = null;
        }

        if (willFinalize) {
            updateData.checkinLe = confirmationTime;
            updateData.statut = StatutReservation.EN_COURS;
            updateData.tacitCheckinDeadlineLe = null;
        } else if (input.role === 'PROPRIETAIRE') {
            updateData.tacitCheckinDeadlineLe = new Date(confirmationTime.getTime() + TACIT_CHECKIN_MS);
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.reservation.update({
                where: { id: reservationId },
                data: updateData,
            });

            if (willFinalize) {
                await tx.reservationHistorique.create({
                    data: {
                        reservationId,
                        ancienStatut: StatutReservation.CONFIRMEE,
                        nouveauStatut: StatutReservation.EN_COURS,
                        modifiePar: utilisateur.id,
                    },
                });
            }
        });

        // ── 10. Post-commit side effects (only if finalized) ───────────────
        let walletCredited = false;
        if (willFinalize) {
            const side = await this.checkinSideEffects.runAfterFinalizedCheckin({
                reservationId,
                dateFin: reservation.dateFin,
                locataire: reservation.locataire,
                proprietaire: reservation.proprietaire,
            });
            walletCredited = side.walletCredited;
        } else if (input.role === 'PROPRIETAIRE') {
            await this.queue
                .scheduleNotification({
                    type: 'reservation.checkin.owner_confirmed',
                    data: {
                        reservationId,
                        locatairePhone: reservation.locataire?.telephone ?? null,
                        proprietairePhone: reservation.proprietaire?.telephone ?? null,
                    },
                })
                .catch(() => { });

            await this.queue.scheduleTacitCheckinReminders(reservationId).catch(() => { });

            await this.queue
                .scheduleNotification({
                    type: 'reservation.checkin.tacit_window',
                    data: {
                        reservationId,
                        locatairePhone: reservation.locataire?.telephone ?? null,
                        locatairePrenom: reservation.locataire?.prenom ?? null,
                        email: reservation.locataire?.email ?? undefined,
                    },
                })
                .catch(() => { });
        } else {
            await this.queue
                .scheduleNotification({
                    type: 'reservation.checkin.tenant_confirmed',
                    data: {
                        reservationId,
                        locatairePhone: reservation.locataire?.telephone ?? null,
                        proprietairePhone: reservation.proprietaire?.telephone ?? null,
                    },
                })
                .catch(() => { });
        }

        return {
            reservationId,
            statut: willFinalize ? StatutReservation.EN_COURS : StatutReservation.CONFIRMEE,
            checkinProprietaireLe: input.role === 'PROPRIETAIRE' ? confirmationTime : reservation.checkinProprietaireLe,
            checkinLocataireLe: input.role === 'LOCATAIRE' ? confirmationTime : reservation.checkinLocataireLe,
            checkinLe: willFinalize ? confirmationTime : null,
            finalized: willFinalize,
            walletCredited: willFinalize ? walletCredited : undefined,
        };
    }
}
