import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwksService } from '../../infrastructure/jwt/jwks.service';
import { RequestUser } from '../../common/types/auth.types';

const BEARER_PREFIX = 'Bearer ';

/**
 * Guard optionnel : tente de résoudre l'utilisateur depuis le Bearer token,
 * mais ne rejette jamais la requête si le token est absent ou invalide.
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwksService: JwksService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith(BEARER_PREFIX)) {
      return true;
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) return true;

    // Essai 1 : JWT métier
    try {
      const payload = await this.jwtService.verifyAsync(token);
      (request as Request & { user?: RequestUser }).user = {
        sub: typeof payload.sub === 'string' ? payload.sub : '',
        email: typeof payload.email === 'string' ? payload.email : undefined,
        phone: typeof payload.phone === 'string' ? payload.phone : undefined,
      };
      return true;
    } catch {
      // fallback
    }

    // Essai 2 : JWT Supabase (JWKS)
    try {
      const payload = await this.jwksService.verify(token);
      (request as Request & { user?: RequestUser }).user = {
        sub: payload.sub,
        email: payload.email,
        phone: payload.phone,
      };
    } catch {
      // Token invalide → continuer anonymement
    }

    return true;
  }
}
