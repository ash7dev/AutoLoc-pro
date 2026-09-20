import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, RedisModule, CloudinaryModule, SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
