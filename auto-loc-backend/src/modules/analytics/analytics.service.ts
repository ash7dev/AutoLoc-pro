import { Injectable, NotFoundException } from '@nestjs/common';
import { StatutReservation, StatutVehicule } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../../common/types/auth.types';
import {
  RevenueBreakdownQueryDto,
  GroupByPeriod,
} from './dto/revenue-breakdown-query.dto';
import { RevenueBreakdownResponseDto, RevenueBreakdownPointDto } from './dto/revenue-breakdown-response.dto';
import { OccupancyQueryDto } from './dto/occupancy-query.dto';
import { OccupancyAnalyticsResponseDto } from './dto/occupancy-response.dto';
import { FleetPerformanceQueryDto, SortByFleetMetric } from './dto/fleet-performance-query.dto';
import { FleetPerformanceResponseDto, VehiclePerformanceItemDto } from './dto/fleet-performance-response.dto';
import { OwnerOverviewAnalyticsDto } from './dto/owner-overview-response.dto';
import { OwnerInsightsResponseDto, OwnerInsightItemDto } from './dto/owner-insights-response.dto';

@Injectable()
export class AnalyticsService {

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Helper pour obtenir l'ID utilisateur Prisma
   */
  private async getUtilisateurId(user: RequestUser): Promise<string> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable');
    return utilisateur.id;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. OVERVIEW FINANCIER & EXPLOITATION
  // ─────────────────────────────────────────────────────────────────────────────

  async getOverview(user: RequestUser): Promise<OwnerOverviewAnalyticsDto> {
    const proprietaireId = await this.getUtilisateurId(user);

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const activeStatuses = [
      StatutReservation.PAYEE,
      StatutReservation.CONFIRMEE,
      StatutReservation.EN_COURS,
      StatutReservation.TERMINEE,
    ];

    const [
      wallet,
      penalites,
      currentMonthRes,
      prevMonthRes,
      pendingReservations,
      activeResCount,
      pendingCount,
      checkinsTodayCount,
      checkoutsTodayCount,
      litigesCount,
      vehicules,
      reviewsAggregate,
      rentedTodayCount,
    ] = await Promise.all([
      // Wallet balance
      this.prisma.wallet.findUnique({
        where: { utilisateurId: proprietaireId },
        select: { soldeDisponible: true },
      }),
      // Pénalités en attente de précompte
      this.prisma.penaliteProprietaire.findMany({
        where: { utilisateurId: proprietaireId, preleveleLe: null },
        select: { montant: true },
      }),
      // Réservations du mois en cours
      this.prisma.reservation.findMany({
        where: {
          proprietaireId,
          statut: { in: activeStatuses },
          creeLe: { gte: startOfCurrentMonth },
        },
        select: {
          totalBase: true,
          montantCommission: true,
          netProprietaire: true,
          montantPayeEnLigne: true,
          montantSoldeCheckin: true,
          fraisLivraison: true,
          supplementHorsDakar: true,
        },
      }),
      // Réservations du mois précédent
      this.prisma.reservation.findMany({
        where: {
          proprietaireId,
          statut: { in: activeStatuses },
          creeLe: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        select: { netProprietaire: true },
      }),
      // Réservations engagées en attente de déblocage (PAYEE, CONFIRMEE, EN_COURS avant double check-in)
      this.prisma.reservation.findMany({
        where: {
          proprietaireId,
          statut: { in: [StatutReservation.PAYEE, StatutReservation.CONFIRMEE, StatutReservation.EN_COURS] },
          walletCredite: false,
        },
        select: { netProprietaire: true },
      }),
      // Réservations actives count
      this.prisma.reservation.count({
        where: {
          proprietaireId,
          statut: { in: [StatutReservation.PAYEE, StatutReservation.CONFIRMEE, StatutReservation.EN_COURS] },
        },
      }),
      // En attente d'action / confirmation
      this.prisma.reservation.count({
        where: {
          proprietaireId,
          statut: { in: [StatutReservation.EN_ATTENTE_PAIEMENT, StatutReservation.PAYEE] },
        },
      }),
      // Check-ins du jour
      this.prisma.reservation.count({
        where: {
          proprietaireId,
          statut: StatutReservation.CONFIRMEE,
          dateDebut: { gte: startOfToday, lte: endOfToday },
        },
      }),
      // Check-outs du jour
      this.prisma.reservation.count({
        where: {
          proprietaireId,
          statut: StatutReservation.EN_COURS,
          dateFin: { gte: startOfToday, lte: endOfToday },
        },
      }),
      // Litiges ouverts
      this.prisma.reservation.count({
        where: { proprietaireId, statut: StatutReservation.LITIGE },
      }),
      // Flotte de véhicules actifs
      this.prisma.vehicule.findMany({
        where: { proprietaireId, archiveLe: null, NOT: { statut: StatutVehicule.ARCHIVE } },
        select: { id: true },
      }),
      // Moyenne d'avis de la flotte
      this.prisma.avis.aggregate({
        where: { reservation: { proprietaireId } },
        _avg: { note: true },
      }),
      // Véhicules loués aujourd'hui
      this.prisma.reservation.count({
        where: {
          proprietaireId,
          statut: { in: [StatutReservation.CONFIRMEE, StatutReservation.EN_COURS] },
          dateDebut: { lte: now },
          dateFin: { gte: now },
        },
      }),
    ]);

    // Calculs financiers
    let caBrutMois = 0;
    let commissionAutoLocMois = 0;
    let netProprietaireMois = 0;
    let revenusEncaissesMois = 0;

    for (const r of currentMonthRes) {
      const base = Number(r.totalBase || 0);
      const delivery = Number(r.fraisLivraison || 0);
      const horsDakar = Number(r.supplementHorsDakar || 0);
      const brut = base + delivery + horsDakar;

      const comm = Number(r.montantCommission || 0);
      const net = Number(r.netProprietaire || 0);
      const payeEnLigne = Number(r.montantPayeEnLigne || 0);

      caBrutMois += brut;
      commissionAutoLocMois += comm;
      netProprietaireMois += net;
      revenusEncaissesMois += payeEnLigne;
    }

    const netMoisPrecedent = prevMonthRes.reduce((sum, r) => sum + Number(r.netProprietaire || 0), 0);
    let variationMoisPourcentage = 0;
    if (netMoisPrecedent > 0) {
      variationMoisPourcentage = Math.round(((netProprietaireMois - netMoisPrecedent) / netMoisPrecedent) * 100);
    } else if (netProprietaireMois > 0) {
      variationMoisPourcentage = 100;
    }

    const revenusEnAttente = pendingReservations.reduce((sum, r) => sum + Number(r.netProprietaire || 0), 0);
    const soldeDisponibleWallet = wallet ? Number(wallet.soldeDisponible) : 0;
    const totalPenalites = penalites.reduce((sum, p) => sum + Number(p.montant), 0);
    const soldeRetirableWallet = Math.max(0, soldeDisponibleWallet - totalPenalites);

    // Occupation commerciale du mois
    const occupancyStats = await this.getOccupancyStats(user, {
      startDate: startOfCurrentMonth.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });

    return {
      financials: {
        caBrutMois,
        commissionAutoLocMois,
        netProprietaireMois,
        revenusEncaissesMois,
        revenusEnAttente,
        soldeDisponibleWallet,
        soldeRetirableWallet,
        variationMoisPourcentage,
      },
      operational: {
        reservationsActives: activeResCount,
        demandesEnAttenteCount: pendingCount,
        checkinsAujourdhuiCount: checkinsTodayCount,
        checkoutsAujourdhuiCount: checkoutsTodayCount,
        litigesOuvertsCount: litigesCount,
      },
      fleet: {
        totalVehiculesCount: vehicules.length,
        vehiculesLouesAujourdhuiCount: rentedTodayCount,
        tauxOccupationReelMois: occupancyStats.tauxOccupationCommercialPourcentage,
        noteMoyenneFlotte: reviewsAggregate._avg.note ? Number(reviewsAggregate._avg.note.toFixed(1)) : 0,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. RÉPARTITION DES REVENUS (PRORATA JOURNALIER / TIME SERIES)
  // ─────────────────────────────────────────────────────────────────────────────

  async getRevenueBreakdown(
    user: RequestUser,
    query: RevenueBreakdownQueryDto,
  ): Promise<RevenueBreakdownResponseDto> {
    const proprietaireId = await this.getUtilisateurId(user);

    const now = new Date();
    const groupBy = query.groupBy ?? GroupByPeriod.MONTH;

    let startDate: Date;
    let endDate: Date;

    if (query.startDate) {
      startDate = new Date(query.startDate);
    } else {
      if (groupBy === GroupByPeriod.DAY) {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1); // Début de l'année en cours
      }
    }

    if (query.endDate) {
      endDate = new Date(query.endDate);
    } else {
      endDate = now;
    }

    // Récupérer toutes les réservations actives susceptibles de chevaucher la période
    const activeStatuses = [
      StatutReservation.PAYEE,
      StatutReservation.CONFIRMEE,
      StatutReservation.EN_COURS,
      StatutReservation.TERMINEE,
    ];

    const reservations = await this.prisma.reservation.findMany({
      where: {
        proprietaireId,
        statut: { in: activeStatuses },
        dateDebut: { lte: endDate },
        dateFin: { gte: startDate },
      },
      select: {
        id: true,
        dateDebut: true,
        dateFin: true,
        totalBase: true,
        montantCommission: true,
        netProprietaire: true,
        montantPayeEnLigne: true,
        fraisLivraison: true,
        supplementHorsDakar: true,
      },
    });

    // Mappe jour par jour pour la ventilation au prorata
    const dailyMap = new Map<string, { caBrut: number; comm: number; net: number; encaisse: number; activeRes: Set<string> }>();

    // Initialiser chaque jour de la plage
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const dateKey = cur.toISOString().split('T')[0];
      dailyMap.set(dateKey, { caBrut: 0, comm: 0, net: 0, encaisse: 0, activeRes: new Set() });
      cur.setDate(cur.getDate() + 1);
    }

    // Appliquer le prorata journalier
    for (const r of reservations) {
      const resStart = new Date(r.dateDebut);
      const resEnd = new Date(r.dateFin);

      // Calcul du nombre total de jours de la réservation
      const diffMs = Math.max(1, resEnd.getTime() - resStart.getTime());
      const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const totalBrut = Number(r.totalBase || 0) + Number(r.fraisLivraison || 0) + Number(r.supplementHorsDakar || 0);
      const totalComm = Number(r.montantCommission || 0);
      const totalNet = Number(r.netProprietaire || 0);
      const totalEncaisse = Number(r.montantPayeEnLigne || 0);

      const dailyBrut = totalBrut / totalDays;
      const dailyComm = totalComm / totalDays;
      const dailyNet = totalNet / totalDays;
      const dailyEncaisse = totalEncaisse / totalDays;

      // Parcourir chaque jour de la réservation
      const dayCur = new Date(resStart);
      while (dayCur <= resEnd) {
        const dateKey = dayCur.toISOString().split('T')[0];
        if (dailyMap.has(dateKey)) {
          const entry = dailyMap.get(dateKey)!;
          entry.caBrut += dailyBrut;
          entry.comm += dailyComm;
          entry.net += dailyNet;
          entry.encaisse += dailyEncaisse;
          entry.activeRes.add(r.id);
        }
        dayCur.setDate(dayCur.getDate() + 1);
      }
    }

    // Regrouper par la période demandée (day, week, month)
    const groupedPoints = new Map<string, RevenueBreakdownPointDto>();

    for (const [dateKey, val] of dailyMap.entries()) {
      let groupKey = dateKey;
      if (groupBy === GroupByPeriod.MONTH) {
        groupKey = dateKey.substring(0, 7); // "YYYY-MM"
      } else if (groupBy === GroupByPeriod.WEEK) {
        const d = new Date(dateKey + 'T00:00:00');
        const day = d.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diffToMonday);
        groupKey = d.toISOString().split('T')[0];
      }

      if (!groupedPoints.has(groupKey)) {
        groupedPoints.set(groupKey, {
          date: groupKey,
          caBrut: 0,
          commissionAutoLoc: 0,
          netProprietaire: 0,
          revenusEncaisses: 0,
          nbReservationsActives: 0,
          nbJoursLoues: 0,
        });
      }

      const point = groupedPoints.get(groupKey)!;
      point.caBrut += Math.round(val.caBrut);
      point.commissionAutoLoc += Math.round(val.comm);
      point.netProprietaire += Math.round(val.net);
      point.revenusEncaisses += Math.round(val.encaisse);
      point.nbJoursLoues += val.activeRes.size > 0 ? 1 : 0;
      point.nbReservationsActives = Math.max(point.nbReservationsActives, val.activeRes.size);
    }

    const timeSeries = Array.from(groupedPoints.values());

    const totals = timeSeries.reduce(
      (acc, p) => ({
        caBrut: acc.caBrut + p.caBrut,
        commissionAutoLoc: acc.commissionAutoLoc + p.commissionAutoLoc,
        netProprietaire: acc.netProprietaire + p.netProprietaire,
        revenusEncaisses: acc.revenusEncaisses + p.revenusEncaisses,
        nbReservations: Math.max(acc.nbReservations, p.nbReservationsActives),
        nbJoursLoues: acc.nbJoursLoues + p.nbJoursLoues,
      }),
      { caBrut: 0, commissionAutoLoc: 0, netProprietaire: 0, revenusEncaisses: 0, nbReservations: 0, nbJoursLoues: 0 },
    );

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        groupBy,
      },
      totals,
      timeSeries,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ANALYTICS D'OCCUPATION À 5 ÉTATS
  // ─────────────────────────────────────────────────────────────────────────────

  async getOccupancyStats(
    user: RequestUser,
    query: OccupancyQueryDto,
  ): Promise<OccupancyAnalyticsResponseDto> {
    const proprietaireId = await this.getUtilisateurId(user);

    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = query.endDate ? new Date(query.endDate) : now;

    // Récupérer les véhicules de la flotte
    const vehicleWhere: Record<string, unknown> = { proprietaireId, archiveLe: null, NOT: { statut: StatutVehicule.ARCHIVE } };
    if (query.vehiculeId) vehicleWhere.id = query.vehiculeId;

    const vehicules = await this.prisma.vehicule.findMany({
      where: vehicleWhere,
      select: {
        id: true,
        statut: true,
        creeLe: true,
        indisponibilites: {
          where: { dateDebut: { lte: endDate }, dateFin: { gte: startDate } },
          select: { dateDebut: true, dateFin: true },
        },
        reservations: {
          where: {
            statut: { in: [StatutReservation.PAYEE, StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
            dateDebut: { lte: endDate },
            dateFin: { gte: startDate },
          },
          select: { dateDebut: true, dateFin: true },
        },
      },
    });

    let joursLouesTotal = 0;
    let joursDisponiblesTotal = 0;
    let joursBloquesProprioTotal = 0;
    let joursMaintenanceTotal = 0;

    const totalCalendarDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    for (const v of vehicules) {
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const dateStr = cur.toISOString().split('T')[0];

        // Vérifier si hors période opérationnelle
        if (cur < new Date(v.creeLe.toISOString().split('T')[0])) {
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        // Vérifier si maintenance / suspendu
        if (v.statut === StatutVehicule.SUSPENDU || v.statut === StatutVehicule.EN_ATTENTE_VALIDATION || v.statut === StatutVehicule.BROUILLON) {
          joursMaintenanceTotal++;
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        // 1. RENTED ?
        const isRented = v.reservations.some((r) => {
          const rStart = r.dateDebut.toISOString().split('T')[0];
          const rEnd = r.dateFin.toISOString().split('T')[0];
          return dateStr >= rStart && dateStr <= rEnd;
        });

        if (isRented) {
          joursLouesTotal++;
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        // 2. MANUALLY BLOCKED ?
        const isBlocked = v.indisponibilites.some((i) => {
          const iStart = i.dateDebut.toISOString().split('T')[0];
          const iEnd = i.dateFin.toISOString().split('T')[0];
          return dateStr >= iStart && dateStr <= iEnd;
        });

        if (isBlocked) {
          joursBloquesProprioTotal++;
          cur.setDate(cur.getDate() + 1);
          continue;
        }

        // 3. AVAILABLE UNBOOKED
        joursDisponiblesTotal++;
        cur.setDate(cur.getDate() + 1);
      }
    }

    const totalExploitable = joursLouesTotal + joursDisponiblesTotal;
    const tauxOccupationCommercialPourcentage = totalExploitable > 0
      ? Number(((joursLouesTotal / totalExploitable) * 100).toFixed(1))
      : 0;

    return {
      periode: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalVehiculesFlotte: vehicules.length,
      totalJoursCalendrier: totalCalendarDays,
      totalJoursFlotteExploitable: totalExploitable,
      joursLoues: joursLouesTotal,
      joursDisponiblesEtNonLoues: joursDisponiblesTotal,
      joursBloquesProprietaire: joursBloquesProprioTotal,
      joursMaintenanceOuSuspendus: joursMaintenanceTotal,
      tauxOccupationCommercialPourcentage,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. PERFORMANCE PAR VÉHICULE (FLEET PERFORMANCE)
  // ─────────────────────────────────────────────────────────────────────────────

  async getFleetPerformance(
    user: RequestUser,
    query: FleetPerformanceQueryDto,
  ): Promise<FleetPerformanceResponseDto> {
    const proprietaireId = await this.getUtilisateurId(user);

    const now = new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : now;

    const vehicules = await this.prisma.vehicule.findMany({
      where: { proprietaireId, archiveLe: null, NOT: { statut: StatutVehicule.ARCHIVE } },
      select: {
        id: true,
        marque: true,
        modele: true,
        immatriculation: true,
        statut: true,
        note: true,
        photos: {
          where: { estPrincipale: true },
          select: { url: true },
          take: 1,
        },
        metrics: {
          select: { vues30j: true, clics30j: true, tauxEngagement: true },
        },
        reservations: {
          where: {
            statut: { in: [StatutReservation.PAYEE, StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] },
            dateDebut: { lte: endDate },
            dateFin: { gte: startDate },
          },
          select: {
            id: true,
            dateDebut: true,
            dateFin: true,
            netProprietaire: true,
          },
        },
      },
    });

    const items: VehiclePerformanceItemDto[] = [];

    for (const v of vehicules) {
      let caNet = 0;
      let nbJoursLoues = 0;

      for (const r of v.reservations) {
        caNet += Number(r.netProprietaire || 0);
        const rStart = new Date(r.dateDebut);
        const rEnd = new Date(r.dateFin);
        const diffMs = Math.max(1, rEnd.getTime() - rStart.getTime());
        nbJoursLoues += Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const totalPeriodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const tauxOccupation = Number(Math.min(100, (nbJoursLoues / totalPeriodDays) * 100).toFixed(1));

      let vues30j = v.metrics?.vues30j ?? 0;
      let clics30j = v.metrics?.clics30j ?? 0;

      if (vues30j === 0) {
        vues30j = await this.prisma.vehiculeView.count({
          where: { vehiculeId: v.id, creeLe: { gte: startDate } },
        });
      }
      if (clics30j === 0) {
        clics30j = await this.prisma.vehiculeClick.count({
          where: { vehiculeId: v.id, creeLe: { gte: startDate } },
        });
      }

      const tauxConversion = vues30j > 0 ? Number(((clics30j / vues30j) * 100).toFixed(1)) : 0;

      items.push({
        vehiculeId: v.id,
        marque: v.marque,
        modele: v.modele,
        immatriculation: v.immatriculation,
        photoUrl: v.photos[0]?.url ?? null,
        statut: v.statut,
        caNet: Math.round(caNet),
        nbReservations: v.reservations.length,
        nbJoursLoues,
        tauxOccupation,
        vues30j,
        clics30j,
        tauxConversion,
        noteMoyenne: Number(v.note),
      });
    }

    // Tri selon le paramètre
    const sortBy = query.sortBy ?? SortByFleetMetric.REVENUE;
    items.sort((a, b) => {
      if (sortBy === SortByFleetMetric.OCCUPANCY) return b.tauxOccupation - a.tauxOccupation;
      if (sortBy === SortByFleetMetric.CONVERSION) return b.tauxConversion - a.tauxConversion;
      if (sortBy === SortByFleetMetric.VIEWS) return b.vues30j - a.vues30j;
      return b.caNet - a.caNet; // Par défaut CA Net
    });

    return {
      periode: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalVehicles: items.length,
      vehicles: items,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. MOTEUR D'INSIGHTS (NIVEAU 1 & 2 DÉTERMINISTE)
  // ─────────────────────────────────────────────────────────────────────────────

  async getInsights(user: RequestUser): Promise<OwnerInsightsResponseDto> {
    const proprietaireId = await this.getUtilisateurId(user);
    const insights: OwnerInsightItemDto[] = [];

    const [vehicules, pendingConfirmations, wallet, penalites] = await Promise.all([
      this.prisma.vehicule.findMany({
        where: { proprietaireId, archiveLe: null, NOT: { statut: StatutVehicule.ARCHIVE } },
        select: {
          id: true,
          marque: true,
          modele: true,
          prixParJour: true,
          joursMinimum: true,
          photos: { select: { id: true } },
          metrics: { select: { vues30j: true, clics30j: true } },
          reservations: {
            where: { statut: { in: [StatutReservation.PAYEE, StatutReservation.CONFIRMEE, StatutReservation.EN_COURS, StatutReservation.TERMINEE] } },
            select: { id: true },
          },
        },
      }),
      this.prisma.reservation.findMany({
        where: { proprietaireId, statut: StatutReservation.PAYEE },
        select: { id: true },
      }),
      this.prisma.wallet.findUnique({
        where: { utilisateurId: proprietaireId },
        select: { soldeDisponible: true },
      }),
      this.prisma.penaliteProprietaire.findMany({
        where: { utilisateurId: proprietaireId, preleveleLe: null },
        select: { montant: true },
      }),
    ]);

    // Règle 1 : Confirmation en attente (Urgence Opérationnelle)
    if (pendingConfirmations.length > 0) {
      insights.push({
        id: 'ins-pending-confirmations',
        niveau: 'DESCRIPTIF',
        category: 'OPERATIONNEL',
        titre: 'Réservation en attente de confirmation',
        message: `Vous avez ${pendingConfirmations.length} réservation(s) payée(s) en attente de votre confirmation.`,
        actionCode: 'CONFIRM_RESERVATION',
      });
    }

    // Règle 2 : Solde disponible retirable
    const solde = wallet ? Number(wallet.soldeDisponible) : 0;
    const penaliteTotal = penalites.reduce((sum, p) => sum + Number(p.montant), 0);
    const retirable = Math.max(0, solde - penaliteTotal);
    if (retirable >= 25000) {
      insights.push({
        id: 'ins-wallet-retrait',
        niveau: 'DESCRIPTIF',
        category: 'PERFORMANCE',
        titre: 'Solde retirable disponible',
        message: `Vous disposez de ${retirable.toLocaleString('fr-FR')} FCFA prêts à être retirés vers votre compte Wave ou Orange Money.`,
        actionCode: 'WITHDRAW_FUNDS',
      });
    }

    // Analyse par véhicule
    for (const v of vehicules) {
      const vues = v.metrics?.vues30j ?? 0;
      const resCount = v.reservations.length;

      // Règle 3 : Vues élevées mais aucune réservation (Diagnostic)
      if (vues >= 40 && resCount === 0) {
        insights.push({
          id: `ins-high-views-no-booking-${v.id}`,
          niveau: 'DIAGNOSTIQUE',
          category: 'TARIFICATION',
          titre: `Opportunité sur ${v.marque} ${v.modele}`,
          message: `Votre véhicule enregistre ${vues} vues sur 30 jours sans réservation. Envisagez de réviser le tarif journalier (${Number(v.prixParJour).toLocaleString('fr-FR')} FCFA) ou d'ajuster les jours minimums (${v.joursMinimum} j).`,
          vehiculeId: v.id,
          vehiculeName: `${v.marque} ${v.modele}`,
          actionCode: 'UPDATE_PRICE',
        });
      }

      // Règle 4 : Photos insuffisantes
      if (v.photos.length < 3) {
        insights.push({
          id: `ins-low-photos-${v.id}`,
          niveau: 'DIAGNOSTIQUE',
          category: 'QUALITE_ANNONCE',
          titre: `Complétez les visuels de ${v.marque} ${v.modele}`,
          message: `Votre fiche ne contient que ${v.photos.length} photo(s). Les annonces avec au moins 4 photos haute qualité reçoivent 3x plus de clics.`,
          vehiculeId: v.id,
          vehiculeName: `${v.marque} ${v.modele}`,
          actionCode: 'ADD_PHOTOS',
        });
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      insights,
    };
  }
}
