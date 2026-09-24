import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { AdminBroadcastController } from './admin-broadcast.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController, AdminBroadcastController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

