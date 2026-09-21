import { apiClient } from './apiClient';

// ── Types & Interfaces Analytics (Web Premium) ───────────────────────────────

export interface OwnerOverviewAnalytics {
  financials: {
    caBrutMois: number;
    commissionAutoLocMois: number;
    netProprietaireMois: number;
    revenusEncaissesMois: number;
    revenusEnAttente: number;
    soldeDisponibleWallet: number;
    soldeRetirableWallet: number;
    variationMoisPourcentage: number;
  };
  operational: {
    reservationsActives: number;
    demandesEnAttenteCount: number;
    checkinsAujourdhuiCount: number;
    checkoutsAujourdhuiCount: number;
    litigesOuvertsCount: number;
  };
  fleet: {
    totalVehiculesCount: number;
    vehiculesLouesAujourdhuiCount: number;
    tauxOccupationReelMois: number;
    noteMoyenneFlotte: number;
  };
}

export interface RevenueBreakdownParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  timezone?: string;
}

export interface RevenueBreakdownPoint {
  date: string;
  caBrut: number;
  commissionAutoLoc: number;
  netProprietaire: number;
  revenusEncaisses: number;
  nbReservationsActives: number;
  nbJoursLoues: number;
}

export interface RevenueBreakdownTotals {
  caBrut: number;
  commissionAutoLoc: number;
  netProprietaire: number;
  revenusEncaisses: number;
  nbReservations: number;
  nbJoursLoues: number;
}

export interface RevenueBreakdownResponse {
  period: {
    startDate: string;
    endDate: string;
    groupBy: 'day' | 'week' | 'month';
  };
  totals: RevenueBreakdownTotals;
  timeSeries: RevenueBreakdownPoint[];
}

export interface OccupancyQueryParams {
  startDate?: string;
  endDate?: string;
  vehiculeId?: string;
}

export interface OccupancyAnalyticsResponse {
  periode: {
    startDate: string;
    endDate: string;
  };
  totalVehiculesFlotte: number;
  totalJoursCalendrier: number;
  totalJoursFlotteExploitable: number;
  joursLoues: number;
  joursDisponiblesEtNonLoues: number;
  joursBloquesProprietaire: number;
  joursMaintenanceOuSuspendus: number;
  tauxOccupationCommercialPourcentage: number;
}

export interface FleetPerformanceParams {
  startDate?: string;
  endDate?: string;
  sortBy?: 'revenue' | 'occupancy' | 'conversion' | 'views';
}

export interface VehiclePerformanceItem {
  vehiculeId: string;
  marque: string;
  modele: string;
  immatriculation: string;
  photoUrl: string | null;
  statut: string;
  caNet: number;
  nbReservations: number;
  nbJoursLoues: number;
  tauxOccupation: number;
  vues30j: number;
  clics30j: number;
  tauxConversion: number;
  noteMoyenne: number;
}

export interface FleetPerformanceResponse {
  periode: {
    startDate: string;
    endDate: string;
  };
  totalVehicles: number;
  vehicles: VehiclePerformanceItem[];
}

export interface OwnerInsightItem {
  id: string;
  niveau: 'DESCRIPTIF' | 'DIAGNOSTIQUE';
  category: 'PERFORMANCE' | 'TARIFICATION' | 'QUALITE_ANNONCE' | 'OPERATIONNEL';
  titre: string;
  message: string;
  vehiculeId?: string;
  vehiculeName?: string;
  actionCode?: 'UPDATE_PRICE' | 'REDUCE_MIN_DAYS' | 'ADD_PHOTOS' | 'CONFIRM_RESERVATION' | 'WITHDRAW_FUNDS';
  metadata?: Record<string, unknown>;
}

export interface OwnerInsightsResponse {
  generatedAt: string;
  insights: OwnerInsightItem[];
}

// ── Endpoints API Web Premium ──────────────────────────────────────────────────

export const analyticsApi = {
  /**
   * GET /analytics/owner/overview — Aperçu global financier & exploitation
   */
  getOverview: (): Promise<OwnerOverviewAnalytics> => {
    return apiClient.get<OwnerOverviewAnalytics>('/analytics/owner/overview');
  },

  /**
   * GET /analytics/owner/revenue-breakdown — Séries temporelles de revenus
   */
  getRevenueBreakdown: (params?: RevenueBreakdownParams): Promise<RevenueBreakdownResponse> => {
    return apiClient.get<RevenueBreakdownResponse>('/analytics/owner/revenue-breakdown', {
      params: params as Record<string, unknown>,
    });
  },

  /**
   * GET /analytics/owner/occupancy — Taux d'occupation commercial à 5 états
   */
  getOccupancyStats: (params?: OccupancyQueryParams): Promise<OccupancyAnalyticsResponse> => {
    return apiClient.get<OccupancyAnalyticsResponse>('/analytics/owner/occupancy', {
      params: params as Record<string, unknown>,
    });
  },

  /**
   * GET /analytics/owner/fleet-performance — Performance & conversion par véhicule
   */
  getFleetPerformance: (params?: FleetPerformanceParams): Promise<FleetPerformanceResponse> => {
    return apiClient.get<FleetPerformanceResponse>('/analytics/owner/fleet-performance', {
      params: params as Record<string, unknown>,
    });
  },

  /**
   * GET /analytics/owner/insights — Recommandations & diagnostics
   */
  getInsights: (): Promise<OwnerInsightsResponse> => {
    return apiClient.get<OwnerInsightsResponse>('/analytics/owner/insights');
  },
};
