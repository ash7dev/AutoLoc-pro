import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../infrastructure/notifications/notification.service';
import { BanUserDto } from './dto/ban-user.dto';
import { StatutKyc, StatutReservation, StatutRetrait, StatutLitige, StatutVehicule } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  // ── Admin list ──────────────────────────────────────────────────────────────

  async listAdminUsers(kycStatus?: StatutKyc) {
    const users = await this.prisma.utilisateur.findMany({
      where: kycStatus ? { statutKyc: kycStatus } : {},
      orderBy: { creeLe: 'asc' },
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
    });

    const now = new Date();
    return users.map((u) => ({
      id: u.id,
      userId: u.userId,
      email: u.email,
      role: u.profile?.role ?? 'LOCATAIRE',
      createdAt: (u.profile?.createdAt ?? u.creeLe).toISOString(),
      isBanned: !u.actif || (!!u.bloqueJusqua && u.bloqueJusqua > now),
      banRaison: null,
      kycStatus: u.statutKyc,
      kyc: u.kycDocumentUrl || u.kycSelfieUrl ? {
        documentUrl: u.kycDocumentUrl ?? null,
        selfieUrl: u.kycSelfieUrl ?? null,
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
  }

  async setUserStatus(userId: string, dto: BanUserDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true },
    });
    if (!utilisateur) throw new NotFoundException('User not found');

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        actif: dto.actif,
        bloqueJusqua: dto.bloqueJusqua ? new Date(dto.bloqueJusqua) : null,
      },
      select: { id: true, actif: true, bloqueJusqua: true, telephone: true },
    });

    const phone = updated.telephone?.trim();
    if (phone) {
      const statusText = updated.actif
        ? 'réactivé'
        : 'suspendu';
      const untilText = updated.bloqueJusqua
        ? ` jusqu'au ${updated.bloqueJusqua.toISOString().slice(0, 10)}`
        : '';
      const reasonText = dto.raison ? `\nRaison: ${dto.raison}` : '';

      await this.notification.sendWhatsApp({
        to: `whatsapp:${phone.startsWith('+') ? phone : `+221${phone}`}`,
        body: `Ton compte Auto Loc a été ${statusText}${untilText}.${reasonText}`,
      });
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

  async approveKyc(userId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, statutKyc: true },
    });
    if (!utilisateur) throw new NotFoundException('User not found');

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
        EN_ATTENTE_PAIEMENT: { action: 'Nouvelle réservation',    status: 'warning' },
        CONFIRMEE:           { action: 'Réservation confirmée',   status: 'success' },
        TERMINEE:            { action: 'Location terminée',       status: 'success' },
        ANNULEE:             { action: 'Réservation annulée',     status: 'error'   },
      };
      const m = map[r.statut] ?? { action: 'Réservation mise à jour', status: 'info' };
      events.push({ id: `res-${r.id}`, date: r.creeLe, type: 'reservation', action: m.action, detail: `${name} — ${vehicle}`, status: m.status });
    }

    for (const u of kycChanges) {
      const name = [u.prenom, u.nom].filter(Boolean).join(' ') || 'Utilisateur';
      const map: Record<string, { action: string; status: string }> = {
        EN_ATTENTE: { action: 'KYC soumis',   status: 'warning' },
        VERIFIE:    { action: 'KYC approuvé', status: 'success' },
        REJETE:     { action: 'KYC rejeté',   status: 'error'   },
      };
      const m = map[u.statutKyc] ?? { action: 'KYC mis à jour', status: 'info' };
      events.push({ id: `kyc-${u.id}`, date: u.misAJourLe, type: 'kyc', action: m.action, detail: name, status: m.status });
    }

    for (const v of vehicleChanges) {
      const map: Record<string, { action: string; status: string }> = {
        VERIFIE:  { action: 'Annonce validée',   status: 'success' },
        SUSPENDU: { action: 'Annonce suspendue', status: 'error'   },
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
      const diffH   = Math.floor(diffMin / 60);
      const diffD   = Math.floor(diffH / 24);
      const time =
        diffMin < 1  ? "À l'instant" :
        diffMin < 60 ? `${diffMin} min` :
        diffH   < 24 ? `${diffH} h` :
        diffD   === 1 ? 'Hier' :
        `${diffD} j`;
      return { id: e.id, type: e.type, action: e.action, detail: e.detail, time, status: e.status };
    });
  }

  async rejectKyc(userId: string, raison?: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, statutKyc: true },
    });
    if (!utilisateur) throw new NotFoundException('User not found');

    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        statutKyc: StatutKyc.REJETE,
        kycRejectionReason: raison ?? null,
      },
      select: { id: true, statutKyc: true, kycRejectionReason: true },
    });
  }
}
