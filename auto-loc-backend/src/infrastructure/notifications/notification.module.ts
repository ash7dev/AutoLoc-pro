import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TelegramService } from '../telegram/telegram.service';

@Global()
@Module({
  providers: [NotificationService, TelegramService],
  exports: [NotificationService, TelegramService],
})
export class NotificationModule {}
