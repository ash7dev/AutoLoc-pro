import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatutReservation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /reservations/:id/dispute ────────────────────────────────────────────

  async create(user: RequestUser, reservationId: string, dto: CreateDisputeDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profile not completed');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        locataireId: true,
        proprietaireId: true,
        statut: true,
        litige: { select: { id: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    const allowedStatuts: StatutReservation[] = [
      StatutReservation.EN_COURS,
      StatutReservation.TERMINEE,
    ];
    if (!allowedStatuts.includes(reservation.statut)) {
      throw new BadRequestException(
        'Un litige ne peut être déclaré que pour une réservation EN_COURS ou TERMINEE',
      );
    }

    if (reservation.litige) {
      throw new ConflictException('Un litige existe déjà pour cette réservation');
    }

    const litige = await this.prisma.$transaction(async (tx) => {
      const created = await tx.litige.create({
        data: {
          reservationId,
          description: dto.description,
          coutEstime: dto.coutEstime ?? null,
        },
        select: { id: true, statut: true, creeLe: true },
      });

      if (reservation.statut === StatutReservation.EN_COURS) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: { statut: StatutReservation.LITIGE },
        });
        await tx.reservationHistorique.create({
          data: {
            reservationId,
            ancienStatut: StatutReservation.EN_COURS,
            nouveauStatut: StatutReservation.LITIGE,
            modifiePar: utilisateur.id,
          },
        });
      }

      return created;
    });

    return { disputeId: litige.id, statut: litige.statut, creeLe: litige.creeLe };
  }
}
