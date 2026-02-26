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
 * Vérifie que la réservation :id appartient au propriétaire connecté.
 * Utilise proprietaireId (Utilisateur.id).
 */
@Injectable()
export class ReservationOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: RequestUser }).user;

    if (!user?.sub) {
      throw new UnauthorizedException('Not authenticated');
    }

    const reservationId = request.params.id;
    if (!reservationId) return true;

    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) {
      throw new ForbiddenException('Profile not completed');
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { proprietaireId: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
