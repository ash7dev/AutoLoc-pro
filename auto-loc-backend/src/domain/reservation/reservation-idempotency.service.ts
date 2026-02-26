import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

// ── Constants ──────────────────────────────────────────────────────────────────

const IDEMPOTENCY_TTL_S = 24 * 60 * 60; // 24h
const IDEM_PREFIX = 'idem:';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface IdempotencyResult {
    reservationId: string;
    paymentUrl: string;
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
                const parsed = JSON.parse(redisVal) as IdempotencyResult;
                if (parsed?.reservationId) return parsed;
            } catch {
                if (redisVal === 'processing') {
                    throw new ConflictException('Request already in progress');
                }
                return { reservationId: redisVal, paymentUrl: '' };
            }
        }

        // Durable path — DB (Redis TTL may have expired)
        const existing = await this.prisma.idempotencyKey.findUnique({
            where: { key },
            include: { reservation: { select: { id: true, paymentUrl: true } } },
        });
        if (existing && existing.expiresAt > new Date()) {
            return {
                reservationId: existing.reservationId,
                paymentUrl:
                    existing.paymentUrl ?? existing.reservation.paymentUrl ?? '',
            };
        }

        return null;
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
            throw new ConflictException('Request already in progress');
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
