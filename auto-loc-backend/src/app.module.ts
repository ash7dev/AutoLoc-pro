import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './infrastructure/jwt/jwt.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { NotificationModule } from './infrastructure/notifications/notification.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtModule,
    SharedModule,
    AuthModule,
    QueueModule,
    NotificationModule,
    UsersModule,
  ],
})
export class AppModule {}
