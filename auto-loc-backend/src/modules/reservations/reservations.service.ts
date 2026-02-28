import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatutReservation, StatutVehicule, TypeEtatLieu, CategoriePhoto } from '@prisma/client';
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
  CheckInInput,
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
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';

export { CreateReservationResult };

// ── Serializer ────────────────────────────────────────────────────────────────
// Maps Prisma field names to the frontend-facing contract.

function serializeReservation(r: Record<string, unknown> & {
  id: string;
  statut: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  prixParJour: unknown;
  totalLocataire: unknown;
  montantCommission: unknown;
  netProprietaire: unknown;
  creeLe: Date | string;
  confirmeeLe?: Date | string | null;
  checkinProprietaireLe?: Date | string | null;
  checkinLocataireLe?: Date | string | null;
  checkinLe?: Date | string | null;
  checkoutLe?: Date | string | null;
  annuleLe?: Date | string | null;
  contratUrl?: string | null;
  proprietaireId: string;
  locataire?: unknown;
  vehicule?: unknown;
  paiement?: unknown;
}) {
  const debut = new Date(r.dateDebut as string);
  const fin = new Date(r.dateFin as string);
  const nbJours = Math.max(1, Math.round((fin.getTime() - debut.getTime()) / 86_400_000));

  return {
    id: r.id,
    statut: r.statut,
    dateDebut: r.dateDebut,
    dateFin: r.dateFin,
    nbJours,
    prixParJour: String(r.prixParJour ?? '0'),
    prixTotal: String(r.totalLocataire ?? '0'),
    commission: String(r.montantCommission ?? '0'),
    montantProprietaire: String(r.netProprietaire ?? '0'),
    creeLe: r.creeLe,
    confirmeeLe: r.confirmeeLe ?? undefined,
    checkinProprietaireLe: (r as Record<string, unknown>).checkinProprietaireLe ?? undefined,
    checkinLocataireLe: (r as Record<string, unknown>).checkinLocataireLe ?? undefined,
    checkInLe: r.checkinLe ?? undefined,
    checkOutLe: r.checkoutLe ?? undefined,
    annuleeLe: r.annuleLe ?? undefined,
    contratUrl: r.contratUrl ?? undefined,
    proprietaireId: r.proprietaireId,
    locataire: r.locataire,
    vehicule: r.vehicule,
    paiement: r.paiement,
  };
}

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
    private readonly cloudinaryService: CloudinaryService,
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
    input: CheckInInput,
  ): Promise<CheckInResult> {
    return this.checkinUseCase.execute(user, reservationId, input);
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
        contratPublicId: true,
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    if (!reservation.contratUrl && !reservation.contratPublicId) {
      throw new NotFoundException('Le contrat n\'est pas encore disponible');
    }

    const publicIdFromUrl = this.extractContratPublicId(reservation.contratUrl ?? undefined);
    const publicId = reservation.contratPublicId ?? publicIdFromUrl;
    if (!publicId) {
      return { contratUrl: reservation.contratUrl! };
    }

    const contratUrl = this.cloudinaryService.getContractDownloadUrl(publicId);

    return { contratUrl };
  }

  private extractContratPublicId(contratUrl?: string | null): string | null {
    if (!contratUrl) return null;
    try {
      const url = new URL(contratUrl);
      const rawPath = url.pathname.replace(/^\/+/, '');
      if (!rawPath.startsWith('contrats/')) return null;
      const noExt = rawPath.replace(/\.pdf$/i, '');
      return noExt;
    } catch {
      return null;
    }
  }

  // ── GET /reservations/:id/locataire-docs ─────────────────────────────────────

  async getLocataireDocs(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profile not completed');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        proprietaireId: true,
        locataire: {
          select: {
            prenom: true,
            nom: true,
            kycDocumentUrl: true,
            kycSelfieUrl: true,
            statutKyc: true,
            permisUrl: true,
          },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    // Only the owner can view tenant docs
    if (reservation.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Access denied');
    }

    return {
      prenom: reservation.locataire.prenom,
      nom: reservation.locataire.nom,
      kycDocumentUrl: reservation.locataire.kycDocumentUrl,
      kycSelfieUrl: reservation.locataire.kycSelfieUrl,
      kycStatus: reservation.locataire.statutKyc,
      permisUrl: reservation.locataire.permisUrl,
    };
  }

  // ── POST /reservations/:id/photos-etat ──────────────────────────────────────

  async uploadPhotoEtatLieu(
    user: RequestUser,
    reservationId: string,
    file: Express.Multer.File,
    type: 'CHECKIN' | 'CHECKOUT',
    categorie?: string,
  ) {
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
      },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    // Upload to Cloudinary
    const upload = await this.cloudinaryService.uploadEtatLieuPhoto(
      file.buffer,
      reservationId,
      type,
    );

    // Validate categorie enum
    const validCategories = Object.values(CategoriePhoto);
    const cat = categorie && validCategories.includes(categorie as CategoriePhoto)
      ? (categorie as CategoriePhoto)
      : null;

    // Count existing photos for position
    const count = await this.prisma.photoEtatLieu.count({
      where: { reservationId, type: type as TypeEtatLieu },
    });

    // Create DB record
    const photo = await this.prisma.photoEtatLieu.create({
      data: {
        reservationId,
        type: type as TypeEtatLieu,
        url: upload.url,
        publicId: upload.publicId,
        categorie: cat,
        position: count,
      },
      select: {
        id: true,
        type: true,
        url: true,
        categorie: true,
        position: true,
        creeLe: true,
      },
    });

    return photo;
  }

  // ── GET /reservations/owner ──────────────────────────────────────────────────

  async findForOwner(user: RequestUser, vehiculeId?: string) {
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) throw new ForbiddenException('Profile not completed');

    const where: Record<string, unknown> = { proprietaireId: proprietaire.id };
    if (vehiculeId) where.vehiculeId = vehiculeId;

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
    return { data: reservations.map(serializeReservation), total: reservations.length };
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

    return { data: reservations.map(serializeReservation), total: reservations.length };
  }

  // ── GET /reservations/owner/stats ────────────────────────────────────────────

  async findOwnerStats(user: RequestUser) {
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) throw new ForbiddenException('Profile not completed');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenuResult, reservationsActives, litigesOuverts, vehiculesActifs] =
      await Promise.all([
        this.prisma.reservation.aggregate({
          _sum: { netProprietaire: true },
          where: {
            proprietaireId: proprietaire.id,
            statut: {
              in: [
                StatutReservation.PAYEE,
                StatutReservation.CONFIRMEE,
                StatutReservation.EN_COURS,
                StatutReservation.TERMINEE,
              ],
            },
            creeLe: { gte: startOfMonth },
          },
        }),
        this.prisma.reservation.count({
          where: {
            proprietaireId: proprietaire.id,
            statut: {
              in: [
                StatutReservation.PAYEE,
                StatutReservation.CONFIRMEE,
                StatutReservation.EN_COURS,
              ],
            },
          },
        }),
        this.prisma.reservation.count({
          where: {
            proprietaireId: proprietaire.id,
            statut: StatutReservation.LITIGE,
          },
        }),
        this.prisma.vehicule.count({
          where: {
            proprietaireId: proprietaire.id,
            statut: {
              in: [StatutVehicule.VERIFIE, StatutVehicule.EN_ATTENTE_VALIDATION],
            },
          },
        }),
      ]);

    const revenusMois = Number(revenuResult._sum.netProprietaire ?? 0);
    const tauxOccupation = vehiculesActifs > 0
      ? Math.min(100, Math.round((reservationsActives / vehiculesActifs) * 100))
      : 0;

    return { revenusMois, reservationsActives, tauxOccupation, litigesOuverts };
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

    return serializeReservation(reservation as Parameters<typeof serializeReservation>[0]);
  }
}
