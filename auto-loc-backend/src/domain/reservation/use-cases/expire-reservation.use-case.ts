import { Injectable, Logger } from '@nestjs/common';
import { Prisma, StatutReservation, StatutPaiement } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { ContractGenerationService } from '../contract-generation.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const SEARCH_CACHE_PREFIX = 'vehicles:search:';

// ── Types ──────────────────────────────────────────────────────────────────────

interface LockedReservation {
    id: string;
    statut: StatutReservation;
}

export interface ExpireReservationResult {
    action: 'EXPIRED' | 'SKIPPED';
    reason?: string;
}

// ── Use Case ───────────────────────────────────────────────────────────────────

@Injectable()
export class ExpireReservationUseCase {
    private readonly logger = new Logger(ExpireReservationUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly contractGeneration: ContractGenerationService,
    ) { }

    /**
     * Expire une réservation si le paiement n'a pas été reçu.
     * Utilise SELECT FOR UPDATE pour protéger contre la race condition
     * avec ConfirmPayment.
     */
    async execute(reservationId: string): Promise<ExpireReservationResult> {
        const result = await this.prisma.$transaction(
            async (tx) => {
                // ── 1. Lock reservation via SELECT FOR UPDATE ──────────────
                const locked = await tx.$queryRaw<LockedReservation[]>`
                    SELECT id, statut
                    FROM "Reservation"
                    WHERE id = ${reservationId}
                    FOR UPDATE
                `;

                if (!locked.length) {
                    this.logger.warn(`EXPIRE_SKIPPED: Reservation ${reservationId} not found`);
                    return { action: 'SKIPPED' as const, reason: 'NOT_FOUND' };
                }

                const reservation = locked[0];

                // ── 2. Check payment status (race condition guard) ─────────
                const paiement = await tx.paiement.findUnique({
                    where: { reservationId },
                    select: { id: true, statut: true },
                });

                if (paiement?.statut === StatutPaiement.CONFIRME) {
                    this.logger.log(
                        `EXPIRE_SKIPPED: Reservation ${reservationId} — payment already confirmed (race condition won by payment)`,
                    );
                    return { action: 'SKIPPED' as const, reason: 'PAYMENT_CONFIRMED' };
                }

                // ── 3. Check reservation status ────────────────────────────
                const expirableStatuses: StatutReservation[] = [
                    StatutReservation.INITIEE,
                    StatutReservation.EN_ATTENTE_PAIEMENT,
                ];

                if (!expirableStatuses.includes(reservation.statut)) {
                    this.logger.log(
                        `EXPIRE_SKIPPED_WRONG_STATUS: Reservation ${reservationId} is ${reservation.statut}`,
                    );
                    return { action: 'SKIPPED' as const, reason: 'WRONG_STATUS' };
                }

                // ── 4. Expire: update reservation + paiement ───────────────
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: {
                        statut: StatutReservation.ANNULEE,
                        annuleLe: new Date(),
                        raisonAnnulation: 'Paiement non reçu (expiration automatique)',
                        updatedBySystem: true,
                    },
                });

                if (paiement) {
                    await tx.paiement.update({
                        where: { id: paiement.id },
                        data: { statut: StatutPaiement.ECHOUE },
                    });
                }

                // ── 5. Historique ──────────────────────────────────────────
                await tx.reservationHistorique.create({
                    data: {
                        reservationId,
                        ancienStatut: reservation.statut,
                        nouveauStatut: StatutReservation.ANNULEE,
                        modifiePar: 'SYSTEM_EXPIRY',
                    },
                });

                // ── 6. Invalidate vehicle cache ────────────────────────────
                // Fetch vehicle city for cache invalidation
                const res = await tx.reservation.findUnique({
                    where: { id: reservationId },
                    select: { vehicule: { select: { ville: true } } },
                });
                const city = res?.vehicule?.ville?.toLowerCase?.() ?? '';
                const pattern = city
                    ? `${SEARCH_CACHE_PREFIX}${city}:*`
                    : `${SEARCH_CACHE_PREFIX}*`;

                // Redis delPattern is called outside the transaction lock,
                // but since we're inside $transaction callback, we do it here
                // as best-effort
                await this.redis.delPattern(pattern).catch(() => { });

                this.logger.log(`EXPIRED: Reservation ${reservationId} expired (was ${reservation.statut})`);

                return { action: 'EXPIRED' as const };
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
        );

        // ── 7. Post-commit: Regenerate contract with EXPIRÉ watermark ────
        if (result.action === 'EXPIRED') {
            await this.contractGeneration
                .generateAndStore(reservationId, {
                    statutContrat: 'EXPIRE',
                    raisonAnnulation: 'Expiration du délai de paiement',
                    dateAnnulation: new Date().toLocaleDateString('fr-FR'),
                })
                .catch(() => { });
        }

        return result;
    }
}
