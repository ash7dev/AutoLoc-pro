import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { QueueModule } from '../../infrastructure/queue/queue.module';

@Module({
  imports: [RedisModule, QueueModule],
  controllers: [HealthController],
})
export class HealthModule {}
