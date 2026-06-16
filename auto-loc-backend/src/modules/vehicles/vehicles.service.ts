import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatutVehicule, StatutKyc, RoleProfile } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../infrastructure/cloudinary/cloudinary.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
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
const SEARCH_CACHE_TTL = 60;    // secondes
const SEARCH_CACHE_PREFIX = 'vehicles:search:';
const DETAIL_CACHE_PREFIX = 'vehicles:detail:';
const DETAIL_CACHE_TTL = 300;   // 5 minutes

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
  carburant: string | null;
  transmission: string | null;
  nombrePlaces: number | null;
  isFeatured: boolean;
}

interface TarifTierRow {
  id: string;
  vehiculeId: string;
  joursMin: number;
  joursMax: number | null;
  prix: Prisma.Decimal;
  position: number;
}

const FEED_CACHE_KEY = 'vehicles:feed:home';
const FEED_CACHE_TTL = 120; // secondes
const FEED_SECTION_SIZE = 10;
const FEED_NOUVEAUTES_WINDOW_DAYS = 14;

@Injectable()
export class VehiclesService {
  /** Colonnes véhicule + photo de couverture, partagées entre search() et getHomeFeed(). */
  private static readonly VEHICLE_SELECT_FRAGMENT = Prisma.sql`
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
    v.carburant::text AS carburant,
    v.transmission::text AS transmission,
    v."nombrePlaces",
    v."isFeatured",
    (
      SELECT p.url
      FROM "PhotoVehicule" p
      WHERE p."vehiculeId" = v.id AND p."estPrincipale" = true
      LIMIT 1
    ) AS "photoUrl"
  `;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly redis: RedisService,
    private readonly notification: NotificationService,
    private readonly pricing: ReservationPricingService,
    private readonly revalidate: RevalidateService,
    private readonly telegram: TelegramService,
  ) { }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async getUtilisateurOrThrow(userId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId },
      select: { id: true, statutKyc: true },
    });
    if (!utilisateur) {
      throw new ForbiddenException('Profil incomplet');
    }
    return utilisateur;
  }

  private async assertNotActiveRental(vehiculeId: string): Promise<void> {
    const active = await this.prisma.reservation.findFirst({
      where: { vehiculeId, statut: { in: ['EN_COURS', 'CONFIRMEE'] } },
      select: { id: true },
    });
    if (active) {
      throw new ConflictException('Opération refusée : le véhicule a une location active ou confirmée');
    }
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  getUploadSignature() {
    return this.cloudinary.getUploadSignature();
  }

  /**
   * POST /vehicles — Créer un véhicule pour le propriétaire connecté.
   * Transaction unique : véhicule + documents uploadés directement.
   * Statut initial :
   * - BROUILLON si KYC non vérifié
   * - EN_ATTENTE_VALIDATION si KYC vérifié
   */
  async create(user: RequestUser, dto: CreateVehicleDto) {
    const utilisateur = await this.getUtilisateurOrThrow(user.sub);
    if (utilisateur.statutKyc === StatutKyc.NON_VERIFIE || utilisateur.statutKyc === StatutKyc.REJETE) {
      throw new ForbiddenException('Soumission du KYC requise');
    }
    if (!dto.photos?.length) {
      throw new BadRequestException('Au moins une photo du véhicule est requise');
    }
    if (!dto.carteGriseUrl || !dto.carteGrisePublicId) {
      throw new BadRequestException('La carte grise est requise');
    }
    if (!dto.assuranceDocUrl || !dto.assuranceDocPublicId) {
      throw new BadRequestException('Le document d’assurance est requis');
    }
    const statutInitial =
      utilisateur.statutKyc === StatutKyc.VERIFIE
        ? StatutVehicule.EN_ATTENTE_VALIDATION
        : StatutVehicule.BROUILLON;

    let result: Awaited<ReturnType<typeof this.prisma.vehicule.findUniqueOrThrow>>;
    try {
      result = await this.prisma.$transaction(async (tx) => {
        // Création du véhicule avec tous les documents en une seule transaction
        const vehicle = await tx.vehicule.create({
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
            assurance: dto.assurance, // Maintenant obligatoire
            carburantCondition: dto.carburantCondition ?? null,
            reglesSpecifiques: dto.reglesSpecifiques ?? null,
            fraisLivraison: dto.fraisLivraison ?? null,
            autoriseHorsDakar: dto.autoriseHorsDakar ?? false,
            supplementHorsDakarParJour: dto.supplementHorsDakarParJour ?? null,
            statut: statutInitial,
            carteGriseUrl: dto.carteGriseUrl ?? null,
            carteGrisePublicId: dto.carteGrisePublicId ?? null,
            assuranceDocUrl: dto.assuranceDocUrl ?? null,
            assuranceDocPublicId: dto.assuranceDocPublicId ?? null,
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
        });

        // Link equipements
        if (dto.equipements?.length) {
          const eqRecords = await Promise.all(
            dto.equipements.map((nom) =>
              tx.equipement.upsert({ where: { nom }, create: { nom }, update: {} }),
            ),
          );
          await tx.vehiculeEquipement.createMany({
            data: eqRecords.map((eq) => ({ vehiculeId: vehicle.id, equipementId: eq.id })),
          });
        }

        // Photos uploadées directement
        if (dto.photos?.length) {
          await tx.photoVehicule.createMany({
            data: dto.photos.map((p, i) => ({
              vehiculeId: vehicle.id,
              url: p.url,
              publicId: p.publicId,
              position: i,
              estPrincipale: i === 0,
            })),
          });
        }

        // Return the created vehicle directly (no refetch needed)
        return vehicle;
      }, { timeout: 20000 }); // Optimisé : 25s suffisant pour transaction sans refetch
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        const target = (err as { meta?: { target?: string[] } }).meta?.target ?? [];
        if (target.includes('immatriculation')) {
          throw new ConflictException('Un véhicule avec cette immatriculation existe déjà');
        }
        throw new ConflictException('Contrainte d\'unicité violée : ' + target.join(', '));
      }
      throw err;
    }

    // Alerte admin Telegram — uniquement si soumis pour validation (KYC vérifié)
    if (statutInitial === StatutVehicule.EN_ATTENTE_VALIDATION) {
      this.telegram.sendAdminAlert(
        `🚗 <b>Nouveau véhicule soumis</b>\n` +
        `${dto.marque} ${dto.modele} (${dto.annee}) — ${dto.ville}\n` +
        `Prix : ${dto.prixParJour} FCFA/j\n` +
        `Documents : ${dto.carteGriseUrl ? 'Carte grise' : ''}${dto.carteGriseUrl && dto.assuranceDocUrl ? ' + ' : ''}${dto.assuranceDocUrl ? 'Assurance' : ''}\n` +
        `<a href="https://autoloc.sn/dashboard/admin/vehicles">Valider →</a>`,
      ).catch(() => { });
    }

    return result!;
  }

  /**
   * GET /vehicles/me — Liste les véhicules du propriétaire avec nb réservations.
   */
  async findMyVehicles(user: RequestUser) {
    const utilisateur = await this.getUtilisateurOrThrow(user.sub);

    const vehicles = await this.prisma.vehicule.findMany({
      where: { proprietaireId: utilisateur.id },
      orderBy: { creeLe: 'desc' },
      take: 100,
      include: {
        photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
        tarifsProgressifs: { orderBy: { position: 'asc' } },
        equipements: { include: { equipement: true } },
        indisponibilites: {
          where: { dateFin: { gte: new Date() } },
          orderBy: { dateDebut: 'asc' },
        },
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
    // ── Chemin public : cache Redis (user non authentifié) ──────────────
    // On ne cache que les requêtes sans token pour garantir qu'un propriétaire
    // voit toujours son véhicule en temps réel (quel que soit son statut).
    if (!user) {
      const cacheKey = `${DETAIL_CACHE_PREFIX}${id}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const vehicle = await this.prisma.vehicule.findUnique({
        where: { id },
        include: {
          photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
          tarifsProgressifs: { orderBy: { position: 'asc' } },
          proprietaire: { select: { prenom: true, nom: true, avatarUrl: true, noteProprietaire: true, totalAvis: true } },
          equipements: { include: { equipement: true } },
          _count: { select: { reservations: true } },
        },
      });

      if (!vehicle || vehicle.statut !== StatutVehicule.VERIFIE) {
        throw new NotFoundException('Véhicule introuvable');
      }

      // Stockage fire-and-forget : une erreur Redis ne bloque pas la réponse.
      this.redis.set(cacheKey, JSON.stringify(vehicle), DETAIL_CACHE_TTL).catch(() => { });
      return vehicle;
    }

    // ── Chemin authentifié : toujours Postgres (fraîcheur garantie) ─────
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ estPrincipale: 'desc' }, { position: 'asc' }] },
        tarifsProgressifs: { orderBy: { position: 'asc' } },
        proprietaire: { select: { prenom: true, nom: true, avatarUrl: true, noteProprietaire: true, totalAvis: true } },
        equipements: { include: { equipement: true } },
        _count: { select: { reservations: true } },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable');
    }

    // Le propriétaire ou l'admin peut voir les documents via des URLs signées.
    const profile = await this.prisma.profile.findUnique({
      where: { userId: user.sub },
      select: { role: true, utilisateur: { select: { id: true } } },
    });

    const isOwner = profile?.utilisateur?.id === vehicle.proprietaireId;
    const isAdmin = profile?.role === RoleProfile.ADMIN;

    if (isOwner || isAdmin) {
      return {
        ...vehicle,
        carteGriseUrl: vehicle.carteGrisePublicId
          ? this.cloudinary.getSignedDocumentUrl(vehicle.carteGrisePublicId)
          : vehicle.carteGriseUrl, // Fallback vers l'URL brute si pas de PublicId
        assuranceDocUrl: vehicle.assuranceDocPublicId
          ? this.cloudinary.getSignedDocumentUrl(vehicle.assuranceDocPublicId)
          : vehicle.assuranceDocUrl,
        hasCarteGrise: !!vehicle.carteGriseUrl,
        hasAssuranceDoc: !!vehicle.assuranceDocUrl,
      };
    }

    // Pour les autres, on masque les URLs sensibles.
    const safeVehicle = {
      ...vehicle,
      carteGriseUrl: undefined,
      carteGrisePublicId: undefined,
      assuranceDocUrl: undefined,
      assuranceDocPublicId: undefined,
      hasCarteGrise: !!vehicle.carteGriseUrl,
      hasAssuranceDoc: !!vehicle.assuranceDocUrl,
    };

    if (vehicle.statut !== StatutVehicule.VERIFIE) {
      throw new NotFoundException('Véhicule introuvable');
    }

    return safeVehicle;
  }

  /**
   * Supprime le cache détail d'un véhicule spécifique.
   */
  private async invalidateDetailCache(vehicleId: string): Promise<void> {
    await this.redis.del(`${DETAIL_CACHE_PREFIX}${vehicleId}`).catch(() => { });
  }

  /**
   * GET /vehicles/:id/pricing?days=N&horsDakar=true|false — Tarification dynamique publique.
   * Utilise les TarifTier du véhicule pour résoudre le prix effectif.
   */
  async getPricing(vehicleId: string, nbJours: number, horsDakar: boolean = false) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      select: {
        prixParJour: true,
        autoriseHorsDakar: true,
        supplementHorsDakarParJour: true,
        tarifsProgressifs: {
          orderBy: { joursMin: 'asc' },
          select: { joursMin: true, joursMax: true, prix: true },
        },
      },
    });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');

    const supplement = horsDakar && vehicle.autoriseHorsDakar
      ? Number(vehicle.supplementHorsDakarParJour ?? 0)
      : 0;

    const result = this.pricing.calculate(
      vehicle.prixParJour,
      nbJours,
      vehicle.tarifsProgressifs,
      supplement,
    );

    return {
      nbJours,
      autoriseHorsDakar: vehicle.autoriseHorsDakar,
      supplementHorsDakar: supplement,
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

        // Handle equipements: delete existing + recreate
        if (dto.equipements !== undefined) {
          await tx.vehiculeEquipement.deleteMany({ where: { vehiculeId: vehicleId } });
          if (dto.equipements.length > 0) {
            const eqRecords = await Promise.all(
              dto.equipements.map((nom) =>
                tx.equipement.upsert({ where: { nom }, create: { nom }, update: {} }),
              ),
            );
            await tx.vehiculeEquipement.createMany({
              data: eqRecords.map((eq) => ({ vehiculeId: vehicleId, equipementId: eq.id })),
            });
          }
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
            carburantCondition: dto.carburantCondition,
            reglesSpecifiques: dto.reglesSpecifiques,
            fraisLivraison: dto.fraisLivraison,
            autoriseHorsDakar: dto.autoriseHorsDakar,
            supplementHorsDakarParJour: dto.supplementHorsDakarParJour,
            carteGriseUrl: dto.carteGriseUrl,
            carteGrisePublicId: dto.carteGrisePublicId,
            assuranceDocUrl: dto.assuranceDocUrl,
            assuranceDocPublicId: dto.assuranceDocPublicId,
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
            equipements: { include: { equipement: true } },
          },
        });
      }, { timeout: 15000 });
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'P2002') throw err;
      const target = (err as { meta?: { target?: string[] } }).meta?.target ?? [];
      if (target.includes('immatriculation')) {
        throw new ConflictException('Un véhicule avec cette immatriculation existe déjà');
      }
      throw new ConflictException('Contrainte d\'unicité violée : ' + target.join(', '));
    }

    await this.invalidateDetailCache(vehicleId);
  }

  /**
   * DELETE /vehicles/:id/permanent — Suppression définitive par le propriétaire.
   * Uniquement si ARCHIVE ou BROUILLON.
   */
  async deletePermanently(user: RequestUser, vehicleId: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      select: { id: true, statut: true, proprietaire: { select: { userId: true } } },
    });

    if (!vehicle) throw new NotFoundException('Véhicule introuvable');

    // Sécurité : seul le propriétaire peut supprimer définitivement
    if (vehicle.proprietaire.userId !== user.sub) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce véhicule');
    }

    const deletable: StatutVehicule[] = [StatutVehicule.BROUILLON, StatutVehicule.ARCHIVE];
    if (!deletable.includes(vehicle.statut)) {
      throw new BadRequestException(
        'Seuls les véhicules en brouillon ou archivés peuvent être supprimés définitivement.',
      );
    }

    // On vérifie qu'il n'y a pas de réservations EN_COURS ou CONFIRMEE (sécurité supplémentaire)
    await this.assertNotActiveRental(vehicleId);

    // Supprimer les photos Cloudinary en parallèle
    const photos = await this.prisma.photoVehicule.findMany({
      where: { vehiculeId: vehicleId },
      select: { publicId: true },
    });
    const publicIds = photos.map((p) => p.publicId).filter(Boolean) as string[];
    
    // Supprimer aussi le document de carte grise et assurance du cloud
    const vehicleDocs = await this.prisma.vehicule.findUnique({
        where: { id: vehicleId },
        select: { carteGrisePublicId: true, assuranceDocPublicId: true }
    });
    if (vehicleDocs?.carteGrisePublicId) publicIds.push(vehicleDocs.carteGrisePublicId);
    if (vehicleDocs?.assuranceDocPublicId) publicIds.push(vehicleDocs.assuranceDocPublicId);

    if (publicIds.length > 0) {
      await Promise.all(
        publicIds.map((id) => this.cloudinary.deleteByPublicId(id).catch(() => {})),
      );
    }

    // Suppression en cascade (Photos, Tiers, Equipements, Indispos sont supprimés par Prisma grâce au onDelete: Cascade)
    await this.prisma.vehicule.delete({ where: { id: vehicleId } });
    
    // Invalider le cache
    await this.invalidateDetailCache(vehicleId);
  }

  /**
   * DELETE /vehicles/:id — Archiver un véhicule (statut → ARCHIVE, pas de suppression).
   * Interdit si une location est EN_COURS.
   * Les données sont conservées pendant 30 jours avant suppression automatique.
   */
  async archive(vehicleId: string) {
    await this.assertNotActiveRental(vehicleId);

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: {
        statut: StatutVehicule.ARCHIVE,
        archiveLe: new Date(),
      },
      select: { id: true, statut: true, archiveLe: true },
    });

    await this.invalidateDetailCache(vehicleId);
    return updated;
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
    total: number;
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
      excludeIds: dto.excludeIds?.length ? [...dto.excludeIds].sort() : null,
      q: dto.q ?? null,
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

    let searchCondition = Prisma.empty;
    if (dto.q && dto.q.trim()) {
      const terms = dto.q.trim().split(/\s+/);
      const conditions = terms.map(term => {
        const pattern = `%${term}%`;
        return Prisma.sql`(v.marque ILIKE ${pattern} OR v.modele ILIKE ${pattern} OR v.ville ILIKE ${pattern})`;
      });
      searchCondition = Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}`;
    }

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

    // Exclusion explicite d'IDs (pagination invisible du feed accueil)
    const excludeCondition =
      dto.excludeIds?.length
        ? Prisma.sql`AND v.id <> ALL(ARRAY[${Prisma.join(dto.excludeIds)}]::uuid[])`
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

    // Separate queries for total count and paginated data
    const totalQuery = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count
      FROM "Vehicule" v
      WHERE v.statut::text = 'VERIFIE'
        ${villeCondition}
        ${prixMinCondition}
        ${prixMaxCondition}
        ${typeCondition}
        ${transmissionCondition}
        ${carburantCondition}
        ${placesCondition}
        ${noteCondition}
        ${dateCondition}
        ${geoCondition}
        ${equipementCondition}
        ${excludeCondition}
        ${searchCondition}
    `;
    const total = Number(totalQuery[0]?.count ?? 0);

    const rows = await this.prisma.$queryRaw<VehicleSearchRow[]>`
      SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
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
        ${excludeCondition}
        ${searchCondition}
      ORDER BY v."isFeatured" DESC, ${Prisma.raw(orderField)} ${Prisma.raw(orderDir)}
      LIMIT ${Prisma.raw(String(SEARCH_PAGE_SIZE))} OFFSET ${Prisma.raw(String(offset))}
    `;

    const ids = rows.map((r) => r.id);
    const tiersByVehicle = await this.hydrateTarifs(ids);

    const result = {
      data: rows.map((r) => this.mapSearchRow(r, tiersByVehicle)),
      page,
      total,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), SEARCH_CACHE_TTL);
    return result;
  }

  /** Fetch + groupe les paliers tarifaires par véhicule (réutilisé par search() et getHomeFeed()). */
  private async hydrateTarifs(ids: string[]): Promise<Map<string, TarifTierRow[]>> {
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
    const tiersByVehicle = new Map<string, TarifTierRow[]>();
    for (const t of tiers) {
      const arr = tiersByVehicle.get(t.vehiculeId) ?? [];
      arr.push(t);
      tiersByVehicle.set(t.vehiculeId, arr);
    }
    return tiersByVehicle;
  }

  /** Convertit une ligne SQL brute + ses tarifs en objet exposé côté API (réutilisé par search() et getHomeFeed()). */
  private mapSearchRow(r: VehicleSearchRow, tiersByVehicle: Map<string, TarifTierRow[]>) {
    return {
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
      carburant: r.carburant ?? null,
      transmission: r.transmission ?? null,
      nombrePlaces: r.nombrePlaces ? Number(r.nombrePlaces) : null,
      isFeatured: Boolean(r.isFeatured),
      photoUrl: r.photoUrl,
      tarifsProgressifs: (tiersByVehicle.get(r.id) ?? []).map((t) => ({
        id: t.id,
        joursMin: t.joursMin,
        joursMax: t.joursMax,
        prix: t.prix.toString(),
        position: t.position,
      })),
    };
  }

  /**
   * GET /vehicles/feed — Feed home : recommandés, sélection premium, nouveautés.
   * Une seule réponse composite, cache Redis 120s, jamais de section vide tant
   * qu'il existe au moins un véhicule VERIFIE (cascade de tri + backfill par doublon).
   */
  async getHomeFeed() {
    const cached = await this.redis.get(FEED_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as ReturnType<VehiclesService['buildHomeFeed']> extends Promise<infer T> ? T : never;
    }

    const result = await this.buildHomeFeed();
    await this.redis.set(FEED_CACHE_KEY, JSON.stringify(result), FEED_CACHE_TTL);
    return result;
  }

  private async buildHomeFeed() {
    // ── Premium : trié par nb de réservations, avec cascade de fallback ──────
    const premiumRows = await this.prisma.$queryRaw<VehicleSearchRow[]>`
      SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
      FROM "Vehicule" v
      WHERE v.statut::text = 'VERIFIE'
      ORDER BY v."totalLocations" DESC, v.note DESC, v."creeLe" DESC
      LIMIT ${Prisma.raw(String(FEED_SECTION_SIZE))}
    `;

    // ── Nouveautés : fenêtre de date précise, avec backfill si catalogue jeune ──
    const nouveautesRecentes = await this.prisma.$queryRaw<VehicleSearchRow[]>`
      SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
      FROM "Vehicule" v
      WHERE v.statut::text = 'VERIFIE'
        AND v."creeLe" >= NOW() - (INTERVAL '1 day' * ${FEED_NOUVEAUTES_WINDOW_DAYS})
      ORDER BY v."creeLe" DESC
      LIMIT ${Prisma.raw(String(FEED_SECTION_SIZE))}
    `;
    let nouveautesRows = nouveautesRecentes;
    if (nouveautesRows.length < FEED_SECTION_SIZE) {
      const already = nouveautesRows.map((r) => r.id);
      const backfillCondition = already.length
        ? Prisma.sql`AND v.id <> ALL(ARRAY[${Prisma.join(already)}]::uuid[])`
        : Prisma.empty;
      const backfill = await this.prisma.$queryRaw<VehicleSearchRow[]>`
        SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
        FROM "Vehicule" v
        WHERE v.statut::text = 'VERIFIE'
          ${backfillCondition}
        ORDER BY v."creeLe" DESC
        LIMIT ${Prisma.raw(String(FEED_SECTION_SIZE - nouveautesRows.length))}
      `;
      nouveautesRows = [...nouveautesRows, ...backfill];
    }

    const usedIds = [...new Set([...premiumRows.map((r) => r.id), ...nouveautesRows.map((r) => r.id)])];

    // ── Recommandé : aléatoire, exclusion best-effort des IDs déjà utilisés ──
    const excludeUsedCondition = usedIds.length
      ? Prisma.sql`AND v.id <> ALL(ARRAY[${Prisma.join(usedIds)}]::uuid[])`
      : Prisma.empty;
    let recommendedRows = await this.prisma.$queryRaw<VehicleSearchRow[]>`
      SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
      FROM "Vehicule" v
      WHERE v.statut::text = 'VERIFIE'
        ${excludeUsedCondition}
      ORDER BY RANDOM()
      LIMIT ${Prisma.raw(String(FEED_SECTION_SIZE))}
    `;
    if (recommendedRows.length < FEED_SECTION_SIZE) {
      // Pas assez de véhicules hors premium/nouveautés (catalogue réduit) : on
      // complète quitte à dupliquer plutôt que d'afficher une section tronquée.
      const already = recommendedRows.map((r) => r.id);
      const backfillCondition = already.length
        ? Prisma.sql`AND v.id <> ALL(ARRAY[${Prisma.join(already)}]::uuid[])`
        : Prisma.empty;
      const backfill = await this.prisma.$queryRaw<VehicleSearchRow[]>`
        SELECT ${VehiclesService.VEHICLE_SELECT_FRAGMENT}
        FROM "Vehicule" v
        WHERE v.statut::text = 'VERIFIE'
          ${backfillCondition}
        ORDER BY RANDOM()
        LIMIT ${Prisma.raw(String(FEED_SECTION_SIZE - recommendedRows.length))}
      `;
      recommendedRows = [...recommendedRows, ...backfill];
    }

    const allIds = [...new Set([...usedIds, ...recommendedRows.map((r) => r.id)])];
    const tiersByVehicle = await this.hydrateTarifs(allIds);

    return {
      premium: premiumRows.map((r) => this.mapSearchRow(r, tiersByVehicle)),
      nouveautes: nouveautesRows.map((r) => this.mapSearchRow(r, tiersByVehicle)),
      recommended: {
        items: recommendedRows.map((r) => this.mapSearchRow(r, tiersByVehicle)),
        excludedIds: usedIds,
      },
    };
  }

  /**
   * Invalide tout le cache de recherche véhicules (et le feed accueil, qui en dépend).
   * À appeler depuis CreateReservation et CancelReservation.
   */
  async invalidateSearchCache(city?: string): Promise<void> {
    const cityKey = city?.toLowerCase();
    const pattern = cityKey ? `${SEARCH_CACHE_PREFIX}${cityKey}:*` : `${SEARCH_CACHE_PREFIX}*`;
    await this.redis.delPattern(pattern);
    await this.redis.del(FEED_CACHE_KEY);
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
      throw new BadRequestException('Format de fichier invalide. Formats acceptés : JPEG, PNG, WebP.');
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
   * POST /vehicles/:id/photos/link — Enregistre une photo uploadée directement
   * vers Cloudinary (direct upload). Ne touche pas aux fichiers.
   */
  async linkPhoto(vehiculeId: string, url: string, publicId: string) {
    const count = await this.prisma.photoVehicule.count({ where: { vehiculeId } });
    if (count >= MAX_PHOTOS) {
      throw new BadRequestException('Maximum 8 photos atteint');
    }
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
      throw new NotFoundException('Photo introuvable');
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
  async adminListVehicles(statut?: StatutVehicule | 'PENDING', page = 1) {
    const where =
      statut === 'PENDING'
        ? { statut: { in: [StatutVehicule.EN_ATTENTE_VALIDATION, StatutVehicule.BROUILLON] } }
        : statut
          ? { statut }
          : {};

    const take = 30;
    const skip = (page - 1) * take;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicule.findMany({
        where,
        orderBy: { creeLe: 'asc' },
        take,
        skip,
        include: {
          photos: { orderBy: { position: 'asc' } },
          proprietaire: { select: { id: true, prenom: true, nom: true, email: true, telephone: true } },
          equipements: { include: { equipement: true } },
          _count: { select: { reservations: true } },
        },
      }),
      this.prisma.vehicule.count({ where }),
    ]);

    const data = vehicles.map((v) => ({
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
      carteGriseUrl: v.carteGriseUrl ?? null,
      assuranceDocUrl: v.assuranceDocUrl ?? null,
      fraisLivraison: v.fraisLivraison ? Number(v.fraisLivraison) : null,
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

    return { data, total, page, limit: take };
  }

  async adminGetVehicleDetail(id: string) {
    const v = await this.prisma.vehicule.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { position: 'asc' } },
        proprietaire: { select: { id: true, prenom: true, nom: true, email: true, telephone: true, avatarUrl: true } },
        equipements: { include: { equipement: true } },
        reservations: {
          orderBy: { creeLe: 'desc' },
          take: 10,
          include: { locataire: { select: { id: true, prenom: true, nom: true } } },
        },
        _count: { select: { reservations: true } },
      },
    });

    if (!v) throw new NotFoundException('Véhicule introuvable');

    return {
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
      carteGriseUrl: v.carteGriseUrl ?? null,
      assuranceDocUrl: v.assuranceDocUrl ?? null,
      fraisLivraison: v.fraisLivraison ? Number(v.fraisLivraison) : null,
      proprietaire: v.proprietaire,
      reservations: v.reservations.map(r => ({
        id: r.id,
        statut: r.statut,
        creeLe: r.creeLe,
        locataire: r.locataire,
        totalLocataire: Number(r.totalLocataire)
      })),
      _count: v._count
    };
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

    if (!vehicle) throw new NotFoundException('Véhicule introuvable');
    if (vehicle.statut === StatutVehicule.VERIFIE) {
      throw new BadRequestException('Ce véhicule est déjà vérifié');
    }

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: { statut: StatutVehicule.VERIFIE },
      select: { id: true, statut: true, marque: true, modele: true },
    });

    await this.invalidateSearchCache(vehicle.ville);
    await this.invalidateDetailCache(vehicleId);

    // Invalidate Next.js cache
    this.revalidate.revalidatePath(`/vehicle/${vehicleId}`).catch(() => { });
    this.revalidate.revalidatePath('/explorer').catch(() => { });
    if (vehicle.ville) {
      this.revalidate.revalidatePath(`/location/${encodeURIComponent(vehicle.ville.toLowerCase())}`).catch(() => { });
    }

    const phone = vehicle.proprietaire.telephone?.trim();
    if (phone) {
      this.notification.send({
        userId: vehicle.proprietaireId,
        phone,
        type: 'vehicle.validated',
        data: {
          prenom: vehicle.proprietaire.prenom,
          vehicule: `${vehicle.marque} ${vehicle.modele}`,
        },
      }).catch(() => { });
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

    if (!vehicle) throw new NotFoundException('Véhicule introuvable');
    if (vehicle.statut === StatutVehicule.SUSPENDU) {
      throw new BadRequestException('Ce véhicule est déjà suspendu');
    }

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: { statut: StatutVehicule.SUSPENDU },
      select: { id: true, statut: true, marque: true, modele: true },
    });

    await this.invalidateSearchCache(vehicle.ville);
    await this.invalidateDetailCache(vehicleId);

    // Invalidate Next.js cache
    this.revalidate.revalidatePath(`/vehicle/${vehicleId}`).catch(() => { });
    this.revalidate.revalidatePath('/explorer').catch(() => { });
    if (vehicle.ville) {
      this.revalidate.revalidatePath(`/location/${encodeURIComponent(vehicle.ville.toLowerCase())}`).catch(() => { });
    }

    const phone = vehicle.proprietaire.telephone?.trim();
    if (phone) {
      this.notification.send({
        userId: vehicle.proprietaireId,
        phone,
        type: 'vehicle.suspended',
        data: {
          prenom: vehicle.proprietaire.prenom,
          vehicule: `${vehicle.marque} ${vehicle.modele}`,
          raison,
        },
      }).catch(() => { });
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

  // ── Dates bloquées (public) ─────────────────────────────────────────────

  /**
   * GET /vehicles/:id/blocked-dates — Récupère toutes les périodes
   * indisponibles (réservations actives + indisponibilités manuelles).
   * Endpoint PUBLIC pour le calendrier de réservation côté locataire.
   */
  async getBlockedDates(vehiculeId: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehiculeId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');

    // Reservations actives (PAYEE, CONFIRMEE, EN_COURS)
    const reservations = await this.prisma.reservation.findMany({
      where: {
        vehiculeId,
        statut: { in: ['PAYEE', 'CONFIRMEE', 'EN_COURS'] },
      },
      select: { dateDebut: true, dateFin: true },
    });

    // Indisponibilités manuelles du propriétaire
    const indisponibilites = await this.prisma.indisponibiliteVehicule.findMany({
      where: { vehiculeId },
      select: { dateDebut: true, dateFin: true },
    });

    const blockedRanges = [
      ...reservations.map((r) => ({
        from: r.dateDebut.toISOString().split('T')[0],
        to: r.dateFin.toISOString().split('T')[0],
        type: 'reservation' as const,
      })),
      ...indisponibilites.map((i) => ({
        from: i.dateDebut.toISOString().split('T')[0],
        to: i.dateFin.toISOString().split('T')[0],
        type: 'indisponibilite' as const,
      })),
    ];

    return { blockedRanges };
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

  /**
   * PATCH /admin/vehicles/:id/feature
   * Active ou désactive la mise en avant d'un véhicule (max 5 simultanément).
   * Notifie le propriétaire et invalide le cache de recherche.
   */
  async featureVehicle(vehicleId: string, active: boolean, featuredUntil?: string) {
    const vehicle = await this.prisma.vehicule.findUnique({
      where: { id: vehicleId },
      include: {
        proprietaire: { select: { id: true, telephone: true, prenom: true, userId: true } },
      },
    });

    if (!vehicle) throw new NotFoundException('Véhicule introuvable');

    if (active) {
      const featuredCount = await this.prisma.vehicule.count({
        where: { isFeatured: true, id: { not: vehicleId } },
      });
      if (featuredCount >= 5) {
        throw new BadRequestException('Limite atteinte : 5 véhicules mis en avant simultanément maximum.');
      }
    }

    const updated = await this.prisma.vehicule.update({
      where: { id: vehicleId },
      data: {
        isFeatured: active,
        featuredUntil: active && featuredUntil ? new Date(featuredUntil) : null,
      },
      select: { id: true, isFeatured: true, featuredUntil: true, marque: true, modele: true },
    });

    await this.invalidateSearchCache(vehicle.ville);
    this.revalidate.revalidatePath('/explorer').catch(() => { });
    this.revalidate.revalidatePath('/').catch(() => { });

    if (active) {
      const phone = vehicle.proprietaire.telephone?.trim();
      if (phone) {
        this.notification.send({
          userId: vehicle.proprietaireId,
          phone,
          type: 'vehicle.featured',
          data: {
            prenom: vehicle.proprietaire.prenom,
            vehicule: `${vehicle.marque} ${vehicle.modele}`,
          },
        }).catch(() => { });
      }
    }

    return updated;
  }

  /**
   * Appelé par le cron quotidien pour désactiver les mises en avant expirées.
   */
  async expireFeaturedVehicles(): Promise<number> {
    const { count } = await this.prisma.vehicule.updateMany({
      where: { isFeatured: true, featuredUntil: { lte: new Date() } },
      data: { isFeatured: false, featuredUntil: null },
    });
    if (count > 0) {
      await this.invalidateSearchCache();
      this.revalidate.revalidatePath('/explorer').catch(() => { });
      this.revalidate.revalidatePath('/').catch(() => { });
    }
    return count;
  }

  }
