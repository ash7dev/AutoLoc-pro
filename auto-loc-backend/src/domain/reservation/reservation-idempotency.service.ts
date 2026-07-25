import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { IntouchWidgetConfig } from '../../infrastructure/payment/payment-provider.interface';
import { ModePaiementReservation } from '@prisma/client';

// ── Constants ──────────────────────────────────────────────────────────────────

const IDEMPOTENCY_TTL_S = 24 * 60 * 60; // 24h
const IDEM_PREFIX = 'idem:';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IdempotencyResult {
    reservationId: string;
    modePaiement: ModePaiementReservation;
    totalLocataire: string;
    montantPayeEnLigne: string;
    montantSoldeCheckin: string;
    montantCommissionEnLigne: string;
    montantProprietaireEnLigne: string;
    paymentUrl: string | null;
    /** Config widget TouchPay — présent pour le fournisseur INTOUCH */
    widgetConfig?: IntouchWidgetConfig;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ReservationIdempotencyService {
    constructor(
        private readonly redis: RedisService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Vérifie si une clé d'idempotence existe déjà (Redis fast-path, puis DB durable-path).
     * @returns Le résultat mis en cache si la clé existe, null sinon.
     */
    async checkExisting(key: string | undefined): Promise<IdempotencyResult | null> {
        if (!key) return null;

        // Fast path — Redis
        const redisVal = await this.redis.get(`${IDEM_PREFIX}${key}`);
        if (redisVal) {
            try {
                const parsed = JSON.parse(redisVal) as Partial<IdempotencyResult>;
                if (parsed?.reservationId) {
                    return this.withPaymentDefaults({
                        ...parsed,
                        reservationId: parsed.reservationId,
                    });
                }
            } catch {
                if (redisVal === 'processing') {
                    throw new ConflictException('Requête déjà en cours de traitement');
                }
                return this.withPaymentDefaults({ reservationId: redisVal, paymentUrl: null });
            }
        }

        // Durable path — DB (Redis TTL may have expired)
        const existing = await this.prisma.idempotencyKey.findUnique({
            where: { key },
            include: {
                reservation: {
                    select: {
                        id: true,
                        paymentUrl: true,
                        modePaiement: true,
                        totalLocataire: true,
                        montantPayeEnLigne: true,
                        montantSoldeCheckin: true,
                        montantCommissionEnLigne: true,
                        montantProprietaireEnLigne: true,
                    },
                },
            },
        });
        if (existing && existing.expiresAt > new Date()) {
            return {
                reservationId: existing.reservationId,
                modePaiement: existing.reservation.modePaiement,
                totalLocataire: existing.reservation.totalLocataire.toString(),
                montantPayeEnLigne: existing.reservation.montantPayeEnLigne.toString(),
                montantSoldeCheckin: existing.reservation.montantSoldeCheckin.toString(),
                montantCommissionEnLigne: existing.reservation.montantCommissionEnLigne.toString(),
                montantProprietaireEnLigne: existing.reservation.montantProprietaireEnLigne.toString(),
                paymentUrl: existing.paymentUrl ?? existing.reservation.paymentUrl ?? null,
            };
        }

        return null;
    }

    private withPaymentDefaults(result: Partial<IdempotencyResult> & { reservationId: string }): IdempotencyResult {
        return {
            reservationId: result.reservationId,
            modePaiement: result.modePaiement ?? ModePaiementReservation.TOTAL_EN_LIGNE,
            totalLocataire: result.totalLocataire ?? '0',
            montantPayeEnLigne: result.montantPayeEnLigne ?? result.totalLocataire ?? '0',
            montantSoldeCheckin: result.montantSoldeCheckin ?? '0',
            montantCommissionEnLigne: result.montantCommissionEnLigne ?? '0',
            montantProprietaireEnLigne: result.montantProprietaireEnLigne ?? '0',
            paymentUrl: result.paymentUrl ?? null,
            widgetConfig: result.widgetConfig,
        };
    }

    /**
     * Acquiert un verrou distribué via Redis SETNX.
     * Lève ConflictException si le verrou est déjà pris.
     * No-op si key est undefined.
     */
    async acquireLock(key: string | undefined): Promise<void> {
        if (!key) return;

        const locked = await this.redis.setNX(
            `${IDEM_PREFIX}${key}`,
            'processing',
            IDEMPOTENCY_TTL_S,
        );
        if (!locked) {
            throw new ConflictException('Requête déjà en cours de traitement');
        }
    }

    /**
     * Persiste le résultat dans Redis après un commit réussi.
     * Best-effort : ne lève pas d'exception en cas d'erreur Redis.
     */
    async commitResult(
        key: string | undefined,
        result: IdempotencyResult,
    ): Promise<void> {
        if (!key) return;

        await this.redis
            .set(`${IDEM_PREFIX}${key}`, JSON.stringify(result), IDEMPOTENCY_TTL_S)
            .catch(() => {
                /* best-effort */
            });
    }

    /**
     * Libère le verrou Redis en cas d'erreur (rollback).
     * Best-effort : ne lève pas d'exception.
     */
    async releaseLock(key: string | undefined): Promise<void> {
        if (!key) return;

        await this.redis.del(`${IDEM_PREFIX}${key}`).catch(() => {
            /* best-effort */
        });
    }

    /** TTL en secondes pour les clés d'idempotence en DB. */
    get ttlSeconds(): number {
        return IDEMPOTENCY_TTL_S;
    }
}
