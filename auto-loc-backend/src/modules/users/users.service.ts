import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { BanUserDto } from './dto/ban-user.dto';
import { GetKycQueueDto } from './dto/get-kyc-queue.dto';
import { GetUsersQueueDto, UserQueueStatusFilter } from './dto/get-users-queue.dto';
import { RoleProfile, StatutKyc, StatutReservation, StatutRetrait, StatutLitige, StatutVehicule } from '@prisma/client';


@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) { }

  // ── Admin stats ─────────────────────────────────────────────────────────────

  async listAdminUsers(kycStatus?: StatutKyc, page = 1) {
    const where = kycStatus ? { statutKyc: kycStatus } : {};
    const take = 30;
    const skip = (page - 1) * take;

    const [users, total] = await Promise.all([
      this.prisma.utilisateur.findMany({
        where,
        orderBy: { creeLe: 'asc' },
        take,
        skip,
        include: {
          profile: { select: { role: true, createdAt: true } },
          vehicules: {
            include: {
              photos: { orderBy: { position: 'asc' } },
              equipements: { include: { equipement: true } },
            },
          },
          _count: { select: { vehicules: true } },
        },
      }),
      this.prisma.utilisateur.count({ where }),
    ]);

    const now = new Date();
    const data = users.map((u) => ({
      id: u.id,
      userId: u.userId,
      email: u.email,
      role: u.profile?.role ?? 'LOCATAIRE',
      createdAt: (u.profile?.createdAt ?? u.creeLe).toISOString(),
      isBanned: !u.actif || (!!u.bloqueJusqua && u.bloqueJusqua > now),
      banRaison: null,
      kycStatus: u.statutKyc,
      kyc: u.kycDocumentUrl || u.kycDocumentBackUrl || u.kycSelfieUrl || u.permisUrl ? {
        documentUrl: u.kycDocumentUrl ?? null,
        documentBackUrl: u.kycDocumentBackUrl ?? null,
        selfieUrl: u.kycSelfieUrl ?? null,
        permisUrl: u.permisUrl ?? null,
        soumisLe: u.misAJourLe.toISOString(),
      } : undefined,
      utilisateur: {
        prenom: u.prenom,
        nom: u.nom,
        telephone: u.telephone,
        avatarUrl: u.avatarUrl ?? null,
      },
      vehicles: u.vehicules.map((v) => ({
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
        photos: v.photos.map((p) => ({ url: p.url, estPrincipale: p.estPrincipale })),
        equipements: v.equipements.map((ve) => ve.equipement.nom),
      })),
      _count: { vehicles: u._count.vehicules },
    }));

    return { data, total, page, limit: take };
  }

  // ── Unified Admin Users Queue (Profile + Utilisateur Join) ───────────────

  async getUsersQueue(dto: GetUsersQueueDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Filter by role
    if (dto.role && dto.role !== 'ALL') {
      where.role = dto.role as RoleProfile;
    }

    // 2. Filter by search
    if (dto.search && dto.search.trim()) {
      const q = dto.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { userId: { contains: q, mode: 'insensitive' } },
        {
          utilisateur: {
            OR: [
              { prenom: { contains: q, mode: 'insensitive' } },
              { nom: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { telephone: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const now = new Date();

    // 3. Filter by status
    if (dto.status && dto.status !== UserQueueStatusFilter.ALL) {
      if (dto.status === UserQueueStatusFilter.ACTIVE) {
        where.utilisateur = {
          actif: true,
          OR: [{ bloqueJusqua: null }, { bloqueJusqua: { lte: now } }],
        };
      } else if (dto.status === UserQueueStatusFilter.BANNED) {
        where.utilisateur = {
          OR: [{ actif: false }, { bloqueJusqua: { gt: now } }],
        };
      } else if (dto.status === UserQueueStatusFilter.PENDING_KYC) {
        where.utilisateur = { statutKyc: StatutKyc.EN_ATTENTE };
      } else if (dto.status === UserQueueStatusFilter.STUCK_ONBOARDING) {
        where.OR = [
          { utilisateur: null },
          { utilisateur: { profileCompleted: false } },
        ];
      }
    }

    // Fetch profiles with utilisateur relation & counts
    const [profiles, total, countsRaw] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          utilisateur: {
            include: {
              _count: {
                select: {
                  vehicules: true,
                  reservationsLocataire: true,
                  reservationsProprietaire: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.profile.count({ where }),
      Promise.all([
        this.prisma.profile.count(), // total
        this.prisma.profile.count({ where: { role: RoleProfile.LOCATAIRE } }),
        this.prisma.profile.count({ where: { role: RoleProfile.PROPRIETAIRE } }),
        this.prisma.profile.count({ where: { role: RoleProfile.ADMIN } }),
        this.prisma.profile.count({ where: { role: RoleProfile.SUPPORT } }),
        this.prisma.utilisateur.count({ where: { statutKyc: StatutKyc.EN_ATTENTE } }),
        this.prisma.utilisateur.count({
          where: { OR: [{ actif: false }, { bloqueJusqua: { gt: now } }] },
        }),
        this.prisma.profile.count({
          where: { OR: [{ utilisateur: null }, { utilisateur: { profileCompleted: false } }] },
        }),
      ]),
    ]);

    const [
      totalCount,
      locatairesCount,
      proprietairesCount,
      adminsCount,
      supportCount,
      pendingKycCount,
      bannedCount,
      stuckOnboardingCount,
    ] = countsRaw;

    const data = profiles.map((p) => {
      const u = p.utilisateur;
      const isBanned = u ? (!u.actif || (!!u.bloqueJusqua && u.bloqueJusqua > now)) : false;
      const isStuckOnboarding = !u || !u.profileCompleted;

      return {
        id: u?.id ?? p.id,
        profileId: p.id,
        userId: p.userId,
        email: u?.email ?? p.email ?? '',
        phone: u?.telephone ?? p.phone ?? '',
        role: p.role,
        createdAt: p.createdAt.toISOString(),
        isBanned,
        banUntil: u?.bloqueJusqua ? u.bloqueJusqua.toISOString() : null,
        statutKyc: u?.statutKyc ?? StatutKyc.NON_VERIFIE,
        profileCompleted: u?.profileCompleted ?? false,
        isStuckOnboarding,
        utilisateur: u
          ? {
              prenom: u.prenom,
              nom: u.nom,
              fullName: `${u.prenom} ${u.nom}`.trim(),
              avatarUrl: u.avatarUrl ?? null,
              statutKyc: u.statutKyc,
              noteLocataire: Number(u.noteLocataire),
              noteProprietaire: Number(u.noteProprietaire),
            }
          : null,
        stats: {
          vehiclesCount: u?._count?.vehicules ?? 0,
          bookingsCount: (u?._count?.reservationsLocataire ?? 0) + (u?._count?.reservationsProprietaire ?? 0),
        },
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts: {
          total: totalCount,
          locataires: locatairesCount,
          proprietaires: proprietairesCount,
          admins: adminsCount,
          support: supportCount,
          pendingKyc: pendingKycCount,
          banned: bannedCount,
          stuckOnboarding: stuckOnboardingCount,
        },
      },
    };
  }

  async setUserRole(userId: string, role: RoleProfile) {
    let profile = await this.prisma.profile.findFirst({
      where: {
        OR: [
          { userId },
          { id: userId },
          { utilisateur: { id: userId } },
        ],
      },
    });

    if (!profile) throw new NotFoundException('Profil utilisateur introuvable');

    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: { role },
    });

    return updated;
  }

  // ── Optimized KYC Queue ───────────────────────────────────────────────────

  async getKycQueue(dto: GetKycQueueDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (dto.status) {
      where.statutKyc = dto.status;
    }

    if (dto.search && dto.search.trim()) {
      const q = dto.search.trim();
      where.OR = [
        { prenom: { contains: q, mode: 'insensitive' } },
        { nom: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { telephone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [users, total, countsRaw] = await Promise.all([
      this.prisma.utilisateur.findMany({
        where,
        orderBy: { misAJourLe: 'asc' }, // Priorité SLA (plus anciens en premier)
        take: limit,
        skip,
        select: {
          id: true,
          userId: true,
          prenom: true,
          nom: true,
          email: true,
          telephone: true,
          avatarUrl: true,
          statutKyc: true,
          kycDocumentUrl: true,
          kycDocumentBackUrl: true,
          kycSelfieUrl: true,
          permisUrl: true,
          kycRejectionReason: true,
          misAJourLe: true,
          creeLe: true,
          _count: {
            select: {
              vehicules: true,
              reservationsLocataire: true,
            },
          },
        },
      }),
      this.prisma.utilisateur.count({ where }),
      this.prisma.utilisateur.groupBy({
        by: ['statutKyc'],
        _count: { id: true },
      }),
    ]);

    const counts: Record<string, number> = {
      EN_ATTENTE: 0,
      VERIFIE: 0,
      REJETE: 0,
      NON_VERIFIE: 0,
    };
    for (const c of countsRaw) {
      counts[c.statutKyc] = c._count.id;
    }

    const now = new Date();
    const data = users.map((u) => {
      const waitHours = Math.round((now.getTime() - u.misAJourLe.getTime()) / (1000 * 3600));
      return {
        id: u.id,
        userId: u.userId,
        prenom: u.prenom,
        nom: u.nom,
        fullName: `${u.prenom} ${u.nom}`.trim(),
        email: u.email,
        phone: u.telephone,
        avatarUrl: u.avatarUrl,
        statutKyc: u.statutKyc,
        kycRejectionReason: u.kycRejectionReason,
        documents: {
          documentUrl: u.kycDocumentUrl ?? null,
          documentBackUrl: u.kycDocumentBackUrl ?? null,
          selfieUrl: u.kycSelfieUrl ?? null,
          permisUrl: u.permisUrl ?? null,
          hasAllFour: Boolean(u.kycDocumentUrl && u.kycDocumentBackUrl && u.kycSelfieUrl && u.permisUrl),
        },
        submittedAt: u.misAJourLe.toISOString(),
        registeredAt: u.creeLe.toISOString(),
        waitHours,
        stats: {
          vehiclesCount: u._count.vehicules,
          bookingsCount: u._count.reservationsLocataire,
        },
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts,
      },
    };
  }

  async getAdminUserDetail(userId: string) {
    let u = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ id: userId }, { userId }] },
      include: {
        profile: { select: { id: true, role: true, createdAt: true, email: true, phone: true } },
        vehicules: {
          orderBy: { creeLe: 'desc' },
          include: {
            photos: { orderBy: { position: 'asc' } },
            equipements: { include: { equipement: true } },
          },
        },
        reservationsLocataire: {
          orderBy: { creeLe: 'desc' },
          take: 5,
          include: { vehicule: { select: { marque: true, modele: true } } },
        },
        reservationsProprietaire: {
          orderBy: { creeLe: 'desc' },
          take: 5,
          include: {
            vehicule: { select: { marque: true, modele: true } },
            locataire: { select: { prenom: true, nom: true } },
          },
        },
        _count: { select: { vehicules: true, reservationsLocataire: true, reservationsProprietaire: true } },
      },
    });

    if (!u) {
      const prof = await this.prisma.profile.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
        include: { utilisateur: true },
      });
      if (!prof) throw new NotFoundException('Utilisateur introuvable');

      return {
        id: prof.id,
        userId: prof.userId,
        email: prof.email ?? '',
        phone: prof.phone ?? '',
        role: prof.role,
        createdAt: prof.createdAt.toISOString(),
        isBanned: false,
        banRaison: null,
        kycStatus: StatutKyc.NON_VERIFIE,
        isStuckOnboarding: true,
        utilisateur: null,
        vehicles: [],
        reservationsLocataire: [],
        reservationsProprietaire: [],
        _count: { vehicles: 0, reservationsLocataire: 0, reservationsProprietaire: 0 },
      };
    }


    const now = new Date();
    return {
      id: u.id,
      userId: u.userId,
      email: u.email,
      role: u.profile?.role ?? 'LOCATAIRE',
      createdAt: (u.profile?.createdAt ?? u.creeLe).toISOString(),
      lastSeenAt: null, // Si present plus tard
      isBanned: !u.actif || (!!u.bloqueJusqua && u.bloqueJusqua > now),
      banRaison: null,
      kycStatus: u.statutKyc,
      kycRejectionReason: u.kycRejectionReason,
      kyc: u.kycDocumentUrl || u.kycDocumentBackUrl || u.kycSelfieUrl || u.permisUrl ? {
        documentUrl: u.kycDocumentUrl ?? null,
        documentBackUrl: u.kycDocumentBackUrl ?? null,
        selfieUrl: u.kycSelfieUrl ?? null,
        permisUrl: u.permisUrl ?? null,
        soumisLe: u.misAJourLe.toISOString(),
      } : undefined,
      utilisateur: {
        prenom: u.prenom,
        nom: u.nom,
        telephone: u.telephone,
        avatarUrl: u.avatarUrl ?? null,
      },
      vehicles: u.vehicules.map((v) => ({
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
        photos: v.photos.map((p) => ({ url: p.url, estPrincipale: p.estPrincipale })),
        equipements: v.equipements.map((ve) => ve.equipement.nom),
      })),
      reservationsLocataire: u.reservationsLocataire.map((r) => ({
        id: r.id,
        statut: r.statut,
        vehicule: `${r.vehicule.marque} ${r.vehicule.modele}`,
        totalLocataire: Number(r.totalLocataire),
        creeLe: r.creeLe,
      })),
      reservationsProprietaire: u.reservationsProprietaire.map((r) => ({
        id: r.id,
        statut: r.statut,
        locataire: `${r.locataire?.prenom ?? ''} ${r.locataire?.nom ?? ''}`.trim(),
        vehicule: `${r.vehicule.marque} ${r.vehicule.modele}`,
        netProprietaire: Number(r.netProprietaire),
        creeLe: r.creeLe,
      })),
      _count: {
        vehicles: u._count.vehicules,
        reservationsLocataire: u._count.reservationsLocataire,
        reservationsProprietaire: u._count.reservationsProprietaire
      },
    };
  }

  async setUserStatus(userId: string, dto: BanUserDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        actif: dto.actif,
        bloqueJusqua: dto.bloqueJusqua ? new Date(dto.bloqueJusqua) : null,
      },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true, email: true },
    });

    const phone = updated.telephone?.trim();
    if (phone || updated.email) {
      const statusText = updated.actif ? 'réactivé' : 'suspendu';
      const untilText = updated.bloqueJusqua
        ? ` jusqu'au ${updated.bloqueJusqua.toISOString().slice(0, 10)}`
        : '';

      this.notification.send({
        userId: updated.id,
        phone: phone ?? undefined,
        email: updated.email ?? undefined,
        type: 'user.status_changed',
        data: {
          statusText,
          untilText,
          raison: dto.raison ?? null,
        },
      }).catch(() => { });
    }

    return updated;
  }

  // ── Admin stats ─────────────────────────────────────────────────────────────

  async getAdminStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      utilisateursActifs,
      kycEnAttente,
      vehiculesAValider,
      retraitsEnAttente,
      litigesOuverts,
      locationsCeMois,
      revenuResult,
      avisResult,
    ] = await Promise.all([
      this.prisma.utilisateur.count({ where: { actif: true } }),
      this.prisma.utilisateur.count({ where: { statutKyc: StatutKyc.EN_ATTENTE } }),
      this.prisma.vehicule.count({
        where: { statut: { in: [StatutVehicule.EN_ATTENTE_VALIDATION, StatutVehicule.BROUILLON] } },
      }),
      this.prisma.retrait.count({ where: { statut: StatutRetrait.EN_ATTENTE } }),
      this.prisma.litige.count({ where: { statut: StatutLitige.EN_ATTENTE } }),
      this.prisma.reservation.count({
        where: {
          creeLe: { gte: startOfMonth },
          statut: { notIn: [StatutReservation.ANNULEE] },
        },
      }),
      this.prisma.reservation.aggregate({
        _sum: { montantCommission: true },
        where: {
          creeLe: { gte: startOfMonth },
          statut: { notIn: [StatutReservation.ANNULEE] },
        },
      }),
      this.prisma.avis.aggregate({
        _avg: { note: true },
      }),
    ]);

    const revenuCeMois = Number(revenuResult._sum.montantCommission ?? 0);
    const tauxSatisfaction = avisResult._avg.note
      ? Math.round(Number(avisResult._avg.note) * 10) / 10
      : null;

    return {
      utilisateursActifs,
      locationsCeMois,
      revenuCeMois,
      tauxSatisfaction,
      pending: {
        kycEnAttente,
        vehiculesAValider,
        retraitsEnAttente,
        litigesOuverts,
      },
    };
  }

  // ── Lightweight badge count (polled every 30s by admin sidebar) ─────────────

  async getNotificationsCount() {
    const [pendingKyc, pendingVehicles, pendingWithdrawals, pendingLitiges] =
      await Promise.all([
        this.prisma.utilisateur.count({ where: { statutKyc: StatutKyc.EN_ATTENTE } }),
        this.prisma.vehicule.count({ where: { statut: StatutVehicule.EN_ATTENTE_VALIDATION } }),
        this.prisma.retrait.count({ where: { statut: StatutRetrait.EN_ATTENTE } }),
        this.prisma.litige.count({ where: { statut: StatutLitige.EN_ATTENTE } }),
      ]);

    return {
      pendingKyc,
      pendingVehicles,
      pendingWithdrawals,
      pendingLitiges,
      total: pendingKyc + pendingVehicles + pendingWithdrawals + pendingLitiges,
    };
  }

  async approveKyc(userId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, statutKyc: true, email: true, telephone: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        statutKyc: StatutKyc.VERIFIE,
        kycRejectionReason: null,
      },
      select: { id: true, statutKyc: true },
    });

    const promoted = await this.prisma.vehicule.updateMany({
      where: {
        proprietaireId: userId,
        statut: StatutVehicule.BROUILLON,
      },
      data: { statut: StatutVehicule.EN_ATTENTE_VALIDATION },
    });

    this.notification.send({
      userId: utilisateur.id,
      email: utilisateur.email ?? undefined,
      phone: utilisateur.telephone ?? undefined,
      type: 'kyc.verified',
      data: {},
    }).catch(() => { });

    return {
      utilisateurId: updated.id,
      statutKyc: updated.statutKyc,
      vehiclesPromoted: promoted.count,
    };
  }

  // ── Recent activity feed ─────────────────────────────────────────────────────

  async getRecentActivity(limit = 12) {
    const [reservations, kycChanges, vehicleChanges, newUsers] = await Promise.all([
      this.prisma.reservation.findMany({
        take: 5,
        orderBy: { creeLe: 'desc' },
        select: {
          id: true,
          creeLe: true,
          statut: true,
          locataire: { select: { prenom: true, nom: true } },
          vehicule: { select: { marque: true, modele: true } },
        },
      }),
      this.prisma.utilisateur.findMany({
        take: 5,
        where: { statutKyc: { not: StatutKyc.NON_VERIFIE } },
        orderBy: { misAJourLe: 'desc' },
        select: { id: true, misAJourLe: true, statutKyc: true, prenom: true, nom: true },
      }),
      this.prisma.vehicule.findMany({
        take: 5,
        where: { statut: { in: [StatutVehicule.VERIFIE, StatutVehicule.SUSPENDU] } },
        orderBy: { misAJourLe: 'desc' },
        select: { id: true, misAJourLe: true, statut: true, marque: true, modele: true },
      }),
      this.prisma.utilisateur.findMany({
        take: 4,
        orderBy: { creeLe: 'desc' },
        select: { id: true, creeLe: true, prenom: true, nom: true },
      }),
    ]);

    type RawEvent = { id: string; date: Date; type: string; action: string; detail: string; status: string };
    const events: RawEvent[] = [];

    for (const r of reservations) {
      const name = [r.locataire.prenom, r.locataire.nom].filter(Boolean).join(' ') || 'Locataire';
      const vehicle = `${r.vehicule.marque} ${r.vehicule.modele}`;
      const map: Record<string, { action: string; status: string }> = {
        EN_ATTENTE_PAIEMENT: { action: 'Nouvelle réservation', status: 'warning' },
        CONFIRMEE: { action: 'Réservation confirmée', status: 'success' },
        TERMINEE: { action: 'Location terminée', status: 'success' },
        ANNULEE: { action: 'Réservation annulée', status: 'error' },
      };
      const m = map[r.statut] ?? { action: 'Réservation mise à jour', status: 'info' };
      events.push({ id: `res-${r.id}`, date: r.creeLe, type: 'reservation', action: m.action, detail: `${name} — ${vehicle}`, status: m.status });
    }

    for (const u of kycChanges) {
      const name = [u.prenom, u.nom].filter(Boolean).join(' ') || 'Utilisateur';
      const map: Record<string, { action: string; status: string }> = {
        EN_ATTENTE: { action: 'KYC soumis', status: 'warning' },
        VERIFIE: { action: 'KYC approuvé', status: 'success' },
        REJETE: { action: 'KYC rejeté', status: 'error' },
      };
      const m = map[u.statutKyc] ?? { action: 'KYC mis à jour', status: 'info' };
      events.push({ id: `kyc-${u.id}`, date: u.misAJourLe, type: 'kyc', action: m.action, detail: name, status: m.status });
    }

    for (const v of vehicleChanges) {
      const map: Record<string, { action: string; status: string }> = {
        VERIFIE: { action: 'Annonce validée', status: 'success' },
        SUSPENDU: { action: 'Annonce suspendue', status: 'error' },
      };
      const m = map[v.statut] ?? { action: 'Annonce mise à jour', status: 'info' };
      events.push({ id: `veh-${v.id}`, date: v.misAJourLe, type: 'vehicle', action: m.action, detail: `${v.marque} ${v.modele}`, status: m.status });
    }

    for (const u of newUsers) {
      const name = [u.prenom, u.nom].filter(Boolean).join(' ') || 'Nouvel utilisateur';
      events.push({ id: `user-${u.id}`, date: u.creeLe, type: 'user', action: 'Nouveau membre', detail: name, status: 'info' });
    }

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    const now = new Date();

    return events.slice(0, limit).map((e) => {
      const diffMin = Math.floor((now.getTime() - e.date.getTime()) / 60000);
      const diffH = Math.floor(diffMin / 60);
      const diffD = Math.floor(diffH / 24);
      const time =
        diffMin < 1 ? "À l'instant" :
          diffMin < 60 ? `${diffMin} min` :
            diffH < 24 ? `${diffH} h` :
              diffD === 1 ? 'Hier' :
                `${diffD} j`;
      return { id: e.id, type: e.type, action: e.action, detail: e.detail, time, status: e.status };
    });
  }

  async rejectKyc(userId: string, raison?: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, statutKyc: true, email: true, telephone: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        statutKyc: StatutKyc.REJETE,
        kycRejectionReason: raison ?? null,
      },
      select: { id: true, statutKyc: true, kycRejectionReason: true },
    });

    this.notification.send({
      userId: utilisateur.id,
      email: utilisateur.email ?? undefined,
      phone: utilisateur.telephone ?? undefined,
      type: 'kyc.rejected',
      data: { raison: raison ?? null },
    }).catch(() => { });

    return updated;
  }
}
