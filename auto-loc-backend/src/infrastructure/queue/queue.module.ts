import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import {
  getBullModuleOptions,
  RESERVATION_QUEUE_NAME,
  NOTIFICATION_QUEUE_NAME,
} from './queue.config';
import { ReservationExpiryProcessor } from './jobs/reservation-expiry.job';
import { NotificationProcessor } from './jobs/notification.processor';
import { ReservationDomainModule } from '../../domain/reservation/reservation.domain.module';

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
    forwardRef(() => ReservationDomainModule),
  ],
  providers: [QueueService, ReservationExpiryProcessor, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule { }

