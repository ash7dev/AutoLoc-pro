import { RedisOptions } from 'ioredis';

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

/**
 * Retry strategy: exponential backoff, max 3 attempts.
 * Used for both Redis (cache/locks) and Bull queues.
 */
export function redisRetryStrategy(retries: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, retries), MAX_DELAY_MS);
}

/**
 * Build ioredis options from REDIS_URL (Upstash: rediss:// with TLS).
 * Used by RedisService for cache and distributed locks.
 */
export function getRedisOptions(redisUrl: string): RedisOptions {
  return {
    ...(redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => {
      return redisRetryStrategy(times);
    },
    lazyConnect: true,
    enableReadyCheck: false,
  };
}

/**
 * Extract host from REDIS_URL for logging (e.g. "ample-treefrog-35102.upstash.io").
 */
export function getRedisHostFromUrl(redisUrl: string): string {
  try {
    const u = new URL(redisUrl);
    return u.hostname;
  } catch {
    return 'redis';
  }
}
