import { Global, Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard';
import { AccountStatusGuard } from './guards/account-status.guard';
import { PhoneVerifiedGuard } from './guards/phone-verified.guard';
import { ProfileCompletedGuard } from './guards/profile-completed.guard';
import { KycVerifiedGuard } from './guards/kyc-verified.guard';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [RolesGuard, AccountStatusGuard, PhoneVerifiedGuard, ProfileCompletedGuard, KycVerifiedGuard],
  exports: [
    RolesGuard,
    AccountStatusGuard,
    PhoneVerifiedGuard,
    ProfileCompletedGuard,
    KycVerifiedGuard,
    NestJwtModule,
  ],
})
export class SharedModule {}
