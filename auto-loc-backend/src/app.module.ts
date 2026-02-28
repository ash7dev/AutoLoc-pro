import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
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
import { WalletModule } from './modules/wallet/wallet.module';
import { ReservationAutoCloseJob } from './jobs/reservation-auto-close.job';

// Sentry (optional — active only if SENTRY_DSN is set)
const SENTRY_DSN = process.env.SENTRY_DSN;
if (SENTRY_DSN) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting — 60 requests per minute per IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    // Scheduled jobs (cron)
    ScheduleModule.forRoot(),

    // Structured Logging — Pino (JSON in prod, pretty in dev)
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          transport: config.get('NODE_ENV') !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
          level: config.get('LOG_LEVEL') ?? 'info',
          autoLogging: { ignore: (req: { url?: string }) => req.url === '/health' },
        },
      }),
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
    WalletModule,
  ],
  providers: [
    // Global rate limiter guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Scheduled jobs
    ReservationAutoCloseJob,
  ],
})
export class AppModule { }

