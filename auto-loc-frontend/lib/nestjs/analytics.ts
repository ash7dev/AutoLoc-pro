import { apiFetch } from './api-client';

// ── Types & Interfaces Analytics ──────────────────────────────────────────────

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

// ── Analytics Fetchers ─────────────────────────────────────────────────────────

/**
 * Récupère la matrice d'aperçu du propriétaire (Server-side).
 */
export async function fetchOwnerOverview(token: string): Promise<OwnerOverviewAnalytics> {
  return apiFetch<OwnerOverviewAnalytics>('/analytics/owner/overview', {
    accessToken: token,
  });
}

/**
 * Récupère les séries temporelles de chiffre d'affaires au prorata (Server-side & Client-side).
 */
export async function fetchRevenueBreakdown(
  token: string,
  params?: RevenueBreakdownParams,
): Promise<RevenueBreakdownResponse> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.groupBy) query.set('groupBy', params.groupBy);
  if (params?.timezone) query.set('timezone', params.timezone);
  const qs = query.toString();

  return apiFetch<RevenueBreakdownResponse>(
    `/analytics/owner/revenue-breakdown${qs ? `?${qs}` : ''}`,
    { accessToken: token },
  );
}

/**
 * Récupère l'analyse d'occupation commerciale à 5 états (Server-side & Client-side).
 */
export async function fetchOccupancyStats(
  token: string,
  params?: OccupancyQueryParams,
): Promise<OccupancyAnalyticsResponse> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.vehiculeId) query.set('vehiculeId', params.vehiculeId);
  const qs = query.toString();

  return apiFetch<OccupancyAnalyticsResponse>(
    `/analytics/owner/occupancy${qs ? `?${qs}` : ''}`,
    { accessToken: token },
  );
}

/**
 * Récupère les performances et l'entonnoir de conversion par véhicule (Server-side & Client-side).
 */
export async function fetchFleetPerformance(
  token: string,
  params?: FleetPerformanceParams,
): Promise<FleetPerformanceResponse> {
  const query = new URLSearchParams();
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  const qs = query.toString();

  return apiFetch<FleetPerformanceResponse>(
    `/analytics/owner/fleet-performance${qs ? `?${qs}` : ''}`,
    { accessToken: token },
  );
}

/**
 * Récupère les conseils et diagnostics intelligents (Server-side & Client-side).
 */
export async function fetchOwnerInsights(token: string): Promise<OwnerInsightsResponse> {
  return apiFetch<OwnerInsightsResponse>('/analytics/owner/insights', {
    accessToken: token,
  });
}
