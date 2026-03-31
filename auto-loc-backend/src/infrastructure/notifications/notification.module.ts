import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TelegramService } from '../telegram/telegram.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [NotificationService, TelegramService],
  exports: [NotificationService, TelegramService],
})
export class NotificationModule {}
