import {
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutReservation, StatutPaiement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { ReservationStateMachine } from '../reservation.state-machine';
import { ContractGenerationService } from '../contract-generation.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const LOCK_PREFIX = 'payment:confirm:';
const LOCK_TTL_SECONDS = 30;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ConfirmPaymentInput {
    transactionId?: string;
}

export interface ConfirmPaymentResult {
    reservationId: string;
    statut: StatutReservation;
    contratUrl?: string;
    /** true si le webhook a déjà été traité (idempotence) */
    alreadyProcessed?: boolean;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class ConfirmPaymentUseCase {
    private readonly logger = new Logger(ConfirmPaymentUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly queue: QueueService,
        private readonly stateMachine: ReservationStateMachine,
        private readonly contractGeneration: ContractGenerationService,
    ) { }

    /**
     * Confirme le paiement d'une réservation : EN_ATTENTE_PAIEMENT → PAYEE.
     * Génère le contrat PDF initial (statut ACTIF).
     *
     * Double protection idempotence :
     * 1. Redis SET NX EX 30 sur transactionId (verrou distribué)
     * 2. Vérification Paiement.statut en DB
     */
    async execute(
        reservationId: string,
        input: ConfirmPaymentInput = {},
    ): Promise<ConfirmPaymentResult> {
        const lockKey = `${LOCK_PREFIX}${input.transactionId ?? reservationId}`;

        // ── 1. Redis NX lock (protection contre double webhook simultané) ──
        const lockAcquired = await this.redis.setNX(lockKey, '1', LOCK_TTL_SECONDS);
        if (!lockAcquired) {
            this.logger.warn(
                `DUPLICATE_WEBHOOK: Lock already held for ${lockKey} — skipping`,
            );
            return {
                reservationId,
                statut: StatutReservation.PAYEE,
                alreadyProcessed: true,
            };
        }

        try {
            // ── 2. Fetch reservation + paiement ────────────────────────────
            const reservation = await this.prisma.reservation.findUnique({
                where: { id: reservationId },
                select: {
                    id: true,
                    statut: true,
                    proprietaireId: true,
                    locataireId: true,
                    paiement: {
                        select: { id: true, statut: true },
                    },
                },
            });
            if (!reservation) throw new NotFoundException('Reservation not found');

            // ── 3. Check if already processed (DB-level idempotence) ───────
            if (reservation.paiement?.statut === StatutPaiement.CONFIRME) {
                this.logger.warn(
                    `ALREADY_PROCESSED: Payment for reservation ${reservationId} already confirmed`,
                );
                return {
                    reservationId,
                    statut: reservation.statut,
                    alreadyProcessed: true,
                };
            }

            // ── 4. Check reservation is in valid state ──────────────────────
            const validStates: string[] = [
                StatutReservation.INITIEE,
                StatutReservation.EN_ATTENTE_PAIEMENT,
            ];
            if (!validStates.includes(reservation.statut)) {
                this.logger.warn(
                    `CONFLICT: Reservation ${reservationId} in state ${reservation.statut} — cannot confirm payment`,
                );
                return {
                    reservationId,
                    statut: reservation.statut,
                    alreadyProcessed: true,
                };
            }

            // ── 5. Validate state transition ───────────────────────────────
            this.stateMachine.transition(
                reservation.statut,
                StatutReservation.PAYEE,
            );

            // ── 6. Atomic transaction (Serializable) ───────────────────────
            await this.prisma.$transaction(
                async (tx) => {
                    await tx.reservation.update({
                        where: { id: reservationId },
                        data: { statut: StatutReservation.PAYEE },
                    });

                    if (reservation.paiement) {
                        await tx.paiement.update({
                            where: { id: reservation.paiement.id },
                            data: {
                                statut: StatutPaiement.CONFIRME,
                                ...(input.transactionId
                                    ? { idTransactionFournisseur: input.transactionId }
                                    : {}),
                            },
                        });
                    }

                    await tx.reservationHistorique.create({
                        data: {
                            reservationId,
                            ancienStatut: reservation.statut,
                            nouveauStatut: StatutReservation.PAYEE,
                            modifiePar: 'SYSTEM_PAYMENT',
                        },
                    });
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
            );

            this.logger.log(`Payment confirmed for reservation ${reservationId}`);

            // ── 7. Post-commit: Generate contract PDF (ACTIF) ──────────────
            const contrat = await this.contractGeneration
                .generateAndStore(reservationId, { statutContrat: 'ACTIF' })
                .catch((err) => {
                    this.logger.error(`Contract generation failed: ${err.message}`);
                    return null;
                });

            // ── 8. Post-commit: Schedule signature expiry + notifications ──
            await this.queue
                .scheduleSignatureExpiry(reservationId)
                .catch(() => { });

            await this.queue
                .scheduleNotification({
                    type: 'reservation.paid',
                    data: { reservationId },
                })
                .catch(() => { });

            return {
                reservationId,
                statut: StatutReservation.PAYEE,
                ...(contrat ? { contratUrl: contrat.contratUrl } : {}),
            };
        } finally {
            // ── 9. Release Redis lock ──────────────────────────────────────
            await this.redis.del(lockKey).catch(() => { });
        }
    }
}
