import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { getRedisOptions, getRedisHostFromUrl } from './redis.config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private redisUrl: string = '';

  constructor(private readonly configService: ConfigService) {
    this.redisUrl =
      this.configService.get<string>('REDIS_URL')?.trim() ?? '';
  }

  async onModuleInit(): Promise<void> {
    if (!this.redisUrl) {
      throw new Error('REDIS_URL is required for RedisService');
    }
    if (!this.redisUrl.startsWith('rediss://')) {
      throw new Error(
        'REDIS_URL must use rediss:// (TLS) for Upstash. Example: rediss://default:<password>@<host>:6379',
      );
    }
    const options = getRedisOptions(this.redisUrl);
    this.client = new Redis(this.redisUrl, options);

    this.client.on('error', (err: Error) => {
      process.stdout.write(`[Redis] error: ${err.message}\n`);
    });

    this.client.on('connect', () => {
      const host = getRedisHostFromUrl(this.redisUrl);
      process.stdout.write(`✅ Redis connected to ${host}\n`);
    });

    await this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.client = null;
    }
  }

  private getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  async ping(): Promise<string> {
    return this.getClient().ping();
  }

  async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = this.getClient();
    if (ttlSeconds != null && ttlSeconds > 0) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.getClient().del(key);
  }

  /**
   * Get Time To Live (TTL) of a key in seconds.
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    return this.getClient().ttl(key);
  }

  /**
   * Set if Not Exists (for distributed locks).
   * @returns true if key was set, false if key already existed
   */
  async setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const client = this.getClient();
    const ok = await client.set(key, value, 'EX', ttlSeconds, 'NX');
    return ok === 'OK';
  }

  /**
   * Supprime toutes les clés correspondant au pattern via SCAN + DEL (sûr en prod).
   * Exemple : delPattern('vehicles:search:*')
   */
  async delPattern(pattern: string): Promise<void> {
    const client = this.getClient();
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
      cursor = nextCursor;
      if (keys.length > 0) {
        await client.del(keys);
      }
    } while (cursor !== '0');
  }

  /**
   * 🚀 OPTIMISATION: Set with expiry (alias pour setex pour cohérence)
   */
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.getClient().setex(key, ttlSeconds, value);
  }

  /**
   * 🚀 OPTIMISATION: Distributed lock avec retry
   * @param key Lock key
   * @param ttlSeconds Lock TTL
   * @param maxRetries Maximum retry attempts
   * @param retryDelayMs Delay between retries
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(
    key: string,
    ttlSeconds: number = 10,
    maxRetries: number = 5,
    retryDelayMs: number = 100,
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const acquired = await this.setNX(key, '1', ttlSeconds);
      if (acquired) return true;

      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * (i + 1)));
    }
    return false;
  }

  /**
   * 🚀 OPTIMISATION: Release distributed lock
   */
  async releaseLock(key: string): Promise<void> {
    await this.del(key);
  }

  /**
   * 🚀 OPTIMISATION: Get with JSON parse
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * 🚀 OPTIMISATION: Set with JSON stringify
   */
  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  /**
   * 🚀 OPTIMISATION: Get multiple keys in a single round-trip
   * @returns Array of values (null for missing keys)
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    return this.getClient().mget(keys);
  }

  /**
   * 🚀 OPTIMISATION: Set multiple keys atomically
   */
  async mset(keyValues: [string, string][]): Promise<void> {
    if (keyValues.length === 0) return;
    const client = this.getClient();
    const flatArgs = keyValues.flatMap(([k, v]) => [k, v]);
    await client.mset(flatArgs);
  }

  /**
   * 🚀 OPTIMISATION: Increment counter (for analytics/metrics)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    return this.getClient().incrby(key, amount);
  }

  /**
   * 🚀 OPTIMISATION: Set expiry on existing key
   * @returns true if expiry was set, false if key doesn't exist
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.getClient().expire(key, ttlSeconds)) === 1;
  }

  /**
   * 🚀 MONITORING: Get Redis health with latency measurement
   */
  async getHealth(): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.ping();
      const latencyMs = Date.now() - start;
      return { status: 'UP', latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      return { status: 'DOWN', latencyMs };
    }
  }
}
