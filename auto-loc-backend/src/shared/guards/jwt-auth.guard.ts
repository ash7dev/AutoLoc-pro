import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../../common/types/auth.types';
import { JwtService } from '@nestjs/jwt';
import { JwksService } from '../../infrastructure/jwt/jwks.service';

export const BEARER_PREFIX = 'Bearer ';

// Guard hybride (JWT métier ou JWT Supabase).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwksService: JwksService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const user = await this.resolveUser(token);
    (request as Request & { user?: RequestUser }).user = user;
    return true;
  }

  private async resolveUser(token: string): Promise<RequestUser> {
    // 1) JWT métier
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return {
        sub: typeof payload.sub === 'string' ? payload.sub : '',
        email: typeof payload.email === 'string' ? payload.email : undefined,
        phone: typeof payload.phone === 'string' ? payload.phone : undefined,
      };
    } catch {
      // fallback Supabase
    }

    try {
      const payload = await this.jwksService.verify(token);
      return {
        sub: payload.sub,
        email: payload.email,
        phone: payload.phone,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
