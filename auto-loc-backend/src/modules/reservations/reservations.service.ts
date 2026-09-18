import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { StatutReservation, StatutVehicule, StatutLitige, TypeEtatLieu, CategoriePhoto } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { SignalOverloadDto } from './dto/signal-overload.dto';
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
import {
  RefuseVehicleUseCase,
  RefuseVehicleInput,
  RefuseVehicleResult
} from '../../domain/reservation/use-cases/refuse-vehicle.use-case';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import {
  ContractPdfService,
  ContractData,
} from '../../infrastructure/contract/contract-pdf.service';
import { CancellationPolicyService } from '../../domain/reservation/cancellation-policy.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
  modePaiement?: unknown;
  tauxAcompte?: unknown;
  montantPayeEnLigne?: unknown;
  montantSoldeCheckin?: unknown;
  montantCommissionEnLigne?: unknown;
  montantProprietaireEnLigne?: unknown;
  soldeConfirmeLe?: Date | string | null;
  soldeConfirmeParId?: string | null;
  creeLe: Date | string;
  confirmeeLe?: Date | string | null;
  checkinProprietaireLe?: Date | string | null;
  checkinLocataireLe?: Date | string | null;
  checkinLe?: Date | string | null;
  checkoutLe?: Date | string | null;
  annuleLe?: Date | string | null;
  contratUrl?: string | null;
  paymentUrl?: string | null;
  proprietaireId: string;
  locataire?: unknown;
  proprietaire?: unknown;
  vehicule?: unknown;
  paiement?: unknown;
  historique?: unknown;
  litige?: unknown;
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
    modePaiement: r.modePaiement ?? 'TOTAL_EN_LIGNE',
    tauxAcompte: r.tauxAcompte != null ? String(r.tauxAcompte) : null,
    montantPayeEnLigne: String(r.montantPayeEnLigne ?? r.totalLocataire ?? '0'),
    montantSoldeCheckin: String(r.montantSoldeCheckin ?? '0'),
    montantCommissionEnLigne: String(r.montantCommissionEnLigne ?? r.montantCommission ?? '0'),
    montantProprietaireEnLigne: String(r.montantProprietaireEnLigne ?? r.netProprietaire ?? '0'),
    soldeConfirmeLe: r.soldeConfirmeLe ?? undefined,
    soldeConfirmeParId: r.soldeConfirmeParId ?? undefined,
    creeLe: r.creeLe,
    confirmeeLe: r.confirmeeLe ?? undefined,
    checkinProprietaireLe: (r as Record<string, unknown>).checkinProprietaireLe ?? undefined,
    checkinLocataireLe: (r as Record<string, unknown>).checkinLocataireLe ?? undefined,
    tacitCheckinDeadlineLe: (r as Record<string, unknown>).tacitCheckinDeadlineLe ?? undefined,
    checkinLocataireSource: (r as Record<string, unknown>).checkinLocataireSource ?? undefined,
    checkInLe: r.checkinLe ?? undefined,
    checkOutLe: r.checkoutLe ?? undefined,
    annuleeLe: r.annuleLe ?? undefined,
    raisonAnnulation: (r as Record<string, unknown>).raisonAnnulation as string | undefined ?? undefined,
    contratUrl: r.contratUrl ?? undefined,
    paymentUrl: (r as Record<string, unknown>).paymentUrl as string | undefined ?? undefined,
    proprietaireId: r.proprietaireId,
    adresseLivraison: (r as Record<string, unknown>).adresseLivraison ?? null,
    fraisLivraison: (r as Record<string, unknown>).fraisLivraison != null
      ? String((r as Record<string, unknown>).fraisLivraison)
      : null,
    locataire: r.locataire
      ? (() => {
          const l = r.locataire as Record<string, unknown>;
          return {
            id: l.id,
            prenom: l.prenom,
            nom: l.nom,
            telephone: l.telephone ?? undefined,
            noteLocataire: l.noteLocataire ?? undefined,
            kycStatus: l.statutKyc ?? undefined,
          };
        })()
      : undefined,
    proprietaire: r.proprietaire
      ? (() => {
          const p = r.proprietaire as Record<string, unknown>;
          return {
            id: p.id,
            prenom: p.prenom,
            nom: p.nom,
            telephone: p.telephone ?? undefined,
          };
        })()
      : undefined,
    vehicule: r.vehicule,
    paiement: r.paiement,
    photosEtatLieu: (r as Record<string, unknown>).photosEtatLieu ?? undefined,
    avis: (r as Record<string, unknown>).avis ?? undefined,
    historique: (r as Record<string, unknown>).historique ?? [],
    litige: (r as Record<string, unknown>).litige ?? null,
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
    private readonly refuseVehicleUseCase: RefuseVehicleUseCase,
    private readonly cloudinaryService: CloudinaryService,
    private readonly contractPdfService: ContractPdfService,
    private readonly cancellationPolicy: CancellationPolicyService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) { }

  // ── POST /reservations ────────────────────────────────────────────────────────

  async create(
    user: RequestUser,
    dto: CreateReservationDto,
    headerIdempotencyKey?: string,
  ): Promise<CreateReservationResult> {
    return this.createUseCase.execute(user, dto, headerIdempotencyKey);
  }

  // ── POST /reservations/:id/refus-checkin ──────────────────────────────────────

  async refuseCheckin(
    user: RequestUser,
    reservationId: string,
    input: RefuseVehicleInput,
  ): Promise<RefuseVehicleResult> {
    return this.refuseVehicleUseCase.execute(user, reservationId, input);
  }

  // ── PATCH /reservations/:id/confirm ──────────────────────────────────────────

  async confirm(
    user: RequestUser,
    reservationId: string,
    body: { heureDebut: string }
  ): Promise<ConfirmReservationResult> {
    return this.confirmUseCase.execute(user, reservationId, body);
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
  // Génère le PDF à la volée (en mémoire) et retourne le buffer.
  // Pas de dépendance à Cloudinary pour le téléchargement — zéro 401 possible.

  async getContratBuffer(user: RequestUser, reservationId: string): Promise<{ buffer: Buffer; filename: string }> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        statut: true,
        locataireId: true,
        proprietaireId: true,
        dateDebut: true,
        dateFin: true,
        prixParJour: true,
        totalBase: true,
        montantCommission: true,
        totalLocataire: true,
        netProprietaire: true,
        modePaiement: true,
        montantPayeEnLigne: true,
        montantSoldeCheckin: true,
        annuleLe: true,
        raisonAnnulation: true,
        creeLe: true,
        confirmeeLe: true,
        locataire: { select: { prenom: true, nom: true, telephone: true, email: true } },
        proprietaire: { select: { prenom: true, nom: true, telephone: true, email: true } },
        vehicule: { select: { marque: true, modele: true, annee: true, type: true, immatriculation: true, ville: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Accès refusé');

    const debut = new Date(reservation.dateDebut);
    const fin = new Date(reservation.dateFin);
    const nbJours = Math.max(1, Math.round((fin.getTime() - debut.getTime()) / 86_400_000));

    type StatutContrat = 'EN_COURS' | 'ACTIF' | 'ANNULE' | 'EXPIRE';
    const statutMap: Record<string, StatutContrat> = {
      CONFIRMEE: 'ACTIF',
      EN_COURS: 'ACTIF',
      TERMINEE: 'ACTIF',
      PAYEE: 'EN_COURS',
      ANNULEE: 'ANNULE',
    };
    const statutContrat: StatutContrat = statutMap[reservation.statut] ?? 'EN_COURS';

    const contractData: ContractData = {
      reservationId: reservation.id,
      dateContrat: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      statutContrat,
      raisonAnnulation: reservation.raisonAnnulation ?? undefined,
      dateAnnulation: reservation.annuleLe
        ? new Date(reservation.annuleLe).toLocaleDateString('fr-FR')
        : undefined,
      locataire: {
        prenom: reservation.locataire.prenom,
        nom: reservation.locataire.nom,
        telephone: reservation.locataire.telephone,
        email: reservation.locataire.email,
      },
      proprietaire: {
        prenom: reservation.proprietaire.prenom,
        nom: reservation.proprietaire.nom,
        telephone: reservation.proprietaire.telephone,
        email: reservation.proprietaire.email,
      },
      vehicule: {
        marque: reservation.vehicule.marque,
        modele: reservation.vehicule.modele,
        annee: reservation.vehicule.annee,
        type: reservation.vehicule.type,
        immatriculation: reservation.vehicule.immatriculation,
        ville: reservation.vehicule.ville,
      },
      tarifs: {
        dateDebut: debut.toLocaleDateString('fr-FR'),
        dateFin: fin.toLocaleDateString('fr-FR'),
        nbJours,
        prixParJour: String(reservation.prixParJour),
        totalBase: String(reservation.totalBase),
        commission: String(reservation.montantCommission),
        totalLocataire: String(reservation.totalLocataire),
        netProprietaire: String(reservation.netProprietaire),
        modePaiement: reservation.modePaiement ?? 'TOTAL_EN_LIGNE',
        montantPayeEnLigne: String(reservation.montantPayeEnLigne ?? reservation.totalLocataire),
        montantSoldeCheckin: String(reservation.montantSoldeCheckin ?? '0'),
      },
      dateReservation: new Date(reservation.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
      dateConfirmation: reservation.confirmeeLe
        ? new Date(reservation.confirmeeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : undefined,
    };

    const buffer = await this.contractPdfService.generate(contractData);
    const ref = reservation.id.slice(0, 8).toUpperCase();
    return { buffer, filename: `contrat-autoloc-${ref}.pdf` };
  }

  // ── GET /reservations/:id/locataire-docs ─────────────────────────────────────

  async getLocataireDocs(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        proprietaireId: true,
        statut: true,
        locataire: {
          select: {
            prenom: true,
            nom: true,
            kycDocumentUrl: true,
            kycDocumentBackUrl: true,
            kycSelfieUrl: true,
            statutKyc: true,
            permisUrl: true,
          },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    // Only the owner can view tenant docs
    if (reservation.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Accès refusé');
    }

    if (['TERMINEE', 'ANNULEE', 'EXPIREE', 'REFUSEE'].includes(reservation.statut)) {
      throw new ForbiddenException(
        'Accès expiré : Les documents de vérification du locataire ne sont plus accessibles pour une réservation terminée ou annulée.'
      );
    }

    return {
      prenom: reservation.locataire.prenom,
      nom: reservation.locataire.nom,
      kycDocumentUrl: reservation.locataire.kycDocumentUrl,
      kycDocumentBackUrl: reservation.locataire.kycDocumentBackUrl,
      kycSelfieUrl: reservation.locataire.kycSelfieUrl,
      kycStatus: reservation.locataire.statutKyc,
      permisUrl: reservation.locataire.permisUrl,
    };
  }

  // ── POST /reservations/:id/photos-etat ──────────────────────────────────────

  // ── POST /reservations/:id/photos-etat ──────────────────────────────────────
  // Ancienne méthode multipart (à déprécier au profit de linkPhotoEtatLieu)
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
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        locataireId: true,
        proprietaireId: true,
        statut: true,
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Accès refusé');

    // Validate status: CHECKIN photos only during CONFIRMEE or EN_COURS; CHECKOUT only during EN_COURS
    const allowedStatuts: StatutReservation[] =
      type === 'CHECKOUT'
        ? [StatutReservation.EN_COURS]
        : [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS];

    if (!allowedStatuts.includes(reservation.statut)) {
      throw new BadRequestException(
        `Upload de photo non autorisé pour une réservation en statut ${reservation.statut}`,
      );
    }

    // Upload to Cloudinary
    const upload = await this.cloudinaryService.uploadEtatLieuPhoto(
      file.buffer,
      reservationId,
      type,
    );

    return this.applyPhotoEtatLieuRecord(reservationId, type, upload.url, upload.publicId, categorie);
  }

  async getEtatLieuUploadSignature() {
    return this.cloudinaryService.getUploadSignature('reservation-photos');
  }

  async linkPhotoEtatLieu(
    user: RequestUser,
    reservationId: string,
    body: { url: string; publicId: string; type: 'CHECKIN' | 'CHECKOUT'; categorie?: string },
  ) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { id: true, locataireId: true, proprietaireId: true, statut: true },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    const isParty = reservation.locataireId === utilisateur.id || reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Accès refusé');

    return this.applyPhotoEtatLieuRecord(reservationId, body.type, body.url, body.publicId, body.categorie);
  }

  private async applyPhotoEtatLieuRecord(
    reservationId: string,
    type: 'CHECKIN' | 'CHECKOUT',
    url: string,
    publicId: string,
    categorie?: string,
  ) {
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
    return this.prisma.photoEtatLieu.create({
      data: {
        reservationId,
        type: type as TypeEtatLieu,
        url,
        publicId,
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
  }

  // ── GET /reservations/owner/notifications ────────────────────────────────────

  async getOwnerNotificationsCount(user: RequestUser) {
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) {
      return {
        pendingConfirmations: 0,
        pendingConfirmationsIds: [],
        pendingLitiges: 0,
        pendingLitigesIds: [],
        total: 0,
      };
    }

    const [pendingConfirmations, pendingLitiges] = await Promise.all([
      // Réservations payées en attente de confirmation du propriétaire
      this.prisma.reservation.findMany({
        where: {
          proprietaireId: proprietaire.id,
          statut: StatutReservation.PAYEE,
        },
        select: { id: true },
        take: 5,
        orderBy: { creeLe: 'desc' },
      }),
      // Litiges ouverts sur les réservations du propriétaire
      this.prisma.litige.findMany({
        where: {
          statut: StatutLitige.EN_ATTENTE,
          reservation: { proprietaireId: proprietaire.id },
        },
        select: { reservationId: true },
        take: 5,
        orderBy: { creeLe: 'desc' },
      }),
    ]);

    return {
      pendingConfirmations: pendingConfirmations.length,
      pendingConfirmationsIds: pendingConfirmations.map(r => r.id),
      pendingLitiges: pendingLitiges.length,
      pendingLitigesIds: pendingLitiges.map(l => l.reservationId),
      total: pendingConfirmations.length + pendingLitiges.length,
    };
  }

  // ── GET /reservations/owner ──────────────────────────────────────────────────

  async findForOwner(
    user: RequestUser,
    params: { vehiculeId?: string; statut?: string; page?: number; limit?: number } = {},
  ) {
    const { vehiculeId, statut, page = 1, limit: limitOverride } = params;
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) {
      console.warn(`[findForOwner] Aucun Utilisateur trouvé pour userId=${user.sub} — profil potentiellement désynchronisé.`);
      return { data: [], total: 0, page, limit: 20 };
    }

    const where: Record<string, unknown> = { proprietaireId: proprietaire.id };
    if (vehiculeId) where.vehiculeId = vehiculeId;
    if (statut) {
      if (!Object.values(StatutReservation).includes(statut as StatutReservation)) {
        throw new BadRequestException('Statut de réservation invalide');
      }
      where.statut = statut;
    }

    const take = Math.min(limitOverride ?? 20, 200);
    const skip = (page - 1) * take;

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      take,
      skip,
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
            noteLocataire: true,
            statutKyc: true,
          },
        },
        paiement: {
          select: {
            statut: true,
            montant: true,
            devise: true,
            fournisseur: true,
            rembourseLe: true,
            montantRembourse: true,
          },
        },
      },
    }),
      this.prisma.reservation.count({ where }),
    ]);
    return { data: reservations.map(serializeReservation), total, page, limit: take };
  }

  // ── GET /reservations/tenant ────────────────────────────────────────────────

  async findForTenant(user: RequestUser, statut?: string, page = 1) {
    const locataire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!locataire) throw new ForbiddenException('Profil incomplet');

    const where: Record<string, unknown> = { locataireId: locataire.id };
    if (statut) where.statut = statut;

    const take = 20;
    const skip = (page - 1) * take;

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
      where,
      orderBy: { creeLe: 'desc' },
      take,
      skip,
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
            rembourseLe: true,
            montantRembourse: true,
          },
        },
      },
    }),
      this.prisma.reservation.count({ where }),
    ]);

    const now = Date.now();
    const data = reservations.map((reservation) => {
      const serialized = serializeReservation(reservation as Parameters<typeof serializeReservation>[0]);
      const canRevealOwnerPhone = reservation.statut === StatutReservation.EN_COURS
        || reservation.statut === StatutReservation.LITIGE
        || (reservation.statut === StatutReservation.CONFIRMEE
          && new Date(reservation.dateDebut).getTime() - now <= 24 * 60 * 60 * 1000);
      if (!canRevealOwnerPhone && serialized.proprietaire) serialized.proprietaire.telephone = undefined;
      return serialized;
    });
    return { data, total, page, limit: take };
  }

  // ── GET /reservations/owner/stats ────────────────────────────────────────────

  async findOwnerStats(user: RequestUser) {
    const proprietaire = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!proprietaire) {
      return {
        revenusMois: 0,
        variationMoisPourcentage: 0,
        reservationsActives: 0,
        demandesEnAttenteCount: 0,
        tauxOccupation: 0,
        noteMoyenneFlotte: 0,
        totalVehiculesCount: 0,
        litigesOuverts: 0,
      };
    }

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      currentMonthReservations,
      prevMonthReservations,
      reservationsActives,
      demandesEnAttenteCount,
      litigesOuverts,
      vehiculesActifs,
      reviewsAggregate,
    ] = await Promise.all([
      // 1. Revenus mois en cours (Exclut ANNULEE / REJETE)
      this.prisma.reservation.findMany({
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
          creeLe: { gte: startOfCurrentMonth },
        },
        select: {
          modePaiement: true,
          netProprietaire: true,
          montantProprietaireEnLigne: true,
        },
      }),
      // 2. Revenus mois précédent pour calculer la variation
      this.prisma.reservation.findMany({
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
          creeLe: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        select: {
          modePaiement: true,
          netProprietaire: true,
          montantProprietaireEnLigne: true,
        },
      }),
      // 3. Réservations actives (PAYEE, CONFIRMEE, EN_COURS)
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
      // 4. Demandes en attente (EN_ATTENTE_PAIEMENT ou PAYEE sans confirmation)
      this.prisma.reservation.count({
        where: {
          proprietaireId: proprietaire.id,
          statut: {
            in: [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.PAYEE],
          },
        },
      }),
      // 5. Litiges ouverts
      this.prisma.reservation.count({
        where: {
          proprietaireId: proprietaire.id,
          statut: StatutReservation.LITIGE,
        },
      }),
      // 6. Nombre de véhicules actifs du propriétaire
      this.prisma.vehicule.count({
        where: {
          proprietaireId: proprietaire.id,
          statut: {
            in: [StatutVehicule.VERIFIE, StatutVehicule.EN_ATTENTE_VALIDATION],
          },
        },
      }),
      // 7. Moyenne des avis de la flotte
      this.prisma.avis.aggregate({
        where: {
          reservation: {
            proprietaireId: proprietaire.id,
          },
        },
        _avg: { note: true },
      }),
    ]);

    const revenusMois = currentMonthReservations.reduce((sum, r) => {
      const amount = r.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
        ? r.montantProprietaireEnLigne
        : r.netProprietaire;
      return sum + Number(amount);
    }, 0);

    const revenusMoisPrecedent = prevMonthReservations.reduce((sum, r) => {
      const amount = r.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
        ? r.montantProprietaireEnLigne
        : r.netProprietaire;
      return sum + Number(amount);
    }, 0);

    // Calcul de la variation en %
    let variationMoisPourcentage = 0;
    if (revenusMoisPrecedent > 0) {
      variationMoisPourcentage = Math.round(((revenusMois - revenusMoisPrecedent) / revenusMoisPrecedent) * 100);
    } else if (revenusMois > 0) {
      variationMoisPourcentage = 100;
    }

    const tauxOccupation = vehiculesActifs > 0
      ? Math.min(100, Math.round((reservationsActives / vehiculesActifs) * 100))
      : 0;

    const noteMoyenneFlotte = reviewsAggregate._avg.note ? Number(reviewsAggregate._avg.note.toFixed(1)) : 0;

    return {
      revenusMois,
      variationMoisPourcentage,
      reservationsActives,
      demandesEnAttenteCount,
      tauxOccupation,
      noteMoyenneFlotte,
      totalVehiculesCount: vehiculesActifs,
      litigesOuverts,
    };
  }

  // ── GET /reservations/:id ──────────────────────────────────────────────────

  async findById(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

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
          select: { id: true, prenom: true, nom: true, telephone: true, noteLocataire: true, statutKyc: true },
        },
        proprietaire: {
          select: { id: true, prenom: true, nom: true, telephone: true },
        },
        paiement: {
          select: { statut: true, montant: true, devise: true, fournisseur: true, rembourseLe: true, montantRembourse: true },
        },
        photosEtatLieu: {
          orderBy: [{ type: 'asc' }, { position: 'asc' }],
        },
        litige: true,
        historique: {
          orderBy: { modifieLe: 'asc' },
          select: {
            id: true,
            ancienStatut: true,
            nouveauStatut: true,
            modifiePar: true,
            modifieLe: true,
          },
        },
        avis: {
          where: { auteurId: utilisateur.id },
          select: {
            id: true,
            note: true,
            commentaire: true,
            creeLe: true,
          },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    const isParty =
      reservation.locataireId === utilisateur.id ||
      reservation.proprietaireId === utilisateur.id;
    if (!isParty) throw new ForbiddenException('Accès refusé');

    const serialized = serializeReservation(reservation as Parameters<typeof serializeReservation>[0]);
    const isTenant = reservation.locataireId === utilisateur.id;
    const canRevealOwnerPhone = !isTenant
      || reservation.statut === StatutReservation.EN_COURS
      || reservation.statut === StatutReservation.LITIGE
      || (reservation.statut === StatutReservation.CONFIRMEE
        && new Date(reservation.dateDebut).getTime() - Date.now() <= 24 * 60 * 60 * 1000);

    if (!canRevealOwnerPhone && serialized.proprietaire) {
      serialized.proprietaire.telephone = undefined;
    }
    return serialized;
  }

  async getTenantCancellationQuote(user: RequestUser, reservationId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({ where: { userId: user.sub }, select: { id: true } });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { locataireId: true, statut: true, dateDebut: true, totalLocataire: true, totalBase: true, montantCommission: true, netProprietaire: true },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');
    if (reservation.locataireId !== utilisateur.id) throw new ForbiddenException('Accès refusé');
    const cancellableStatuses: StatutReservation[] = [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.PAYEE, StatutReservation.CONFIRMEE];
    if (!cancellableStatuses.includes(reservation.statut)) {
      throw new BadRequestException('Cette réservation ne peut plus être annulée');
    }
    const quote = this.cancellationPolicy.calculateForTenant(reservation, new Date(), reservation.statut === StatutReservation.CONFIRMEE);
    return { canCancel: quote.canCancel, refundPercentage: quote.refundPercentage, refundAmount: quote.refundAmount.toString(), commissionRetained: quote.commissionRetained.toString(), warnings: quote.warnings };
  }

  async createContractAccessUrl(user: RequestUser, reservationId: string) {
    await this.getContratBuffer(user, reservationId);
    const token = await this.jwtService.signAsync(
      { sub: user.sub, purpose: 'reservation-contract', reservationId },
      { expiresIn: '5m' },
    );
    const baseUrl = (this.config.get<string>('PUBLIC_API_URL') || this.config.get<string>('API_URL') || 'https://api.autoloc.sn').replace(/\/$/, '');
    const accessUrl = `${baseUrl}/reservation-contracts/${reservationId}?token=${encodeURIComponent(token)}`;
    return {
      viewUrl: accessUrl,
      downloadUrl: `${accessUrl}&download=1`,
      expiresInSeconds: 300,
    };
  }

  async getContractFromAccessToken(reservationId: string, token: string) {
    let payload: { sub?: string; purpose?: string; reservationId?: string };
    try {
      payload = await this.jwtService.verifyAsync<{ sub?: string; purpose?: string; reservationId?: string }>(token);
    } catch {
      throw new UnauthorizedException('Lien de contrat expiré ou invalide');
    }
    if (payload.purpose !== 'reservation-contract' || payload.reservationId !== reservationId || !payload.sub) {
      throw new ForbiddenException('Lien de contrat invalide');
    }
    return this.getContratBuffer({ sub: payload.sub }, reservationId);
  }

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  async adminList(statut?: string, page = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    const where = statut ? { statut: statut as StatutReservation } : {};

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: { creeLe: 'desc' },
        take,
        skip,
        include: {
          vehicule: {
            select: { id: true, marque: true, modele: true, immatriculation: true },
          },
          locataire: {
            select: { prenom: true, nom: true, email: true, telephone: true },
          },
          proprietaire: {
            select: { prenom: true, nom: true, email: true, telephone: true },
          },
          paiement: {
            select: { statut: true, montant: true },
          },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      data: reservations,
      total,
      page,
      limit: take,
    };
  }

  async adminGetDetail(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        vehicule: {
          select: {
            id: true, marque: true, modele: true, immatriculation: true, ville: true,
            photos: { take: 1, orderBy: { estPrincipale: 'desc' } }
          },
        },
        locataire: {
          select: { id: true, prenom: true, nom: true, email: true, telephone: true, statutKyc: true },
        },
        proprietaire: {
          select: { id: true, prenom: true, nom: true, email: true, telephone: true, statutKyc: true },
        },
        paiement: {
          select: { id: true, statut: true, montant: true, fournisseur: true, idTransactionFournisseur: true, creeLe: true },
        },
        litige: { select: { id: true, statut: true, description: true, resoluParAdminId: true } },
        photosEtatLieu: true,
      },
    });

    if (!reservation) throw new NotFoundException('Réservation introuvable');
    return reservation;
  }

  /**
   * Récupère toutes les annulations (exclut les EXPIREE)
   * EXPIREE = réservation non payée dans les délais (pas une vraie annulation)
   */
  async adminGetCancellations(annuleePar?: string, page = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    const where: any = {
      statut: StatutReservation.ANNULEE,
      // Exclure les EXPIREE qui sont techniquement en statut ANNULEE mais pas de vraies annulations
      NOT: {
        raisonAnnulation: {
          contains: 'paiement non effectué',
        },
      },
    };

    // Filtrer par qui a annulé
    if (annuleePar) {
      where.annuleePar = annuleePar;
    }

    const [reservations, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        orderBy: { annuleLe: 'desc' }, // Correct field name
        take,
        skip,
        include: {
          vehicule: {
            select: { id: true, marque: true, modele: true, immatriculation: true, ville: true },
          },
          locataire: {
            select: { id: true, prenom: true, nom: true, email: true, telephone: true },
          },
          proprietaire: {
            select: { id: true, prenom: true, nom: true, email: true, telephone: true },
          },
          paiement: {
            select: {
              statut: true,
              montant: true,
              montantRembourse: true,
              rembourseLe: true,
            },
          },
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    // Calculer les statistiques
    const totalPenalties = await this.prisma.penaliteProprietaire.count({
      where: {
        reservationId: {
          in: reservations.map(r => r.id),
        },
      },
    });

    const totalRefunds = reservations.filter(r => r.paiement?.rembourseLe).length;

    return {
      data: reservations,
      total,
      totalPenalties,
      totalRefunds,
      page,
      limit: take,
    };
  }

  async adminForceCancel(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { paiement: true },
    });

    if (!reservation) throw new NotFoundException('Réservation introuvable');

    if (reservation.statut === StatutReservation.ANNULEE) {
      throw new BadRequestException('Réservation déjà annulée');
    }

    const hasRefund =
      reservation.paiement &&
      reservation.paiement.statut === 'CONFIRME';

    await this.prisma.$transaction(async (tx) => {
      // Annulation
      await tx.reservation.update({
        where: { id },
        data: {
          statut: StatutReservation.ANNULEE,
          raisonAnnulation: 'Annulation forcée par l\'administrateur. Remboursement 100%.',
          annuleLe: new Date(),
        },
      });

      // Remboursement
      if (hasRefund && reservation.paiement) {
        await tx.paiement.update({
          where: { id: reservation.paiement.id },
          data: {
            statut: 'REMBOURSE',
            rembourseLe: new Date(),
            montantRembourse: reservation.paiement.montant,
          },
        });
      }

      await tx.reservationHistorique.create({
        data: {
          reservationId: id,
          ancienStatut: reservation.statut,
          nouveauStatut: StatutReservation.ANNULEE,
          modifiePar: 'ADMIN',
        },
      });
    });

    return { success: true };
  }

  async adminForceComplete(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) throw new NotFoundException('Réservation introuvable');

    if (reservation.statut === StatutReservation.TERMINEE) {
      throw new BadRequestException('Réservation déjà terminée');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id },
        data: {
          statut: StatutReservation.TERMINEE,
          checkoutLe: new Date(),
        },
      });

      await tx.reservationHistorique.create({
        data: {
          reservationId: id,
          ancienStatut: reservation.statut,
          nouveauStatut: StatutReservation.TERMINEE,
          modifiePar: 'ADMIN',
        },
      });
    });

    return { success: true };
  }

  // ── SIGNALER NO-SHOW LOCATAIRE ─────────────────────────────────────────────

  async signalTenantNoshow(user: RequestUser, reservationId: string, commentaire?: string) {
    // 1. Vérifier propriétaire
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    // 2. Vérifier réservation
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        statut: true,
        proprietaireId: true,
        dateDebut: true,
        locataireId: true,
        absenceSignalee: true,
        locataire: { select: { prenom: true, telephone: true } },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    // 3. Vérifier ownership
    if (reservation.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Accès refusé');
    }

    // 4. Vérifier statut (doit être CONFIRMEE)
    if (reservation.statut !== StatutReservation.CONFIRMEE) {
      throw new BadRequestException(
        'Le signalement no-show est uniquement possible pour les réservations confirmées sans check-in'
      );
    }

    // 4b. Vérifier que l'absence n'a pas déjà été signalée
    if (reservation.absenceSignalee) {
      throw new BadRequestException(
        'L\'absence du locataire a déjà été signalée pour cette réservation'
      );
    }

    // 5. Vérifier timing (minimum T+2h après heure de début)
    const now = new Date();
    const twoHoursAfterStart = new Date(reservation.dateDebut.getTime() + 2 * 60 * 60 * 1000);
    if (now < twoHoursAfterStart) {
      throw new BadRequestException(
        'Vous pouvez signaler l\'absence du locataire uniquement 2h après l\'heure de début prévue'
      );
    }

    // 6. Créer l'historique de signalement et marquer comme signalé
    await this.prisma.$transaction(async (tx) => {
      await tx.reservationHistorique.create({
        data: {
          reservationId,
          ancienStatut: reservation.statut,
          nouveauStatut: reservation.statut,
          modifiePar: 'OWNER_SIGNAL_TENANT_NOSHOW',
        },
      });

      await tx.reservation.update({
        where: { id: reservationId },
        data: { absenceSignalee: true },
      });
    });

    return {
      success: true,
      message: 'No-show signalé. La réservation sera annulée automatiquement si le locataire ne se présente pas d\'ici T+5h avec remboursement partiel (30%).'
    };
  }

  // ── POST /reservations/:id/signal-overload ──────────────────────────────────

  /**
   * Signalement d'un dépassement du nombre de voyageurs autorisé.
   * Cette action déclenche une annulation IMMÉDIATE avec pénalité 50% pour le locataire.
   * Logique : si le proprio utilise ce bouton, c'est qu'aucun accord n'a pu être trouvé.
   */
  async signalOverload(user: RequestUser, reservationId: string, dto: SignalOverloadDto) {
    // 1. Récupérer l'utilisateur propriétaire
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new ForbiddenException('Profil incomplet');

    // 2. Récupérer la réservation avec véhicule et locataire
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        vehicule: {
          select: {
            nombrePlaces: true,
            marque: true,
            modele: true,
          },
        },
        locataire: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            telephone: true,
          },
        },
        proprietaire: {
          select: {
            prenom: true,
            nom: true,
          },
        },
      },
    });
    if (!reservation) throw new NotFoundException('Réservation introuvable');

    // 3. Vérifier ownership (normalement fait par le guard, mais sécurité supplémentaire)
    if (reservation.proprietaireId !== utilisateur.id) {
      throw new ForbiddenException('Vous n\'êtes pas le propriétaire de cette réservation');
    }

    // 4. Vérifier que la réservation est dans un état annulable
    const annulableStatuses: StatutReservation[] = [
      StatutReservation.CONFIRMEE,
      StatutReservation.EN_COURS,
    ];
    if (!annulableStatuses.includes(reservation.statut)) {
      throw new BadRequestException(
        `Le signalement de dépassement de voyageurs n'est possible que pour les réservations CONFIRMEE ou EN_COURS. Statut actuel : ${reservation.statut}`
      );
    }

    // 5. Vérifier que le flag n'a pas déjà été posé
    if (reservation.occupantsSignales) {
      throw new BadRequestException(
        'Le dépassement de voyageurs a déjà été signalé pour cette réservation'
      );
    }

    // 6. Vérifier qu'il y a vraiment un dépassement
    if (!reservation.vehicule.nombrePlaces) {
      throw new BadRequestException('Le véhicule n\'a pas de capacité définie');
    }
    if (dto.nombreOccupantsReel <= reservation.vehicule.nombrePlaces) {
      throw new BadRequestException(
        `Le nombre d'occupants déclaré (${dto.nombreOccupantsReel}) ne dépasse pas la capacité du véhicule (${reservation.vehicule.nombrePlaces} places)`
      );
    }

    // 7. Préparer la raison d'annulation détaillée
    const raisonAnnulation = `DÉPASSEMENT_VOYAGEURS: ${dto.nombreOccupantsReel}/${reservation.vehicule.nombrePlaces} personnes. ${dto.commentaire || ''}`;

    // 8. Annuler la réservation via le use-case existant
    // Avec rôle PROPRIETAIRE → pénalité 50% locataire, 0% proprio
    const cancelDto: CancelReservationDto = {
      raison: raisonAnnulation,
    };

    const cancelResult = await this.cancelUseCase.execute(
      user,
      reservationId,
      cancelDto,
    );

    // 9. Marquer le flag occupantsSignales dans une transaction séparée
    await this.prisma.reservation.update({
      where: { id: reservationId },
      data: { occupantsSignales: true },
    });

    // 10. Logger l'événement dans l'historique
    await this.prisma.reservationHistorique.create({
      data: {
        reservationId,
        ancienStatut: reservation.statut,
        nouveauStatut: StatutReservation.ANNULEE,
        modifiePar: `OWNER_SIGNAL_OVERLOAD: ${dto.nombreOccupantsReel} personnes`,
      },
    });

    // 11. TODO: Envoyer notifications
    // await this.notificationsService.sendOverloadCancellation({
    //   locataire: reservation.locataire,
    //   proprietaire: reservation.proprietaire,
    //   vehicule: reservation.vehicule,
    //   nombreOccupantsReel: dto.nombreOccupantsReel,
    //   capaciteVehicule: reservation.vehicule.nombrePlaces,
    //   penaliteLocataire: cancelResult.penalites?.locataire || 0,
    // });

    return {
      success: true,
      message: 'Réservation annulée pour dépassement du nombre de voyageurs autorisé',
      annulation: {
        reservationId: cancelResult.reservationId,
        ancienStatut: reservation.statut,
        nouveauStatut: cancelResult.statut,
        raison: raisonAnnulation,
        capaciteVehicule: reservation.vehicule.nombrePlaces,
        nombreOccupantsReel: dto.nombreOccupantsReel,
        remboursementLocataire: {
          montant: cancelResult.refundAmount,
          pourcentage: cancelResult.refundPercentage,
        },
        penaliteProprietaire: cancelResult.ownerPenaltyAmount,
        avertissements: cancelResult.warnings,
      },
    };
  }
}
