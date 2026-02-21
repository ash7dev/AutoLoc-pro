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
   * Set if Not Exists (for distributed locks).
   * @returns true if key was set, false if key already existed
   */
  async setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const client = this.getClient();
    const ok = await client.set(key, value, 'EX', ttlSeconds, 'NX');
    return ok === 'OK';
  }
}
