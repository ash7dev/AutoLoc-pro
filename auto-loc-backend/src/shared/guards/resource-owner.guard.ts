import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';

/**
 * Vérifie que le véhicule identifié par :id appartient à l'utilisateur connecté.
 * Doit être utilisé APRÈS JwtAuthGuard.
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: RequestUser }).user;

    if (!user?.sub) {
      throw new UnauthorizedException('Not authenticated');
    }

    const vehicleId = request.params.id;
    if (!vehicleId) return true;

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (!utilisateur) {
      throw new ForbiddenException('Profile not completed');
    }

    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      select: { proprietaireId: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Access denied: not the vehicle owner');
    }

    return true;
  }
}
