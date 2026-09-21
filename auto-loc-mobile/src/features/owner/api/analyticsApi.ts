import { apiClient } from '../../../core/api/apiClient';

export interface OwnerOverviewMetrics {
  caBrutMois: number;
  commissionAutoLocMois: number;
  netProprietaireMois: number;
  revenusEncaissesMois: number;
  revenusEnAttente: number;
  soldeDisponibleWallet: number;
  soldeRetirableWallet: number;
  variationMoisPourcentage: number;
  reservationsActivesCount: number;
  demandesEnAttenteCount: number;
  tauxOccupationNet: number;
  noteMoyenneFlotte: number;
  totalVehiculesCount: number;
  litigesOuvertsCount: number;
}

export interface RevenueBreakdownDay {
  date: string; // YYYY-MM-DD
  caBrut: number;
  netProprietaire: number;
  commission: number;
  encaisse: boolean; // Double check-in validé
}

export interface RevenueBreakdownData {
  annee: number;
  mois: number;
  jours: RevenueBreakdownDay[];
  totalCaBrutMois: number;
  totalNetProprietaireMois: number;
  totalEncaisseMois: number;
  totalEnAttenteMois: number;
}

export interface OccupancyStatsData {
  periode: { debut: string; fin: string };
  totalJoursCalendrier: number;
  totalJoursIndisponibleHorsCommercial: number; // Maintenance & usage personnel
  totalJoursCommercialementDisponibles: number; // Dénominateur commercial
  totalJoursLoues: number; // Jours sous réservation confirmée/en cours/terminée
  tauxOccupationBrut: number; // (Loués / Calendrier) * 100
  tauxOccupationNet: number; // (Loués / Commercialement Disponibles) * 100
  parVehicule?: Array<{
    vehiculeId: string;
    immatriculation: string;
    marqueModele: string;
    tauxOccupationNet: number;
    joursLoues: number;
    joursMaintenance: number;
  }>;
}

export interface FleetPerformanceItem {
  vehiculeId: string;
  immatriculation: string;
  marqueModele: string;
  photoUrl?: string;
  caBrut: number;
  netProprietaire: number;
  tauxOccupationNet: number;
  reservationsCount: number;
  noteMoyenne: number;
  conversionFunnel: {
    impressions: number;
    demandes: number;
    acceptations: number;
    tauxConversion: number; // %
  };
}

export interface FleetPerformanceData {
  periode: string;
  flotte: FleetPerformanceItem[];
}

export interface OwnerInsight {
  id: string;
  niveau: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE' | 'OPPORTUNITE';
  titre: string;
  message: string;
  actionRecommandee?: string;
  impactPotentielFCFA?: number;
  vehiculeId?: string;
}

export interface OwnerInsightsData {
  scoreSanteGlobal: number; // 0 - 100
  insights: OwnerInsight[];
}

export const analyticsApi = {
  // GET /analytics/owner/overview
  getOverview: async (periode: '7j' | '30j' | '90j' | '1an' | 'tout' = '30j'): Promise<OwnerOverviewMetrics> => {
    try {
      const res = await apiClient.get('/analytics/owner/overview', { params: { periode } });
      return res.data;
    } catch (err) {
      console.warn('Erreur /analytics/owner/overview mobile API:', err);
      throw err;
    }
  },

  // GET /analytics/owner/revenue-breakdown
  getRevenueBreakdown: async (annee?: number, mois?: number): Promise<RevenueBreakdownData> => {
    try {
      const res = await apiClient.get('/analytics/owner/revenue-breakdown', {
        params: { annee, mois },
      });
      return res.data;
    } catch (err) {
      console.warn('Erreur /analytics/owner/revenue-breakdown mobile API:', err);
      throw err;
    }
  },

  // GET /analytics/owner/occupancy
  getOccupancyStats: async (params?: { vehiculeId?: string; mois?: number; annee?: number }): Promise<OccupancyStatsData> => {
    try {
      const res = await apiClient.get('/analytics/owner/occupancy', { params });
      return res.data;
    } catch (err) {
      console.warn('Erreur /analytics/owner/occupancy mobile API:', err);
      throw err;
    }
  },

  // GET /analytics/owner/fleet-performance
  getFleetPerformance: async (periode: '7j' | '30j' | '90j' | '1an' | 'tout' = '30j'): Promise<FleetPerformanceData> => {
    try {
      const res = await apiClient.get('/analytics/owner/fleet-performance', { params: { periode } });
      return res.data;
    } catch (err) {
      console.warn('Erreur /analytics/owner/fleet-performance mobile API:', err);
      throw err;
    }
  },

  // GET /analytics/owner/insights
  getInsights: async (): Promise<OwnerInsightsData> => {
    try {
      const res = await apiClient.get('/analytics/owner/insights');
      return res.data;
    } catch (err) {
      console.warn('Erreur /analytics/owner/insights mobile API:', err);
      throw err;
    }
  },
};
