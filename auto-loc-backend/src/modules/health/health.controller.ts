import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { QueueService } from '../../infrastructure/queue/queue.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  async getHealth(): Promise<{
    ok: boolean;
    timestamp: string;
    redis: 'ok' | 'error';
    queues: 'ok' | 'error';
  }> {
    let redisStatus: 'ok' | 'error' = 'ok';
    let queueStatus: 'ok' | 'error' = 'ok';

    try {
      await this.redisService.ping();
    } catch {
      redisStatus = 'error';
    }

    try {
      await this.queueService.areQueuesReady();
    } catch {
      queueStatus = 'error';
    }

    return {
      ok: redisStatus === 'ok' && queueStatus === 'ok',
      timestamp: new Date().toISOString(),
      redis: redisStatus,
      queues: queueStatus,
    };
  }
}
