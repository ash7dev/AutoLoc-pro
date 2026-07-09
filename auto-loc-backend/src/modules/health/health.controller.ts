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
    redis: {
      status: 'UP' | 'DOWN';
      latencyMs: number;
    };
    queues: 'ok' | 'error';
  }> {
    let queueStatus: 'ok' | 'error' = 'ok';

    // Utiliser la nouvelle méthode getHealth() avec latency
    const redisHealth = await this.redisService.getHealth();

    try {
      await this.queueService.areQueuesReady();
    } catch {
      queueStatus = 'error';
    }

    return {
      ok: redisHealth.status === 'UP' && queueStatus === 'ok',
      timestamp: new Date().toISOString(),
      redis: redisHealth,
      queues: queueStatus,
    };
  }
}
