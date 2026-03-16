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
export class PhoneVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: RequestUser }).user;
    if (!user?.sub) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { phoneVerified: true },
    });

    if (!utilisateur) {
      throw new ForbiddenException('Profil incomplet');
    }

    if (!utilisateur.phoneVerified) {
      throw new ForbiddenException('Numéro de téléphone non vérifié');
    }

    return true;
  }
}
