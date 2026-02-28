import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutVehicule, StatutKyc } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { RequestUser } from '../../common/types/auth.types';
import { ALLOWED_MIMES } from '../upload/upload.config';
import { assertValidImageBuffer } from '../../infrastructure/cloudinary/utils/file-validator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { CreateIndisponibiliteDto } from './dto/create-indisponibilite.dto';
import { ReservationPricingService } from '../../domain/reservation/reservation-pricing.service';
import { RevalidateService } from '../../infrastructure/revalidate/revalidate.service';

const MAX_PHOTOS = 8;
const SEARCH_PAGE_SIZE = 12;
const SEARCH_CACHE_TTL = 60; // secondes
const SEARCH_CACHE_PREFIX = 'vehicles:search:';

interface VehicleSearchRow {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  prixParJour: unknown;
  ville: string;
  note: unknown;
  totalLocations: number;
  photoUrl: string | null;
}

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly redis: RedisService,
    private readonly notification: NotificationService,
    private readonly pricing: ReservationPricingService,
    private readonly revalidate: RevalidateService,
  ) { }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async getUtilisateurOrThrow(userId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true, statutKyc: true },
    });
    if (!utilisateur) {
      throw new ForbiddenException('Profile not completed');
    }
    return utilisateur;
  }

  private async assertNotActiveRental(vehiculeId: string): Promise<void> {
    const active = await this.prisma.reservation.findFirst({
      where: { vehiculeId, statut: { in: ['EN_COURS', 'CONFIRMEE'] } },
      select: { id: true },
    });
    if (active) {
      throw new ConflictException('Operation not allowed: vehicle has an active or confirmed rental');
    }
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  /**
   * POST /vehicles — Créer un véhicule pour le propriétaire connecté.
   * Statut initial :
   * - BROUILLON si KYC non vérifié
   * - EN_ATTENTE_VALIDATION si KYC vérifié
   */
  async create(user: RequestUser, dto: CreateVehicleDto) {
    const utilisateur = await this.getUtilisateurOrThrow(user.sub);
    if (utilisateur.statutKyc === StatutKyc.NON_VERIFIE || utilisateur.statutKyc === StatutKyc.REJETE) {
      throw new ForbiddenException('KYC submission required');
    }
    const statutInitial =
      utilisateur.statutKyc === StatutKyc.VERIFIE
        ? StatutVehicule.EN_ATTENTE_VALIDATION
        : StatutVehicule.BROUILLON;

    try {
      return await this.prisma.vehicule.create({
        data: {
          proprietaireId: utilisateur.id,
          marque: dto.marque,
          modele: dto.modele,
          annee: dto.annee,
          type: dto.type,
          carburant: dto.carburant ?? null,
          transmission: dto.transmission ?? null,
          nombrePlaces: dto.nombrePlaces ?? null,
          immatriculation: dto.immatriculation.toUpperCase().replace(/\s/g, ''),
          prixParJour: dto.prixParJour,
          ville: dto.ville,
          adresse: dto.adresse,
          latitude: dto.latitude ?? null,
          longitude: dto.longitude ?? null,
          joursMinimum: dto.joursMinimum ?? 1,
          ageMinimum: dto.ageMinimum ?? 18,
          zoneConduite: dto.zoneConduite ?? null,
          assurance: dto.assurance ?? null,
          reglesSpecifiques: dto.reglesSpecifiques ?? null,
          statut: statutInitial,
          tarifsProgressifs: dto.tiers?.length
            ? {
              create: dto.tiers.map((t, i) => ({
                joursMin: t.joursMin,
                joursMax: t.joursMax ?? null,
                prix: t.prix,
                position: i,
              })),
            }
            : undefined,
        },
        include: {
          photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
          tarifsProgressifs: { orderBy: { position: 'asc' } },
        },
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('A vehicle with this registration number already exists');
      }
      throw err;
    }
  }

  /**
   * GET /vehicles/me — Liste les véhicules du propriétaire avec nb réservations.
   */
  async findMyVehicles(user: RequestUser) {
    const utilisateur = await this.getUtilisateurOrThrow(user.sub);

    const vehicles = await this.prisma.vehicule.findMany({
      where: { proprietaireId: utilisateur.id },
      orderBy: { creeLe: 'desc' },
      include: {
        photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
        tarifsProgressifs: { orderBy: { position: 'asc' } },
        _count: { select: { reservations: true } },
      },
    });

    // Batch-check active/confirmed reservations to compute per-vehicle lock flag.
    const activeResa = await this.prisma.reservation.findMany({
      where: {
        vehiculeId: { in: vehicles.map((v) => v.id) },
        statut: { in: ['EN_COURS', 'CONFIRMEE'] },
      },
      select: { vehiculeId: true },
      distinct: ['vehiculeId'],
    });
    const lockedIds = new Set(activeResa.map((r) => r.vehiculeId));

    return vehicles.map((v) => ({ ...v, estVerrouille: lockedIds.has(v.id) }));
  }

  /**
   * GET /vehicles/:id — Détail véhicule.
   * - Propriétaire : toujours visible (quel que soit le statut).
   * - Public : uniquement si VERIFIE.
   */
  async findOne(user: RequestUser | null, id: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
        tarifsProgressifs: { orderBy: { position: 'asc' } },
        proprietaire: { select: { prenom: true, nom: true, avatarUrl: true } },
        _count: { select: { reservations: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Le propriétaire peut toujours voir son propre véhicule.
    if (user?.sub) {
      const utilisateur = await this.prisma.utilisateur.findUnique({
        where: { userId: user.sub },
        select: { id: true },
      });
      if (utilisateur?.id === vehicle.proprietaireId) {
        return vehicle;
      }
    }

    // Pour le public : seulement les véhicules vérifiés.
    if (vehicle.statut !== StatutVehicule.VERIFIE) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  /**
   * GET /vehicles/:id/pricing?days=N — Tarification dynamique publique.
   * Utilise les TarifTier du véhicule pour résoudre le prix effectif.
   */
  async getPricing(vehicleId: string, nbJours: number) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      select: {
        prixParJour: true,
        tarifsProgressifs: {
          orderBy: { joursMin: 'asc' },
          select: { joursMin: true, joursMax: true, prix: true },
        },
      },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const result = this.pricing.calculate(
      vehicle.prixParJour,
      nbJours,
      vehicle.tarifsProgressifs,
    );

    return {
      nbJours,
      prixParJour: Number(result.prixParJour),
      totalBase: Number(result.totalBase),
      tauxCommission: Number(result.tauxCommission),
      montantCommission: Number(result.montantCommission),
      totalLocataire: Number(result.totalLocataire),
      netProprietaire: Number(result.netProprietaire),
    };
  }

  /**
   * PATCH /vehicles/:id — Modifier un véhicule.
   * Interdit si une location est EN_COURS.
   */
  async update(vehicleId: string, dto: UpdateVehicleDto) {
    await this.assertNotActiveRental(vehicleId);

    try {
      // Si des tiers sont fournis, on remplace tout (delete + recreate).
      return await this.prisma.$transaction(async (tx) => {
        if (dto.tiers !== undefined) {
          await tx.tarifTier.deleteMany({ where: { vehiculeId: vehicleId } });
        }

        return tx.vehicule.update({
          where: { id: vehicleId },
          data: {
            marque: dto.marque,
            modele: dto.modele,
            annee: dto.annee,
            type: dto.type,
            carburant: dto.carburant,
            transmission: dto.transmission,
            nombrePlaces: dto.nombrePlaces,
            immatriculation: dto.immatriculation
              ? dto.immatriculation.toUpperCase().replace(/\s/g, '')
              : undefined,
            prixParJour: dto.prixParJour,
            ville: dto.ville,
            adresse: dto.adresse,
            latitude: dto.latitude,
            longitude: dto.longitude,
            joursMinimum: dto.joursMinimum,
            ageMinimum: dto.ageMinimum,
            zoneConduite: dto.zoneConduite,
            assurance: dto.assurance,
            reglesSpecifiques: dto.reglesSpecifiques,
            tarifsProgressifs: dto.tiers?.length
              ? {
                create: dto.tiers.map((t, i) => ({
                  joursMin: t.joursMin,
                  joursMax: t.joursMax ?? null,
                  prix: t.prix,
                  position: i,
                })),
              }
              : undefined,
          },
          include: {
            photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
            tarifsProgressifs: { orderBy: { position: 'asc' } },
          },
        });
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('A vehicle with this registration number already exists');
      }
      throw err;
    }
  }

  /**
   * DELETE /vehicles/:id — Archiver un véhicule (statut → ARCHIVE, pas de suppression).
   * Interdit si une location est EN_COURS.
   */
  async archive(vehicleId: string) {
    await this.assertNotActiveRental(vehicleId);

    const photos = await this.prisma.photoVehicule.findMany({
      where: { vehiculeId: vehicleId },
      select: { publicId: true },
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.photoVehicule.deleteMany({ where: { vehiculeId: vehicleId } });
      const updated = await tx.vehicule.update({
        where: { id: vehicleId },
        data: { statut: StatutVehicule.ARCHIVE },
        select: { id: true, statut: true },
      });
      const publicIds = photos.map((p) => p.publicId).filter(Boolean) as string[];
      if (publicIds.length > 0) {
        await Promise.all(
          publicIds.map((id) => this.cloudinary.deleteByPublicId(id).catch(() => { })),
        );
      }
      return updated;
    });
  }

  // ── Recherche ────────────────────────────────────────────────────────────────

  /**
   * GET /vehicles/search — Recherche publique avec disponibilité via NOT EXISTS.
   * Cache Redis TTL 60s, clé = sha256(params normalisés).
   */
  async search(dto: SearchVehiclesDto): Promise<{
    data: {
      id: string;
      marque: string;
      modele: string;
      annee: number;
      type: string;
      prixParJour: number;
      ville: string;
      note: number;
      totalAvis: number;
      statut: string;
      totalLocations: number;
      photoUrl: string | null;
      tarifsProgressifs: Array<{
        id: string;
        joursMin: number;
        joursMax: number | null;
        prix: string;
        position: number;
      }>;
    }[];
    page: number;
  }> {
    const page = dto.page ?? 1;
    const offset = (page - 1) * SEARCH_PAGE_SIZE;

    // ── Cache ────────────────────────────────────────────────────────────────
    const cityKey = dto.ville ? dto.ville.toLowerCase() : 'all';
    const cacheParams = JSON.stringify({
      ville: cityKey,
      dateDebut: dto.dateDebut ?? null,
      dateFin: dto.dateFin ?? null,
      type: dto.type ?? null,
      prixMin: dto.prixMin ?? null,
      prixMax: dto.prixMax ?? null,
      carburant: dto.carburant ?? null,
      transmission: dto.transmission ?? null,
      placesMin: dto.placesMin ?? null,
      noteMin: dto.noteMin ?? null,
      sortBy: dto.sortBy ?? null,
      sortOrder: dto.sortOrder ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      rayon: dto.rayon ?? null,
      equipements: dto.equipements ?? null,
      page,
    });
    const cacheKey =
      `${SEARCH_CACHE_PREFIX}${cityKey}:` +
      crypto.createHash('sha256').update(cacheParams).digest('hex');

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ReturnType<VehiclesService['search']> extends Promise<infer T> ? T : never;
    }

    // ── Filtres dynamiques ────────────────────────────────────────────────────
    const villeCondition = dto.ville
      ? Prisma.sql`AND LOWER(v.ville) = LOWER(${dto.ville})`
      : Prisma.empty;

    const typeCondition = dto.type
      ? Prisma.sql`AND v.type::text = ${dto.type}`
      : Prisma.empty;

    const prixMinCondition = dto.prixMin != null
      ? Prisma.sql`AND v."prixParJour" >= ${dto.prixMin}`
      : Prisma.empty;

    const prixMaxCondition = dto.prixMax != null
      ? Prisma.sql`AND v."prixParJour" <= ${dto.prixMax}`
      : Prisma.empty;

    const carburantCondition = dto.carburant
      ? Prisma.sql`AND v.carburant::text = ${dto.carburant}`
      : Prisma.empty;

    const transmissionCondition = dto.transmission
      ? Prisma.sql`AND v.transmission::text = ${dto.transmission}`
      : Prisma.empty;

    const placesCondition = dto.placesMin != null
      ? Prisma.sql`AND v."nombrePlaces" >= ${dto.placesMin}`
      : Prisma.empty;

    const noteCondition = dto.noteMin != null
      ? Prisma.sql`AND v.note >= ${dto.noteMin}`
      : Prisma.empty;

    const dateCondition =
      dto.dateDebut && dto.dateFin
        ? Prisma.sql`
            AND NOT EXISTS (
              SELECT 1 FROM "Reservation" r
              WHERE r."vehiculeId" = v.id
                AND r.statut::text = ANY(ARRAY['PAYEE', 'CONFIRMEE', 'EN_COURS'])
                AND r."dateDebut" < ${new Date(dto.dateFin)}
                AND r."dateFin" > ${new Date(dto.dateDebut)}
            )
            AND NOT EXISTS (
              SELECT 1 FROM "IndisponibiliteVehicule" iv
              WHERE iv."vehiculeId" = v.id
                AND iv."dateDebut" <= ${new Date(dto.dateFin)}::date
                AND iv."dateFin" >= ${new Date(dto.dateDebut)}::date
            )`
        : Prisma.empty;

    // Geolocation (Haversine formula)
    const geoCondition =
      dto.latitude != null && dto.longitude != null
        ? Prisma.sql`AND v.latitude IS NOT NULL AND v.longitude IS NOT NULL
            AND ( 6371 * acos(
              cos(radians(${dto.latitude})) * cos(radians(v.latitude::float))
              * cos(radians(v.longitude::float) - radians(${dto.longitude}))
              + sin(radians(${dto.latitude})) * sin(radians(v.latitude::float))
            )) <= ${dto.rayon ?? 30}`
        : Prisma.empty;

    // Equipment filter
    const equipementCondition =
      dto.equipements?.length
        ? Prisma.sql`AND (
            SELECT COUNT(*) FROM "VehiculeEquipement" ve
            JOIN "Equipement" eq ON eq.id = ve."equipementId"
            WHERE ve."vehiculeId" = v.id
              AND eq.nom = ANY(ARRAY[${Prisma.join(dto.equipements)}]::text[])
          ) >= ${dto.equipements.length}`
        : Prisma.empty;

    // ── Requête native ────────────────────────────────────────────────────────
    const orderFieldMap: Record<NonNullable<typeof dto.sortBy>, string> = {
      totalLocations: 'v."totalLocations"',
      note: 'v.note',
      prixParJour: 'v."prixParJour"',
      annee: 'v.annee',
    };
    const orderField = dto.sortBy ? orderFieldMap[dto.sortBy] : 'v.note';
    const orderDir = dto.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const rows = await this.prisma.$queryRaw<VehicleSearchRow[]>`
      SELECT
        v.id,
        v.marque,
        v.modele,
        v.annee,
        v.type::text AS type,
        v."prixParJour",
        v.ville,
        v.note,
        v."totalAvis",
        v.statut::text AS statut,
        v."totalLocations",
        (
          SELECT p.url
          FROM "PhotoVehicule" p
          WHERE p."vehiculeId" = v.id AND p."estPrincipale" = true
          LIMIT 1
        ) AS "photoUrl"
      FROM "Vehicule" v
      WHERE v.statut::text = 'VERIFIE'
        ${villeCondition}
        ${typeCondition}
        ${prixMinCondition}
        ${prixMaxCondition}
        ${carburantCondition}
        ${transmissionCondition}
        ${placesCondition}
        ${noteCondition}
        ${dateCondition}
        ${geoCondition}
        ${equipementCondition}
      ORDER BY ${Prisma.raw(orderField)} ${Prisma.raw(orderDir)}
      LIMIT ${Prisma.raw(String(SEARCH_PAGE_SIZE))} OFFSET ${Prisma.raw(String(offset))}
    `;

    const ids = rows.map((r) => r.id);
    const tiers = await this.prisma.tarifTier.findMany({
      where: { vehiculeId: { in: ids } },
      orderBy: [{ vehiculeId: 'asc' }, { position: 'asc' }],
      select: {
        id: true,
        vehiculeId: true,
        joursMin: true,
        joursMax: true,
        prix: true,
        position: true,
      },
    });
    const tiersByVehicle = new Map<string, typeof tiers>();
    for (const t of tiers) {
      const arr = tiersByVehicle.get(t.vehiculeId) ?? [];
      arr.push(t);
      tiersByVehicle.set(t.vehiculeId, arr);
    }

    const result = {
      data: rows.map((r) => ({
        id: r.id,
        marque: r.marque,
        modele: r.modele,
        annee: Number(r.annee),
        type: r.type,
        prixParJour: Number(r.prixParJour),
        ville: r.ville,
        note: Number(r.note),
        totalAvis: Number((r as any).totalAvis ?? 0),
        statut: (r as any).statut ?? 'VERIFIE',
        totalLocations: Number(r.totalLocations),
        photoUrl: r.photoUrl,
        tarifsProgressifs: (tiersByVehicle.get(r.id) ?? []).map((t) => ({
          id: t.id,
          joursMin: t.joursMin,
          joursMax: t.joursMax,
          prix: t.prix.toString(),
          position: t.position,
        })),
      })),
      page,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), SEARCH_CACHE_TTL);
    return result;
  }

  /**
   * Invalide tout le cache de recherche véhicules.
   * À appeler depuis CreateReservation et CancelReservation.
   */
  async invalidateSearchCache(city?: string): Promise<void> {
    const cityKey = city?.toLowerCase();
    const pattern = cityKey ? `${SEARCH_CACHE_PREFIX}${cityKey}:*` : `${SEARCH_CACHE_PREFIX}*`;
    await this.redis.delPattern(pattern);
  }

  // ── Photos ───────────────────────────────────────────────────────────────────

  /**
   * POST /vehicles/:id/photos — Uploader une photo (max 8 par véhicule).
   */
  async addPhoto(vehiculeId: string, file: Express.Multer.File) {
    const count = await this.prisma.photoVehicule.count({
      where: { vehiculeId },
    });

    if (count >= MAX_PHOTOS) {
      throw new BadRequestException(`Maximum ${MAX_PHOTOS} photos allowed per vehicle`);
    }

    try {
      await assertValidImageBuffer(file.buffer, ALLOWED_MIMES);
    } catch {
      throw new BadRequestException('Invalid file format. Allowed: JPEG, PNG, WebP.');
    }

    const { url, publicId } = await this.cloudinary.uploadVehiclePhoto(file.buffer);

    return this.prisma.photoVehicule.create({
      data: {
        vehiculeId,
        url,
        publicId,
        position: count,
        estPrincipale: count === 0,
      },
    });
  }

  /**
   * DELETE /vehicles/:id/photos/:photoId — Supprimer une photo.
   * Si la photo supprimée était principale, la suivante devient principale.
   */
  async deletePhoto(vehiculeId: string, photoId: string) {
    const photo = await this.prisma.photoVehicule.findFirst({
      where: { id: photoId, vehiculeId },
      select: { id: true, estPrincipale: true, publicId: true },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.photoVehicule.delete({ where: { id: photoId } });
    if (photo.publicId) {
      await this.cloudinary.deleteByPublicId(photo.publicId).catch(() => {
        /* best-effort */
      });
    }

    // Si la photo supprimée était principale → promouvoir la suivante.
    if (photo.estPrincipale) {
      const next = await this.prisma.photoVehicule.findFirst({
        where: { vehiculeId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      if (next) {
        await this.prisma.photoVehicule.update({
          where: { id: next.id },
          data: { estPrincipale: true },
        });
      }
    }

    return { deleted: true };
  }

  // ── Admin ─────────────────────────────────────────────────────────────────────

  /**
   * GET /admin/vehicles — Liste tous les véhicules, filtrable par statut.
   * Supporte le statut virtuel PENDING (EN_ATTENTE_VALIDATION + BROUILLON).
   */
  async adminListVehicles(statut?: StatutVehicule | 'PENDING') {
    const where =
      statut === 'PENDING'
        ? { statut: { in: [StatutVehicule.EN_ATTENTE_VALIDATION, StatutVehicule.BROUILLON] } }
        : statut
          ? { statut }
          : {};

    const vehicles = await this.prisma.vehicule.findMany({
      where,
      orderBy: { creeLe: 'asc' },
      include: {
        photos: { orderBy: { position: 'asc' } },
        proprietaire: { select: { id: true, prenom: true, nom: true, email: true, telephone: true } },
        equipements: { include: { equipement: true } },
        _count: { select: { reservations: true } },
      },
    });

    return vehicles.map((v) => ({
      id: v.id,
      marque: v.marque,
      modele: v.modele,
      annee: v.annee,
      type: v.type,
      transmission: v.transmission ?? null,
      immatriculation: v.immatriculation,
      carburant: v.carburant ?? null,
      nombrePlaces: v.nombrePlaces ?? null,
      prixParJour: Number(v.prixParJour),
      ville: v.ville,
      adresse: v.adresse,
      joursMinimum: v.joursMinimum,
      ageMinimum: v.ageMinimum,
      zoneConduite: v.zoneConduite ?? null,
      assurance: v.assurance ?? null,
      reglesSpecifiques: v.reglesSpecifiques ?? null,
      note: Number(v.note),
      totalAvis: v.totalAvis,
      totalLocations: v.totalLocations,
      statut: v.statut,
      creeLe: v.creeLe.toISOString(),
      photos: v.photos.map((p) => ({ id: p.id, url: p.url, estPrincipale: p.estPrincipale })),
      equipements: v.equipements.map((ve) => ve.equipement.nom),
      proprietaire: v.proprietaire
        ? {
          id: v.proprietaire.id,
          prenom: v.proprietaire.prenom ?? null,
          nom: v.proprietaire.nom ?? null,
          email: v.proprietaire.email ?? null,
          telephone: v.proprietaire.telephone ?? null,
        }
        : null,
    }));
  }

  /**
   * PATCH /admin/vehicles/:id/validate — Valider un véhicule (VERIFIE).
   * Invalide le cache de recherche et notifie le propriétaire.
   */
  async validateVehicle(vehicleId: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      include: {
        proprietaire: { select: { telephone: true, prenom: true } },
      },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.statut === StatutVehicule.VERIFIE) {
      throw new BadRequestException('Vehicle is already verified');
    }

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: { statut: StatutVehicule.VERIFIE },
      select: { id: true, statut: true, marque: true, modele: true },
    });

    await this.invalidateSearchCache(vehicle.ville);

    // Invalidate Next.js cache
    this.revalidate.revalidatePath(`/vehicle/${vehicleId}`).catch(() => { });
    this.revalidate.revalidatePath('/explorer').catch(() => { });
    if (vehicle.ville) {
      this.revalidate.revalidatePath(`/location/${encodeURIComponent(vehicle.ville.toLowerCase())}`).catch(() => { });
    }

    const phone = vehicle.proprietaire.telephone?.trim();
    if (phone) {
      const prenom = vehicle.proprietaire.prenom ?? 'Propriétaire';
      await this.notification.sendWhatsApp({
        to: `whatsapp:${phone.startsWith('+') ? phone : `+221${phone}`}`,
        body: `Bonjour ${prenom}, votre véhicule ${vehicle.marque} ${vehicle.modele} a été validé et est maintenant disponible à la location sur Auto Loc. 🎉`,
      });
    }

    return updated;
  }

  /**
   * PATCH /admin/vehicles/:id/suspend — Suspendre un véhicule (SUSPENDU).
   * Invalide le cache de recherche et notifie le propriétaire avec la raison.
   */
  async suspendVehicle(vehicleId: string, raison: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      include: {
        proprietaire: { select: { telephone: true, prenom: true } },
      },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.statut === StatutVehicule.SUSPENDU) {
      throw new BadRequestException('Vehicle is already suspended');
    }

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: { statut: StatutVehicule.SUSPENDU },
      select: { id: true, statut: true, marque: true, modele: true },
    });

    await this.invalidateSearchCache(vehicle.ville);

    // Invalidate Next.js cache
    this.revalidate.revalidatePath(`/vehicle/${vehicleId}`).catch(() => { });
    this.revalidate.revalidatePath('/explorer').catch(() => { });
    if (vehicle.ville) {
      this.revalidate.revalidatePath(`/location/${encodeURIComponent(vehicle.ville.toLowerCase())}`).catch(() => { });
    }

    const phone = vehicle.proprietaire.telephone?.trim();
    if (phone) {
      const prenom = vehicle.proprietaire.prenom ?? 'Propriétaire';
      await this.notification.sendWhatsApp({
        to: `whatsapp:${phone.startsWith('+') ? phone : `+221${phone}`}`,
        body: `Bonjour ${prenom}, votre véhicule ${vehicle.marque} ${vehicle.modele} a été suspendu sur Auto Loc.\nRaison : ${raison}\nContactez notre support pour plus d'informations.`,
      });
    }

    return updated;
  }

  // ── GET /vehicles/:id/reservations ──────────────────────────────────────────

  async findReservationsForVehicle(vehiculeId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { vehiculeId },
      orderBy: { creeLe: 'desc' },
      include: {
        locataire: {
          select: { id: true, prenom: true, nom: true, telephone: true },
        },
        paiement: {
          select: { statut: true, fournisseur: true },
        },
      },
    });
    return { data: reservations, total: reservations.length };
  }

  // ── Indisponibilités (calendrier disponibilité) ───────────────────────

  async createIndisponibilite(vehiculeId: string, dto: CreateIndisponibiliteDto) {
    const dateDebut = new Date(dto.dateDebut);
    const dateFin = new Date(dto.dateFin);

    if (dateFin < dateDebut) {
      throw new BadRequestException('dateFin doit être postérieure ou égale à dateDebut');
    }

    // Vérifier qu'il n'y a pas de réservation active pendant la période
    const conflict = await this.prisma.reservation.findFirst({
      where: {
        vehiculeId,
        statut: { in: ['PAYEE', 'CONFIRMEE', 'EN_COURS'] },
        dateDebut: { lt: dateFin },
        dateFin: { gt: dateDebut },
      },
      select: { id: true },
    });
    if (conflict) {
      throw new ConflictException('Il y a déjà une réservation active pendant cette période');
    }

    const indisponibilite = await this.prisma.indisponibiliteVehicule.create({
      data: {
        vehiculeId,
        dateDebut,
        dateFin,
        motif: dto.motif ?? null,
      },
    });

    await this.invalidateSearchCache();
    return indisponibilite;
  }

  async findIndisponibilites(vehiculeId: string) {
    const indisponibilites = await this.prisma.indisponibiliteVehicule.findMany({
      where: { vehiculeId },
      orderBy: { dateDebut: 'asc' },
    });
    return { data: indisponibilites, total: indisponibilites.length };
  }

  async deleteIndisponibilite(vehiculeId: string, indispoId: string) {
    const indispo = await this.prisma.indisponibiliteVehicule.findFirst({
      where: { id: indispoId, vehiculeId },
      select: { id: true },
    });
    if (!indispo) throw new NotFoundException('Indisponibilité non trouvée');

    await this.prisma.indisponibiliteVehicule.delete({ where: { id: indispoId } });
    await this.invalidateSearchCache();
    return { deleted: true };
  }

  // ── DOCUMENTS VÉHICULE ──────────────────────────────────────────────────

  async uploadCarteGrise(vehiculeId: string, file: Express.Multer.File) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehiculeId },
      select: { carteGrisePublicId: true },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    // Delete old document if exists
    if (vehicle.carteGrisePublicId) {
      await this.cloudinary.deleteByPublicId(vehicle.carteGrisePublicId).catch(() => { });
    }

    const upload = await this.cloudinary.uploadVehicleDocument(file.buffer, vehiculeId, 'carte-grise');

    await this.prisma.vehicule.update({
      where: { id: vehiculeId },
      data: { carteGriseUrl: upload.url, carteGrisePublicId: upload.publicId },
    });

    return { url: upload.url };
  }

  async uploadAssuranceDoc(vehiculeId: string, file: Express.Multer.File) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehiculeId },
      select: { assuranceDocPublicId: true },
    });
    if (!vehicle) throw new NotFoundException('Véhicule non trouvé');

    if (vehicle.assuranceDocPublicId) {
      await this.cloudinary.deleteByPublicId(vehicle.assuranceDocPublicId).catch(() => { });
    }

    const upload = await this.cloudinary.uploadVehicleDocument(file.buffer, vehiculeId, 'assurance');

    await this.prisma.vehicule.update({
      where: { id: vehiculeId },
      data: { assuranceDocUrl: upload.url, assuranceDocPublicId: upload.publicId },
    });

    return { url: upload.url };
  }
}
