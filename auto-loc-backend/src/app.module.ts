import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './infrastructure/jwt/jwt.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CloudinaryModule } from './infrastructure/cloudinary/cloudinary.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { NotificationModule } from './infrastructure/notifications/notification.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PaymentModule } from './infrastructure/payment/payment.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RevalidateModule } from './infrastructure/revalidate/revalidate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    JwtModule,
    RedisModule,
    CloudinaryModule,
    SharedModule,
    AuthModule,
    QueueModule,
    NotificationModule,
    UsersModule,
    VehiclesModule,
    ReservationsModule,
    PaymentModule,
    PaymentsModule,
    ReviewsModule,
    RevalidateModule,
  ],
})
export class AppModule { }
