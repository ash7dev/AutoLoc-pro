import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestUser } from '../../common/types/auth.types';
import { JwtService } from '@nestjs/jwt';
import { JwksService } from '../../infrastructure/jwt/jwks.service';
import { PrismaService } from '../../prisma/prisma.service';

export const BEARER_PREFIX = 'Bearer ';

// Guard hybride (JWT métier ou JWT Supabase).
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwksService: JwksService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('En-tête d\'autorisation manquant ou invalide');
    }

    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new UnauthorizedException('Jeton manquant');
    }

    const user = await this.resolveUser(token);
    await this.assertAccountIsAllowed(user.sub);
    (request as Request & { user?: RequestUser }).user = user;
    return true;
  }

  private async assertAccountIsAllowed(userId: string): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException('Utilisateur invalide');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { actif: true, bloqueJusqua: true },
    });

    // Pas encore de profil métier: on laisse passer l'onboarding.
    if (!utilisateur) return;

    if (!utilisateur.actif) {
      throw new ForbiddenException('Compte suspendu');
    }

    if (utilisateur.bloqueJusqua && utilisateur.bloqueJusqua > new Date()) {
      throw new ForbiddenException('Compte temporairement bloqué');
    }
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
      throw new UnauthorizedException('Jeton invalide ou expiré');
    }
  }
}
