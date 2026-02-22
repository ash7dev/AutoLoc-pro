import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleProfile } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import { RequestUser } from '../../common/types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleProfile[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si aucun rôle n'est exigé, on laisse passer.
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: RequestUser }).user;
    if (!user?.sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Source de vérité des rôles = table Profile (liée à Supabase userId).
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
      select: { role: true },
    });

    if (!profile?.role) {
      throw new ForbiddenException('Role not found');
    }

    const hasRole = requiredRoles.includes(profile.role as RoleProfile);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
