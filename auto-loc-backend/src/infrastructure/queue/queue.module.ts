import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import {
  getBullModuleOptions,
  RESERVATION_QUEUE_NAME,
  NOTIFICATION_QUEUE_NAME,
} from './queue.config';
import { ReservationExpiryProcessor } from './jobs/reservation-expiry.processor';
import { NotificationProcessor } from './jobs/notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') ?? '';
        return getBullModuleOptions(redisUrl);
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: RESERVATION_QUEUE_NAME },
      { name: NOTIFICATION_QUEUE_NAME },
    ),
  ],
  providers: [QueueService, ReservationExpiryProcessor, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
