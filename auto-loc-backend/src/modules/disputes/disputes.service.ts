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

const DISPUTE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) { }

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
        dateFin: true,
        checkoutLe: true,
        litige: { select: { id: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    // ── Determine role ──────────────────────────────────────────────────
    const isOwner = reservation.proprietaireId === utilisateur.id;
    const isTenant = reservation.locataireId === utilisateur.id;
    if (!isOwner && !isTenant) throw new ForbiddenException('Access denied');

    // ── Already has a dispute? ──────────────────────────────────────────
    if (reservation.litige) {
      throw new ConflictException('Un litige existe déjà pour cette réservation');
    }

    // ── Validate per-role dispute windows ────────────────────────────────
    if (isTenant) {
      // Locataire : peut déclarer uniquement si CONFIRMEE (non-conformité véhicule au check-in)
      if (reservation.statut !== StatutReservation.CONFIRMEE) {
        throw new BadRequestException(
          'En tant que locataire, un litige pour non-conformité ne peut être déclaré que pendant le check-in (statut CONFIRMEE)',
        );
      }
    } else if (isOwner) {
      // Propriétaire : peut déclarer si EN_COURS ou TERMINEE dans les 24h
      const allowedStatuts: StatutReservation[] = [
        StatutReservation.EN_COURS,
        StatutReservation.TERMINEE,
      ];
      if (!allowedStatuts.includes(reservation.statut)) {
        throw new BadRequestException(
          'En tant que propriétaire, un litige ne peut être déclaré que pour une réservation EN_COURS ou TERMINEE',
        );
      }

      // Fenêtre 24h pour les réservations TERMINEE
      if (reservation.statut === StatutReservation.TERMINEE) {
        const referenceDate = reservation.checkoutLe ?? reservation.dateFin;
        const deadline = new Date(new Date(referenceDate).getTime() + DISPUTE_WINDOW_MS);
        if (new Date() > deadline) {
          throw new BadRequestException(
            'Le délai de 24h pour déclarer un litige après la fin de la location est dépassé',
          );
        }
      }
    }

    // ── Create dispute in transaction ───────────────────────────────────
    const litige = await this.prisma.$transaction(async (tx) => {
      const created = await tx.litige.create({
        data: {
          reservationId,
          description: dto.description,
          coutEstime: dto.coutEstime ?? null,
        },
        select: { id: true, statut: true, creeLe: true },
      });

      // Mettre le statut en LITIGE si la réservation est EN_COURS
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

      // Si litige locataire pendant CONFIRMEE → annuler la réservation
      if (isTenant && reservation.statut === StatutReservation.CONFIRMEE) {
        await tx.reservation.update({
          where: { id: reservationId },
          data: {
            statut: StatutReservation.ANNULEE,
            annuleParId: utilisateur.id,
            annuleLe: new Date(),
            raisonAnnulation: `Litige locataire : ${dto.description}`,
          },
        });
        await tx.reservationHistorique.create({
          data: {
            reservationId,
            ancienStatut: StatutReservation.CONFIRMEE,
            nouveauStatut: StatutReservation.ANNULEE,
            modifiePar: utilisateur.id,
          },
        });
      }

      return created;
    });

    return {
      disputeId: litige.id,
      statut: litige.statut,
      creeLe: litige.creeLe,
      declaredBy: isOwner ? 'PROPRIETAIRE' : 'LOCATAIRE',
    };
  }
}
