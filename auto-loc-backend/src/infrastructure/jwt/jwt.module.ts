import { Global, Module } from '@nestjs/common';
import { JwksService } from './jwks.service';
import { JwtGuard } from './jwt.guard';

@Global()
@Module({
  providers: [JwksService, JwtGuard],
  exports: [JwksService, JwtGuard],
})
export class JwtModule {}
