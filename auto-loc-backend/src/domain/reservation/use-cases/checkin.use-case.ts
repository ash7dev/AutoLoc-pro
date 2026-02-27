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
import { CreditWalletUseCase } from '../../wallet/use-cases/credit-wallet.use-case';

// ── Types ──────────────────────────────────────────────────────────────────────

export type CheckInRole = 'PROPRIETAIRE' | 'LOCATAIRE';

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
        private readonly stateMachine: ReservationStateMachine,
        private readonly creditWallet: CreditWalletUseCase,
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
        if (!utilisateur) throw new ForbiddenException('Profile not completed');

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
                locataire: { select: { telephone: true, prenom: true } },
                proprietaire: { select: { telephone: true, prenom: true } },
            },
        });
        if (!reservation) throw new NotFoundException('Reservation not found');

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
            this.stateMachine.transition(
                reservation.statut,
                StatutReservation.EN_COURS,
            );
            // If we reach here, the state machine allows it (shouldn't happen for non-CONFIRMEE)
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
        }

        if (willFinalize) {
            updateData.checkinLe = confirmationTime;
            updateData.statut = StatutReservation.EN_COURS;
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
            // 💰 Crédit wallet propriétaire
            try {
                const walletResult = await this.creditWallet.execute(reservationId);
                walletCredited = !walletResult.alreadyCredited;
            } catch (err) {
                // Log but don't fail the check-in
                // Wallet credit can be retried via admin or background job
                const errMsg = err instanceof Error ? err.message : String(err);
                process.stderr.write(`[CheckIn] Wallet credit failed for ${reservationId}: ${errMsg}\n`);
            }

            // Schedule auto-close 24h after dateFin
            await this.queue
                .scheduleAutoClose(reservationId, reservation.dateFin)
                .catch(() => { });

            // Notifications
            await this.queue
                .scheduleNotification({
                    type: 'reservation.checkin',
                    data: {
                        reservationId,
                        locatairePhone: reservation.locataire?.telephone ?? null,
                        locatairePrenom: reservation.locataire?.prenom ?? null,
                        proprietairePhone: reservation.proprietaire?.telephone ?? null,
                        proprietairePrenom: reservation.proprietaire?.prenom ?? null,
                    },
                })
                .catch(() => { });

            // Notification wallet
            if (walletCredited) {
                await this.queue
                    .scheduleNotification({
                        type: 'wallet.credited',
                        data: {
                            reservationId,
                            proprietairePhone: reservation.proprietaire?.telephone ?? null,
                            proprietairePrenom: reservation.proprietaire?.prenom ?? null,
                        },
                    })
                    .catch(() => { });
            }
        } else {
            // Notify the other party that they need to confirm
            const notifType = input.role === 'PROPRIETAIRE'
                ? 'reservation.checkin.owner_confirmed'
                : 'reservation.checkin.tenant_confirmed';

            await this.queue
                .scheduleNotification({
                    type: notifType,
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
