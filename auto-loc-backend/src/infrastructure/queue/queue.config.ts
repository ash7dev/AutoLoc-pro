import { BullModuleOptions } from '@nestjs/bull';
import { redisRetryStrategy } from '../redis/redis.config';

const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 1000,
};

/**
 * Parse REDIS_URL into host, port, password for Bull (ioredis).
 * Supports rediss:// for TLS (Upstash).
 */
export function getBullRedisOptions(redisUrl: string): {
  host: string;
  port: number;
  password?: string;
  tls?: Record<string, unknown>;
  maxRetriesPerRequest: null;
  retryStrategy: (times: number) => number | null;
} {
  const url = redisUrl.trim();
  const parsed = new URL(url);
  const port = parsed.port ? parseInt(parsed.port, 10) : 6379;
  const password = parsed.password ? decodeURIComponent(parsed.password) : undefined;
  return {
    host: parsed.hostname,
    port,
    ...(password ? { password } : {}),
    ...(parsed.protocol === 'rediss:'
      ? { tls: {} }
      : {}),
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => redisRetryStrategy(times),
  };
}

export function getBullModuleOptions(redisUrl: string): BullModuleOptions {
  return {
    redis: getBullRedisOptions(redisUrl),
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  };
}

export const RESERVATION_QUEUE_NAME = 'reservation-jobs';
export const NOTIFICATION_QUEUE_NAME = 'notification-jobs';

export const RESERVATION_EXPIRY_JOB_NAME = 'reservation-expiry';
export const NOTIFICATION_JOB_NAME = 'notification';
