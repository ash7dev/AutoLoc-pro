import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminAnalyticsQueryDto, AdminPeriod, GroupByPeriod } from './dto/admin-analytics-query.dto';
import { StatutKyc, StatutLitige, StatutReservation, StatutRetrait, StatutVehicule, FournisseurPaiement } from '@prisma/client';

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 secondes cache

  constructor(private readonly prisma: PrismaService) {}

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { timestamp: Date.now(), data });
  }

  // ── 1. EXECUTIVE OVERVIEW (KPIs + Deltas MoM/WoW) ──────────────────────────

  async getOverview(query: AdminAnalyticsQueryDto) {
    const cacheKey = `overview_${query.period || '30d'}_${query.ville || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { currentStart, previousStart, endDate, daysCount } = this.resolveDateRange(query.period);
    const whereVille = query.ville ? { ville: query.ville } : {};

    // 1. Current Period Aggregations
    const [
      currReservations,
      prevReservations,
      activeVehiclesCount,
      totalVehiclesCount,
      activeRentersCount,
      activeOwnersCount,
      totalUsersCount,
    ] = await Promise.all([
      // Current reservations
      this.prisma.reservation.aggregate({
        _sum: { totalLocataire: true, montantCommission: true },
        _count: { id: true },
        where: {
          creeLe: { gte: currentStart, lte: endDate },
          statut: { notIn: [StatutReservation.ANNULEE] },
          ...(query.ville ? { vehicule: { ville: query.ville } } : {}),
        },
      }),
      // Previous period reservations (for delta calculation)
      this.prisma.reservation.aggregate({
        _sum: { totalLocataire: true, montantCommission: true },
        _count: { id: true },
        where: {
          creeLe: { gte: previousStart, lt: currentStart },
          statut: { notIn: [StatutReservation.ANNULEE] },
          ...(query.ville ? { vehicule: { ville: query.ville } } : {}),
        },
      }),
      // Verified vehicles
      this.prisma.vehicule.count({
        where: { statut: StatutVehicule.VERIFIE, ...whereVille },
      }),
      // Total vehicles
      this.prisma.vehicule.count({ where: whereVille }),
      // Unique active renters in period (confirmed/active/completed reservations)
      this.prisma.reservation.groupBy({
        by: ['locataireId'],
        where: {
          creeLe: { gte: currentStart, lte: endDate },
          statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
        },
      }),
      // Unique active owners in period (confirmed/active/completed reservations)
      this.prisma.reservation.groupBy({
        by: ['proprietaireId'],
        where: {
          creeLe: { gte: currentStart, lte: endDate },
          statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
        },
      }),
      // Total platform users in database
      this.prisma.utilisateur.count(),
    ]);

    const activeRenterIds = activeRentersCount.map((r) => r.locataireId);
    const activeOwnerIds = activeOwnersCount.map((o) => o.proprietaireId);
    const uniqueActiveMembersCount = new Set([...activeRenterIds, ...activeOwnerIds]).size;

    // Current Financials
    const gmv = Number(currReservations._sum.totalLocataire ?? 0);
    const netRevenue = Number(currReservations._sum.montantCommission ?? 0);
    const bookingsCount = currReservations._count.id;
    const aov = bookingsCount > 0 ? Math.round(gmv / bookingsCount) : 0;
    const takeRate = gmv > 0 ? Math.round((netRevenue / gmv) * 1000) / 10 : 0;

    // Previous Financials
    const prevGmv = Number(prevReservations._sum.totalLocataire ?? 0);
    const prevNetRevenue = Number(prevReservations._sum.montantCommission ?? 0);
    const prevBookingsCount = prevReservations._count.id;

    // Deltas (%)
    const gmvDelta = this.calculateDelta(gmv, prevGmv);
    const netRevenueDelta = this.calculateDelta(netRevenue, prevNetRevenue);
    const bookingsDelta = this.calculateDelta(bookingsCount, prevBookingsCount);

    // Fleet Utilization Rate
    // Calculate total booked days in current period based on actual rental dates
    const bookedDaysRes = await this.prisma.reservation.findMany({
      where: {
        dateDebut: { lte: endDate },
        dateFin: { gte: currentStart },
        statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
        ...(query.ville ? { vehicule: { ville: query.ville } } : {}),
      },
      select: { dateDebut: true, dateFin: true },
    });

    let totalBookedDays = 0;
    for (const r of bookedDaysRes) {
      const start = new Date(Math.max(r.dateDebut.getTime(), currentStart.getTime()));
      const end = new Date(Math.min(r.dateFin.getTime(), endDate.getTime()));
      if (end >= start) {
        const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        totalBookedDays += diffDays;
      }
    }

    const maxCapacityDays = (activeVehiclesCount || 1) * daysCount;
    const fleetUtilizationRate = Math.min(100, Math.round((totalBookedDays / maxCapacityDays) * 1000) / 10);

    const result = {
      period: query.period || '30d',
      financials: {
        gmv,
        gmvDelta,
        netRevenue,
        netRevenueDelta,
        takeRate, // e.g. 15.5%
        aov,
        bookingsCount,
        bookingsDelta,
      },
      fleet: {
        activeVehiclesCount,
        totalVehiclesCount,
        fleetUtilizationRate, // %
      },
      community: {
        activeRentersCount: activeRenterIds.length,
        activeOwnersCount: activeOwnerIds.length,
        uniqueActiveMembersCount,
        totalUsersCount,
      },
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 2. REVENUE TRENDS (Time-Series Daily/Weekly/Monthly) ───────────────────

  async getRevenueTrends(query: AdminAnalyticsQueryDto) {
    const cacheKey = `trends_${query.period || '30d'}_${query.groupBy || 'day'}_${query.ville || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { currentStart, endDate } = this.resolveDateRange(query.period);

    // Fetch reservations in range
    const reservations = await this.prisma.reservation.findMany({
      where: {
        creeLe: { gte: currentStart, lte: endDate },
        statut: { notIn: [StatutReservation.ANNULEE] },
        ...(query.ville ? { vehicule: { ville: query.ville } } : {}),
      },
      select: {
        creeLe: true,
        totalLocataire: true,
        montantCommission: true,
      },
      orderBy: { creeLe: 'asc' },
    });

    // Group by Day (YYYY-MM-DD)
    const mapByDate = new Map<string, { gmv: number; netRevenue: number; count: number }>();

    // Initialize all dates in range to 0 to prevent graph gaps
    const curr = new Date(currentStart);
    while (curr <= endDate) {
      const dateStr = curr.toISOString().slice(0, 10);
      mapByDate.set(dateStr, { gmv: 0, netRevenue: 0, count: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    for (const r of reservations) {
      const dateStr = r.creeLe.toISOString().slice(0, 10);
      const existing = mapByDate.get(dateStr) || { gmv: 0, netRevenue: 0, count: 0 };
      existing.gmv += Number(r.totalLocataire);
      existing.netRevenue += Number(r.montantCommission);
      existing.count += 1;
      mapByDate.set(dateStr, existing);
    }

    const series = Array.from(mapByDate.entries()).map(([date, data]) => ({
      date,
      gmv: Math.round(data.gmv),
      netRevenue: Math.round(data.netRevenue),
      count: data.count,
      aov: data.count > 0 ? Math.round(data.gmv / data.count) : 0,
    }));

    const result = {
      period: query.period || '30d',
      series,
      summary: {
        totalGmv: series.reduce((acc, s) => acc + s.gmv, 0),
        totalNetRevenue: series.reduce((acc, s) => acc + s.netRevenue, 0),
        totalBookings: series.reduce((acc, s) => acc + s.count, 0),
      },
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 3. PAYMENT BREAKDOWN (Wave vs Orange Money Senegal) ────────────────────

  async getPaymentBreakdown(query: AdminAnalyticsQueryDto) {
    const cacheKey = `payment_breakdown_${query.period || '30d'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { currentStart, endDate } = this.resolveDateRange(query.period);

    // 1. Provider Breakdown (Uniquement les paiements CONFIRME pour réservations confirmées/effectives)
    const payments = await this.prisma.paiement.findMany({
      where: {
        creeLe: { gte: currentStart, lte: endDate },
        statut: 'CONFIRME',
        reservation: {
          statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
        },
      },
      select: {
        fournisseur: true,
        statut: true,
        montant: true,
      },
    });

    let waveVolume = 0;
    let waveCount = 0;
    let waveSuccess = 0;

    let omVolume = 0;
    let omCount = 0;
    let omSuccess = 0;

    let stripeVolume = 0;
    let stripeCount = 0;

    for (const p of payments) {
      const amount = Number(p.montant);
      if (p.fournisseur === FournisseurPaiement.WAVE) {
        waveVolume += amount;
        waveCount++;
        waveSuccess++;
      } else if (p.fournisseur === FournisseurPaiement.ORANGE_MONEY) {
        omVolume += amount;
        omCount++;
        omSuccess++;
      } else if (p.fournisseur === FournisseurPaiement.STRIPE) {
        stripeVolume += amount;
        stripeCount++;
      }
    }

    // Compter aussi le total des paiements (tous statuts) pour le taux de succès réel
    const allPaymentCounts = await this.prisma.paiement.groupBy({
      by: ['fournisseur', 'statut'],
      where: {
        creeLe: { gte: currentStart, lte: endDate },
      },
      _count: { id: true },
    });

    let totalWaveAttempts = 0;
    let totalOmAttempts = 0;
    for (const c of allPaymentCounts) {
      if (c.fournisseur === FournisseurPaiement.WAVE) totalWaveAttempts += c._count.id;
      if (c.fournisseur === FournisseurPaiement.ORANGE_MONEY) totalOmAttempts += c._count.id;
    }

    const totalVolume = waveVolume + omVolume + stripeVolume;

    // 2. Reservation Mode Breakdown (Réservations confirmées/effectives uniquement)
    const modes = await this.prisma.reservation.groupBy({
      by: ['modePaiement'],
      where: {
        creeLe: { gte: currentStart, lte: endDate },
        statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
      },
      _count: { id: true },
      _sum: {
        totalLocataire: true,
        montantPayeEnLigne: true,
        montantSoldeCheckin: true,
      },
    });

    const modeBreakdown = modes.map((m) => ({
      mode: m.modePaiement,
      count: m._count.id,
      volumeOnline: Math.round(Number(m._sum.montantPayeEnLigne ?? 0)),
      volumeCheckin: Math.round(Number(m._sum.montantSoldeCheckin ?? 0)),
      totalContractVolume: Math.round(Number(m._sum.totalLocataire ?? 0)),
      volume: Math.round(Number(m._sum.montantPayeEnLigne ?? 0)),
    }));

    const result = {
      period: query.period || '30d',
      providers: {
        wave: {
          provider: 'WAVE',
          label: 'Wave Mobile Money',
          volume: Math.round(waveVolume),
          sharePercent: totalVolume > 0 ? Math.round((waveVolume / totalVolume) * 1000) / 10 : 0,
          transactionCount: waveCount,
          successRate: totalWaveAttempts > 0 ? Math.round((waveSuccess / totalWaveAttempts) * 1000) / 10 : 100,
        },
        orangeMoney: {
          provider: 'ORANGE_MONEY',
          label: 'Orange Money Sénégal',
          volume: Math.round(omVolume),
          sharePercent: totalVolume > 0 ? Math.round((omVolume / totalVolume) * 1000) / 10 : 0,
          transactionCount: omCount,
          successRate: totalOmAttempts > 0 ? Math.round((omSuccess / totalOmAttempts) * 1000) / 10 : 100,
        },
        stripe: {
          provider: 'STRIPE',
          label: 'Carte Bancaire / Stripe',
          volume: Math.round(stripeVolume),
          sharePercent: totalVolume > 0 ? Math.round((stripeVolume / totalVolume) * 1000) / 10 : 0,
          transactionCount: stripeCount,
        },
      },
      totalVolume: Math.round(totalVolume),
      modeBreakdown,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 4. FLEET & GEO DISTRIBUTION ───────────────────────────────────────────

  async getFleetStats(query: AdminAnalyticsQueryDto) {
    const cacheKey = `fleet_stats_${query.ville || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // 1. Breakdown by Vehicle Type
    const byType = await this.prisma.vehicule.groupBy({
      by: ['type'],
      where: { statut: StatutVehicule.VERIFIE },
      _count: { id: true },
      _avg: { prixParJour: true, note: true },
    });

    const fleetByType = byType.map((t) => ({
      type: t.type,
      count: t._count.id,
      avgPrixJour: Math.round(Number(t._avg.prixParJour ?? 0)),
      avgNote: Math.round(Number(t._avg.note ?? 0) * 10) / 10,
    })).sort((a, b) => b.count - a.count);

    // 2. Breakdown by City (Ville)
    const byCity = await this.prisma.vehicule.groupBy({
      by: ['ville'],
      where: { statut: StatutVehicule.VERIFIE },
      _count: { id: true },
    });

    const fleetByCity = byCity.map((c) => ({
      ville: c.ville,
      count: c._count.id,
    })).sort((a, b) => b.count - a.count);

    // 3. Status breakdown
    const byStatus = await this.prisma.vehicule.groupBy({
      by: ['statut'],
      _count: { id: true },
    });

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.statut] = s._count.id;
    }

    const result = {
      totalVehicles: Object.values(statusMap).reduce((a, b) => a + b, 0),
      status: {
        verified: statusMap[StatutVehicule.VERIFIE] || 0,
        pendingValidation: statusMap[StatutVehicule.EN_ATTENTE_VALIDATION] || 0,
        suspended: statusMap[StatutVehicule.SUSPENDU] || 0,
        draft: statusMap[StatutVehicule.BROUILLON] || 0,
        archived: statusMap[StatutVehicule.ARCHIVE] || 0,
      },
      fleetByType,
      fleetByCity,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 5. CONVERSION FUNNEL ──────────────────────────────────────────────────

  async getConversionFunnel(query: AdminAnalyticsQueryDto) {
    const cacheKey = `funnel_${query.period || '30d'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { currentStart, endDate } = this.resolveDateRange(query.period);

    const [searches, views, bookingsCreated, bookingsPaid] = await Promise.all([
      this.prisma.searchHistory.count({
        where: { creeLe: { gte: currentStart, lte: endDate } },
      }),
      this.prisma.vehiculeView.count({
        where: { creeLe: { gte: currentStart, lte: endDate } },
      }),
      this.prisma.reservation.count({
        where: { creeLe: { gte: currentStart, lte: endDate } },
      }),
      this.prisma.reservation.count({
        where: {
          creeLe: { gte: currentStart, lte: endDate },
          statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
        },
      }),
    ]);

    const steps = [
      { name: 'Recherches', count: searches, conversion: 100 },
      {
        name: 'Vues Fiches',
        count: views,
        conversion: searches > 0 ? Math.round((views / searches) * 1000) / 10 : 0,
      },
      {
        name: 'Réservations Initiées',
        count: bookingsCreated,
        conversion: views > 0 ? Math.round((bookingsCreated / views) * 1000) / 10 : 0,
      },
      {
        name: 'Paiements Confirmés',
        count: bookingsPaid,
        conversion: bookingsCreated > 0 ? Math.round((bookingsPaid / bookingsCreated) * 1000) / 10 : 0,
      },
    ];

    const overallConversion = searches > 0 ? Math.round((bookingsPaid / searches) * 1000) / 10 : 0;

    const result = {
      period: query.period || '30d',
      steps,
      overallConversion,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 6. OPS COMMAND CENTER (SLA Monitoring) ───────────────────────────────

  async getOpsCommandCenter() {
    const cacheKey = 'ops_command_center';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [
      pendingKycList,
      pendingVehiclesList,
      pendingWithdrawalsList,
      pendingLitigesList,
    ] = await Promise.all([
      // KYC Pending
      this.prisma.utilisateur.findMany({
        where: { statutKyc: StatutKyc.EN_ATTENTE },
        orderBy: { misAJourLe: 'asc' },
        take: 5,
        select: {
          id: true,
          prenom: true,
          nom: true,
          email: true,
          telephone: true,
          misAJourLe: true,
          kycDocumentUrl: true,
          kycSelfieUrl: true,
        },
      }),
      // Vehicles Pending Validation
      this.prisma.vehicule.findMany({
        where: { statut: StatutVehicule.EN_ATTENTE_VALIDATION },
        orderBy: { creeLe: 'asc' },
        take: 5,
        select: {
          id: true,
          marque: true,
          modele: true,
          annee: true,
          ville: true,
          prixParJour: true,
          creeLe: true,
          proprietaire: { select: { prenom: true, nom: true, telephone: true } },
        },
      }),
      // Withdrawals Pending
      this.prisma.retrait.findMany({
        where: { statut: StatutRetrait.EN_ATTENTE },
        orderBy: { demandeeLe: 'asc' },
        take: 5,
        select: {
          id: true,
          montant: true,
          methode: true,
          destinataire: true,
          demandeeLe: true,
          wallet: { select: { utilisateur: { select: { prenom: true, nom: true } } } },
        },
      }),
      // Open Disputes
      this.prisma.litige.findMany({
        where: { statut: StatutLitige.EN_ATTENTE },
        orderBy: { creeLe: 'asc' },
        take: 5,
        select: {
          id: true,
          motif: true,
          description: true,
          coutEstime: true,
          creeLe: true,
          reservation: {
            select: {
              id: true,
              locataire: { select: { prenom: true, nom: true } },
              proprietaire: { select: { prenom: true, nom: true } },
              vehicule: { select: { marque: true, modele: true } },
            },
          },
        },
      }),
    ]);

    const now = new Date();

    const result = {
      kyc: {
        pendingCount: pendingKycList.length,
        items: pendingKycList.map((u) => ({
          id: u.id,
          name: `${u.prenom} ${u.nom}`.trim(),
          email: u.email,
          phone: u.telephone,
          submittedAt: u.misAJourLe,
          waitHours: Math.round((now.getTime() - u.misAJourLe.getTime()) / (1000 * 3600)),
        })),
      },
      vehicles: {
        pendingCount: pendingVehiclesList.length,
        items: pendingVehiclesList.map((v) => ({
          id: v.id,
          title: `${v.marque} ${v.modele} (${v.annee})`,
          city: v.ville,
          pricePerDay: Number(v.prixParJour),
          ownerName: `${v.proprietaire.prenom} ${v.proprietaire.nom}`.trim(),
          submittedAt: v.creeLe,
          waitHours: Math.round((now.getTime() - v.creeLe.getTime()) / (1000 * 3600)),
        })),
      },
      withdrawals: {
        pendingCount: pendingWithdrawalsList.length,
        totalPendingAmount: pendingWithdrawalsList.reduce((acc, w) => acc + Number(w.montant), 0),
        items: pendingWithdrawalsList.map((w) => ({
          id: w.id,
          amount: Number(w.montant),
          method: w.methode, // WAVE or ORANGE_MONEY
          recipient: w.destinataire,
          userName: `${w.wallet.utilisateur.prenom} ${w.wallet.utilisateur.nom}`.trim(),
          requestedAt: w.demandeeLe,
          waitHours: Math.round((now.getTime() - w.demandeeLe.getTime()) / (1000 * 3600)),
        })),
      },
      disputes: {
        pendingCount: pendingLitigesList.length,
        items: pendingLitigesList.map((d) => ({
          id: d.id,
          motif: d.motif,
          estimatedCost: d.coutEstime ? Number(d.coutEstime) : null,
          createdAt: d.creeLe,
          bookingId: d.reservation.id,
          vehicle: `${d.reservation.vehicule.marque} ${d.reservation.vehicule.modele}`,
          renterName: `${d.reservation.locataire.prenom} ${d.reservation.locataire.nom}`.trim(),
          ownerName: `${d.reservation.proprietaire.prenom} ${d.reservation.proprietaire.nom}`.trim(),
        })),
      },
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 7. RISK & QUALITY METRICS ─────────────────────────────────────────────

  async getRiskQuality() {
    const cacheKey = 'risk_quality';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [totalBookings, cancelledBookings, disputesCount, avgRatingRes] = await Promise.all([
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { statut: StatutReservation.ANNULEE } }),
      this.prisma.litige.count(),
      this.prisma.avis.aggregate({ _avg: { note: true } }),
    ]);

    const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 1000) / 10 : 0;
    const disputeRatio = totalBookings > 0 ? Math.round((disputesCount / totalBookings) * 1000) / 10 : 0;
    const avgRating = avgRatingRes._avg.note ? Math.round(Number(avgRatingRes._avg.note) * 10) / 10 : 0;

    const result = {
      totalBookings,
      cancellationRate, // %
      disputeRatio, // %
      avgRating, // /5
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 8. USER ACTIVATION & KYC FUNNEL (Leading Indicators) ─────────────────

  async getUserActivationFunnel() {
    const cacheKey = 'user_activation_funnel';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const days7Ago = new Date();
    days7Ago.setDate(now.getDate() - 7);

    const [
      totalAuthProfiles,
      totalUsers,
      byKycStatusRaw,
      unverifiedStuckCount,
      verifiedNoBookingCount,
      activeRentersTotal,
      newUsers7Days,
    ] = await Promise.all([
      // Total Auth profiles in Supabase/PostgreSQL (profiles table)
      this.prisma.profile.count(),
      // Total users in database (Utilisateur table)
      this.prisma.utilisateur.count(),
      // KYC breakdown
      this.prisma.utilisateur.groupBy({
        by: ['statutKyc'],
        _count: { id: true },
      }),
      // Users registered > 48h ago who never submitted KYC (NON_VERIFIE)
      this.prisma.utilisateur.count({
        where: {
          statutKyc: StatutKyc.NON_VERIFIE,
          creeLe: { lt: days7Ago },
        },
      }),
      // Verified users with 0 reservations
      this.prisma.utilisateur.count({
        where: {
          statutKyc: StatutKyc.VERIFIE,
          reservationsLocataire: { none: {} },
        },
      }),
      // Total users with at least 1 reservation
      this.prisma.utilisateur.count({
        where: {
          reservationsLocataire: { some: {} },
        },
      }),
      // Registered last 7 days
      this.prisma.utilisateur.count({
        where: { creeLe: { gte: days7Ago } },
      }),
    ]);

    const kycMap: Record<string, number> = {
      [StatutKyc.NON_VERIFIE]: 0,
      [StatutKyc.EN_ATTENTE]: 0,
      [StatutKyc.VERIFIE]: 0,
      [StatutKyc.REJETE]: 0,
    };

    for (const item of byKycStatusRaw) {
      kycMap[item.statutKyc] = item._count.id;
    }

    const effectiveTotalUsers = Math.max(totalAuthProfiles, totalUsers);
    const verifiedCount = kycMap[StatutKyc.VERIFIE] || 0;
    const kycConversionRate = effectiveTotalUsers > 0 ? Math.round((verifiedCount / effectiveTotalUsers) * 1000) / 10 : 0;
    const activationRate = verifiedCount > 0 ? Math.round((activeRentersTotal / verifiedCount) * 1000) / 10 : 0;

    const result = {
      totalAuthProfiles,
      totalUsers: effectiveTotalUsers,
      activeRentersTotal,
      newUsers7Days,
      kycBreakdown: {
        nonVerifie: kycMap[StatutKyc.NON_VERIFIE],
        enAttente: kycMap[StatutKyc.EN_ATTENTE],
        verifie: kycMap[StatutKyc.VERIFIE],
        rejete: kycMap[StatutKyc.REJETE],
      },
      dropOffs: {
        unverifiedStuckCount, // Utilisateurs inscrits sans KYC > 7j
        verifiedNoBookingCount, // KYC validé mais 0 réservation
      },
      rates: {
        kycConversionRate, // % ayant validé le KYC
        activationRate, // % KYC validés ayant réservé au moins 1 fois
      },
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 9. SUPPLY PIPELINE & OWNER ACTIVATION ────────────────────────────────

  async getSupplyPipeline() {
    const cacheKey = 'supply_pipeline';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const days2Ago = new Date();
    days2Ago.setDate(now.getDate() - 2);

    const [
      totalVehicles,
      byStatusRaw,
      stuckDraftsCount,
      verifiedZeroBookingsCount,
      topOwnersRaw,
    ] = await Promise.all([
      this.prisma.vehicule.count(),
      this.prisma.vehicule.groupBy({
        by: ['statut'],
        _count: { id: true },
      }),
      // Vehicles stuck in BROUILLON for > 48 hours
      this.prisma.vehicule.count({
        where: {
          statut: StatutVehicule.BROUILLON,
          creeLe: { lt: days2Ago },
        },
      }),
      // Verified vehicles with 0 total locations
      this.prisma.vehicule.count({
        where: {
          statut: StatutVehicule.VERIFIE,
          totalLocations: 0,
        },
      }),
      // Top owners by vehicle count
      this.prisma.utilisateur.findMany({
        take: 5,
        where: { vehicules: { some: {} } },
        select: {
          id: true,
          prenom: true,
          nom: true,
          telephone: true,
          _count: { select: { vehicules: true, reservationsProprietaire: true } },
        },
        orderBy: { vehicules: { _count: 'desc' } },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const item of byStatusRaw) {
      statusMap[item.statut] = item._count.id;
    }

    const result = {
      totalVehicles,
      statusBreakdown: {
        brouillon: statusMap[StatutVehicule.BROUILLON] || 0,
        enAttenteValidation: statusMap[StatutVehicule.EN_ATTENTE_VALIDATION] || 0,
        verifie: statusMap[StatutVehicule.VERIFIE] || 0,
        suspendu: statusMap[StatutVehicule.SUSPENDU] || 0,
        archive: statusMap[StatutVehicule.ARCHIVE] || 0,
      },
      bottlenecks: {
        stuckDraftsCount, // Annonces en brouillon abandonnées > 48h
        verifiedZeroBookingsCount, // Véhicules validés sans aucune location
      },
      topOwners: topOwnersRaw.map((o) => ({
        id: o.id,
        name: `${o.prenom} ${o.nom}`.trim(),
        phone: o.telephone,
        vehicleCount: o._count.vehicules,
        totalBookings: o._count.reservationsProprietaire,
      })),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 10. DETAILED RESERVATION LIFECYCLE BREAKDOWN ─────────────────────────

  async getReservationsBreakdown(query: AdminAnalyticsQueryDto) {
    const cacheKey = `res_breakdown_${query.period || '30d'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const { currentStart, endDate } = this.resolveDateRange(query.period);

    const byStatusRaw = await this.prisma.reservation.groupBy({
      by: ['statut'],
      where: { creeLe: { gte: currentStart, lte: endDate } },
      _count: { id: true },
      _sum: { totalLocataire: true, montantCommission: true },
    });

    const statusBreakdown = byStatusRaw.map((s) => ({
      statut: s.statut,
      count: s._count.id,
      gmv: Math.round(Number(s._sum.totalLocataire ?? 0)),
      commission: Math.round(Number(s._sum.montantCommission ?? 0)),
    }));

    const totalCount = statusBreakdown.reduce((acc, s) => acc + s.count, 0);

    // Top cancellation reasons if any
    const cancelledReservations = await this.prisma.reservation.findMany({
      where: {
        creeLe: { gte: currentStart, lte: endDate },
        statut: StatutReservation.ANNULEE,
        raisonAnnulation: { not: null },
      },
      select: { raisonAnnulation: true, annuleParId: true },
      take: 20,
    });

    const result = {
      period: query.period || '30d',
      totalCount,
      statusBreakdown,
      recentCancellationReasons: cancelledReservations.map((r) => r.raisonAnnulation),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 11. GROWTH ENGINE: UNMET DEMAND (Searches with 0 Results) ─────────────

  async getUnmetDemand() {
    const cacheKey = 'unmet_demand';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [totalFailedSearches, topFailedCitiesRaw, topFailedTypesRaw] = await Promise.all([
      this.prisma.searchHistory.count({
        where: { resultCount: 0 },
      }),
      this.prisma.searchHistory.groupBy({
        by: ['ville'],
        where: { resultCount: 0, ville: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      this.prisma.searchHistory.groupBy({
        by: ['type'],
        where: { resultCount: 0, type: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const result = {
      totalFailedSearches,
      topFailedCities: topFailedCitiesRaw.map((c) => ({ ville: c.ville || 'Inconnue', count: c._count.id })),
      topFailedTypes: topFailedTypesRaw.map((t) => ({ type: t.type || 'Non spécifié', count: t._count.id })),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 12. GROWTH ENGINE: COHORTS & RETENTION (Repeat Booking Rate) ──────────

  async getCohortsAndRetention() {
    const cacheKey = 'cohorts_retention';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [totalRenters, repeatRentersRaw] = await Promise.all([
      this.prisma.reservation.groupBy({
        by: ['locataireId'],
        where: { statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] } },
      }),
      this.prisma.reservation.groupBy({
        by: ['locataireId'],
        where: { statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] } },
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      }),
    ]);

    const totalUniqueRenters = totalRenters.length;
    const repeatRentersCount = repeatRentersRaw.length;
    const repeatRate = totalUniqueRenters > 0 ? Math.round((repeatRentersCount / totalUniqueRenters) * 1000) / 10 : 0;

    const result = {
      totalUniqueRenters,
      repeatRentersCount,
      repeatRate,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 13. GROWTH ENGINE: FINANCIAL ESCROW & CASH FLOAT ──────────────────────

  async getFinancialEscrow() {
    const cacheKey = 'financial_escrow';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const escrowRes = await this.prisma.reservation.aggregate({
      _sum: {
        totalLocataire: true,
        montantPayeEnLigne: true,
        montantCommission: true,
        netProprietaire: true,
      },
      _count: { id: true },
      where: {
        statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS] },
        walletCredite: false,
      },
    });

    const result = {
      activeEscrowBookingsCount: escrowRes._count.id,
      totalEscrowVolume: Math.round(Number(escrowRes._sum.totalLocataire ?? 0)),
      totalOnlinePaidInEscrow: Math.round(Number(escrowRes._sum.montantPayeEnLigne ?? 0)),
      securedCommissionInEscrow: Math.round(Number(escrowRes._sum.montantCommission ?? 0)),
      pendingHostPayoutInEscrow: Math.round(Number(escrowRes._sum.netProprietaire ?? 0)),
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // ── 14. AGGREGATED DASHBOARD SUMMARY (Single-Flight Load) ───────────────

  async getDashboardSummary(query: AdminAnalyticsQueryDto) {
    const cacheKey = `summary_${query.period || '30d'}_${query.ville || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [
      overview,
      trends,
      payments,
      fleetStats,
      conversionFunnel,
      opsCenter,
      usersFunnel,
      supplyPipeline,
      riskQuality,
      unmetDemand,
      cohorts,
      escrow,
    ] = await Promise.all([
      this.getOverview(query),
      this.getRevenueTrends(query),
      this.getPaymentBreakdown(query),
      this.getFleetStats(query),
      this.getConversionFunnel(query),
      this.getOpsCommandCenter(),
      this.getUserActivationFunnel(),
      this.getSupplyPipeline(),
      this.getRiskQuality(),
      this.getUnmetDemand(),
      this.getCohortsAndRetention(),
      this.getFinancialEscrow(),
    ]);

    const result = {
      period: query.period || '30d',
      overview,
      trends,
      payments,
      fleetStats,
      conversionFunnel,
      opsCenter,
      usersFunnel,
      supplyPipeline,
      riskQuality,
      unmetDemand,
      cohorts,
      escrow,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private resolveDateRange(period?: AdminPeriod) {
    const endDate = new Date();
    let daysCount = 30;
    let currentStart = new Date();

    switch (period) {
      case AdminPeriod.DAYS_7:
        daysCount = 7;
        currentStart.setDate(endDate.getDate() - 7);
        break;
      case AdminPeriod.DAYS_90:
        daysCount = 90;
        currentStart.setDate(endDate.getDate() - 90);
        break;
      case AdminPeriod.MONTHS_12:
        daysCount = 365;
        currentStart.setFullYear(endDate.getFullYear() - 1);
        break;
      case AdminPeriod.YTD:
        currentStart = new Date(endDate.getFullYear(), 0, 1);
        daysCount = Math.max(1, Math.ceil((endDate.getTime() - currentStart.getTime()) / (1000 * 3600 * 24)));
        break;
      case AdminPeriod.DAYS_30:
      default:
        daysCount = 30;
        currentStart.setDate(endDate.getDate() - 30);
        break;
    }

    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - daysCount);

    return { currentStart, previousStart, endDate, daysCount };
  }

  private calculateDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }
}
