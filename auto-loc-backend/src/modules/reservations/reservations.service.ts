import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import {
  CreateReservationUseCase,
  CreateReservationResult,
} from '../../domain/reservation/use-cases/create-reservation.use-case';
import {
  ConfirmReservationUseCase,
  ConfirmReservationResult,
} from '../../domain/reservation/use-cases/confirm-reservation.use-case';
import {
  CancelReservationUseCase,
  CancelReservationResultDto,
} from '../../domain/reservation/use-cases/cancel-reservation.use-case';
import {
  CheckInUseCase,
  CheckInResult,
} from '../../domain/reservation/use-cases/checkin.use-case';
import {
  CheckOutUseCase,
  CheckOutResult,
} from '../../domain/reservation/use-cases/checkout.use-case';
import {
  ConfirmPaymentUseCase,
  ConfirmPaymentResult,
} from '../../domain/reservation/use-cases/confirm-payment.use-case';

export { CreateReservationResult };

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateReservationUseCase,
    private readonly confirmUseCase: ConfirmReservationUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    private readonly cancelUseCase: CancelReservationUseCase,
    private readonly checkinUseCase: CheckInUseCase,
    private readonly checkoutUseCase: CheckOutUseCase,
  ) { }

  // ── POST /reservations ────────────────────────────────────────────────────────

  async create(
    user: RequestUser,
    dto: CreateReservationDto,
    headerIdempotencyKey?: string,
  ): Promise<CreateReservationResult> {
    return this.createUseCase.execute(user, dto, headerIdempotencyKey);
  }

  // ── PATCH /reservations/:id/confirm ──────────────────────────────────────────

  async confirm(
    user: RequestUser,
    reservationId: string,
  ): Promise<ConfirmReservationResult> {
    return this.confirmUseCase.execute(user, reservationId);
  }

  // ── PATCH /reservations/:id/confirm-payment ───────────────────────────────

  async confirmPayment(
    reservationId: string,
    transactionId?: string,
  ): Promise<ConfirmPaymentResult> {
    return this.confirmPaymentUseCase.execute(reservationId, { transactionId });
  }

  // ── PATCH /reservations/:id/cancel ───────────────────────────────────────────

  async cancel(
    user: RequestUser,
    reservationId: string,
    dto: CancelReservationDto,
  ): Promise<CancelReservationResultDto> {
    return this.cancelUseCase.execute(user, reservationId, { raison: dto.raison });
  }

  // ── PATCH /reservations/:id/checkin ──────────────────────────────────────────

  async checkin(
    user: RequestUser,
    reservationId: string,
  ): Promise<CheckInResult> {
    return this.checkinUseCase.execute(user, reservationId);
  }

  // ── PATCH /reservations/:id/checkout ─────────────────────────────────────────

  async checkout(
    user: RequestUser,
    reservationId: string,
  ): Promise<CheckOutResult> {
    return this.checkoutUseCase.execute(user, reservationId);
  }

  // ── GET /reservations/:id/contrat ────────────────────────────────────────────

  async getContrat(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profile not completed');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        locataireId: true,
        proprietaireId: true,
        contratUrl: true,
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    if (!reservation.contratUrl) {
      throw new NotFoundException('Le contrat n\'est pas encore disponible');
    }

    return { contratUrl: reservation.contratUrl };
  }

  // ── GET /reservations/owner ──────────────────────────────────────────────────

  async findForOwner(user: RequestUser) {
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) throw new ForbiddenException('Profile not completed');

    return this.prisma.reservation.findMany({
      where: { proprietaireId: proprietaire.id },
      orderBy: { creeLe: 'desc' },
      include: {
        vehicule: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            type: true,
            ville: true,
            photos: {
              orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }],
              take: 1,
            },
          },
        },
        locataire: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            telephone: true,
          },
        },
        paiement: {
          select: {
            statut: true,
            montant: true,
            devise: true,
            fournisseur: true,
          },
        },
      },
    });
  }

  // ── GET /reservations/tenant ────────────────────────────────────────────────

  async findForTenant(user: RequestUser, statut?: string) {
    const locataire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!locataire) throw new ForbiddenException('Profile not completed');

    const where: Record<string, unknown> = { locataireId: locataire.id };
    if (statut) where.statut = statut;

    const reservations = await this.prisma.reservation.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      include: {
        vehicule: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            type: true,
            ville: true,
            photos: {
              orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }],
              take: 1,
            },
          },
        },
        proprietaire: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            telephone: true,
          },
        },
        paiement: {
          select: {
            statut: true,
            montant: true,
            devise: true,
            fournisseur: true,
          },
        },
      },
    });

    return { data: reservations, total: reservations.length };
  }

  // ── GET /reservations/:id ──────────────────────────────────────────────────

  async findById(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profile not completed');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        vehicule: {
          select: {
            id: true,
            marque: true,
            modele: true,
            annee: true,
            type: true,
            ville: true,
            adresse: true,
            photos: {
              orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }],
              take: 3,
            },
          },
        },
        locataire: {
          select: { id: true, prenom: true, nom: true, telephone: true },
        },
        proprietaire: {
          select: { id: true, prenom: true, nom: true, telephone: true },
        },
        paiement: {
          select: { statut: true, montant: true, devise: true, fournisseur: true },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    return reservation;
  }
}
