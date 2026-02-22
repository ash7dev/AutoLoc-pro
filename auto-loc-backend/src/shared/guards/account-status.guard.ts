import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { RequestUser } from '../../common/types/auth.types';

@Injectable()
export class AccountStatusGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: RequestUser }).user;
    if (!user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { actif: true, bloqueJusqua: true },
    });

    // Pas encore de profil métier: on laisse passer (onboarding).
    if (!utilisateur) return true;

    if (!utilisateur.actif) {
      throw new ForbiddenException('Account suspended');
    }

    if (utilisateur.bloqueJusqua && utilisateur.bloqueJusqua > new Date()) {
      throw new ForbiddenException('Account temporarily blocked');
    }

    return true;
  }
}
