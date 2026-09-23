import { apiClient } from './apiClient';

export interface AdminOverviewData {
  period: string;
  financials: {
    gmv: number;
    gmvDelta: number;
    netRevenue: number;
    netRevenueDelta: number;
    takeRate: number;
    aov: number;
    bookingsCount: number;
    bookingsDelta: number;
  };
  fleet: {
    activeVehiclesCount: number;
    totalVehiclesCount: number;
    fleetUtilizationRate: number;
  };
  community: {
    activeRentersCount: number;
    activeOwnersCount: number;
    uniqueActiveMembersCount?: number;
    totalUsersCount: number;
  };
}

export interface RevenueTrendPoint {
  date: string;
  gmv: number;
  netRevenue: number;
  count: number;
  aov: number;
}

export interface AdminRevenueTrendsData {
  period: string;
  series: RevenueTrendPoint[];
  summary: {
    totalGmv: number;
    totalNetRevenue: number;
    totalBookings: number;
  };
}

export interface AdminPaymentProviderItem {
  provider: string;
  label: string;
  volume: number;
  sharePercent: number;
  transactionCount: number;
  successRate?: number;
}

export interface AdminPaymentBreakdownData {
  period: string;
  providers: {
    wave: AdminPaymentProviderItem;
    orangeMoney: AdminPaymentProviderItem;
    stripe: AdminPaymentProviderItem;
  };
  totalVolume: number;
  modeBreakdown: Array<{
    mode: string;
    count: number;
    volume: number;
    volumeOnline?: number;
    volumeCheckin?: number;
    totalContractVolume?: number;
  }>;
}

export interface AdminFleetStatsData {
  totalVehicles: number;
  status: {
    verified: number;
    pendingValidation: number;
    suspended: number;
    draft: number;
    archived: number;
  };
  fleetByType: Array<{
    type: string;
    count: number;
    avgPrixJour: number;
    avgNote: number;
  }>;
  fleetByCity: Array<{
    ville: string;
    count: number;
  }>;
}

export interface AdminFunnelData {
  period: string;
  steps: Array<{
    name: string;
    count: number;
    conversion: number;
  }>;
  overallConversion: number;
}

export interface PendingKycItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  submittedAt: string;
  waitHours: number;
}

export interface PendingVehicleItem {
  id: string;
  title: string;
  city: string;
  pricePerDay: number;
  ownerName: string;
  submittedAt: string;
  waitHours: number;
}

export interface PendingWithdrawalItem {
  id: string;
  amount: number;
  method: 'WAVE' | 'ORANGE_MONEY';
  recipient: string;
  userName: string;
  requestedAt: string;
  waitHours: number;
}

export interface PendingDisputeItem {
  id: string;
  motif: string;
  estimatedCost: number | null;
  createdAt: string;
  bookingId: string;
  vehicle: string;
  renterName: string;
  ownerName: string;
}

export interface AdminOpsCommandCenterData {
  kyc: {
    pendingCount: number;
    items: PendingKycItem[];
  };
  vehicles: {
    pendingCount: number;
    items: PendingVehicleItem[];
  };
  withdrawals: {
    pendingCount: number;
    totalPendingAmount: number;
    items: PendingWithdrawalItem[];
  };
  disputes: {
    pendingCount: number;
    items: PendingDisputeItem[];
  };
}

export interface AdminRiskQualityData {
  totalBookings: number;
  cancellationRate: number;
  disputeRatio: number;
  avgRating: number;
}

export interface AdminUserActivationFunnelData {
  totalAuthProfiles?: number;
  totalUsers: number;
  activeRentersTotal: number;
  newUsers7Days: number;
  kycBreakdown: {
    nonVerifie: number;
    enAttente: number;
    verifie: number;
    rejete: number;
  };
  dropOffs: {
    unverifiedStuckCount: number;
    verifiedNoBookingCount: number;
  };
  rates: {
    kycConversionRate: number;
    activationRate: number;
  };
}

export interface AdminSupplyPipelineData {
  totalVehicles: number;
  statusBreakdown: {
    brouillon: number;
    enAttenteValidation: number;
    verifie: number;
    suspendu: number;
    archive: number;
  };
  bottlenecks: {
    stuckDraftsCount: number;
    verifiedZeroBookingsCount: number;
  };
  topOwners: Array<{
    id: string;
    name: string;
    phone: string | null;
    vehicleCount: number;
    totalBookings: number;
  }>;
}

export interface AdminUnmetDemandData {
  totalFailedSearches: number;
  topFailedCities: Array<{ ville: string; count: number }>;
  topFailedTypes: Array<{ type: string; count: number }>;
}

export interface AdminCohortsData {
  totalUniqueRenters: number;
  repeatRentersCount: number;
  repeatRate: number;
}

export interface AdminFinancialEscrowData {
  activeEscrowBookingsCount: number;
  totalEscrowVolume: number;
  totalOnlinePaidInEscrow: number;
  securedCommissionInEscrow: number;
  pendingHostPayoutInEscrow: number;
}

export interface AdminDashboardSummaryData {
  period: string;
  overview: AdminOverviewData;
  trends: AdminRevenueTrendsData;
  payments: AdminPaymentBreakdownData;
  fleetStats: AdminFleetStatsData;
  conversionFunnel: AdminFunnelData;
  opsCenter: AdminOpsCommandCenterData;
  usersFunnel: AdminUserActivationFunnelData;
  supplyPipeline: AdminSupplyPipelineData;
  riskQuality: AdminRiskQualityData;
  unmetDemand: AdminUnmetDemandData;
  cohorts: AdminCohortsData;
  escrow: AdminFinancialEscrowData;
}

export interface AdminKycQueueItem {
  id: string;
  userId: string;
  prenom: string;
  nom: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  statutKyc: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  kycRejectionReason: string | null;
  documents: {
    documentUrl: string | null;
    documentBackUrl: string | null;
    selfieUrl: string | null;
    permisUrl: string | null;
    hasAllFour: boolean;
  };
  submittedAt: string;
  registeredAt: string;
  waitHours: number;
  stats: {
    vehiclesCount: number;
    bookingsCount: number;
  };
}

export interface AdminKycQueueResponse {
  data: AdminKycQueueItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: {
      EN_ATTENTE: number;
      VERIFIE: number;
      REJETE: number;
      NON_VERIFIE: number;
    };
  };
}

export const adminAnalyticsApi = {
  getDashboardSummary: (period: string = '30d', ville?: string): Promise<AdminDashboardSummaryData> => {
    return apiClient.get<AdminDashboardSummaryData>('/admin/analytics/dashboard-summary', { params: { period, ...(ville ? { ville } : {}) } });
  },

  getOverview: (period: string = '30d'): Promise<AdminOverviewData> => {
    return apiClient.get<AdminOverviewData>('/admin/analytics/overview', { params: { period } });
  },

  getRevenueTrends: (period: string = '30d'): Promise<AdminRevenueTrendsData> => {
    return apiClient.get<AdminRevenueTrendsData>('/admin/analytics/revenue-trends', { params: { period } });
  },

  getPaymentBreakdown: (period: string = '30d'): Promise<AdminPaymentBreakdownData> => {
    return apiClient.get<AdminPaymentBreakdownData>('/admin/analytics/payment-breakdown', { params: { period } });
  },

  getFleetStats: (): Promise<AdminFleetStatsData> => {
    return apiClient.get<AdminFleetStatsData>('/admin/analytics/fleet-stats');
  },

  getConversionFunnel: (period: string = '30d'): Promise<AdminFunnelData> => {
    return apiClient.get<AdminFunnelData>('/admin/analytics/conversion-funnel', { params: { period } });
  },

  getOpsCommandCenter: (): Promise<AdminOpsCommandCenterData> => {
    return apiClient.get<AdminOpsCommandCenterData>('/admin/analytics/ops-command-center');
  },

  getRiskQuality: (): Promise<AdminRiskQualityData> => {
    return apiClient.get<AdminRiskQualityData>('/admin/analytics/risk-quality');
  },

  getUsersFunnel: (): Promise<AdminUserActivationFunnelData> => {
    return apiClient.get<AdminUserActivationFunnelData>('/admin/analytics/users-funnel');
  },

  getSupplyPipeline: (): Promise<AdminSupplyPipelineData> => {
    return apiClient.get<AdminSupplyPipelineData>('/admin/analytics/supply-pipeline');
  },

  getUnmetDemand: (): Promise<AdminUnmetDemandData> => {
    return apiClient.get<AdminUnmetDemandData>('/admin/analytics/unmet-demand');
  },

  getCohorts: (): Promise<AdminCohortsData> => {
    return apiClient.get<AdminCohortsData>('/admin/analytics/cohorts');
  },

  getFinancialEscrow: (): Promise<AdminFinancialEscrowData> => {
    return apiClient.get<AdminFinancialEscrowData>('/admin/analytics/financial-escrow');
  },

  getKycQueue: (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<AdminKycQueueResponse> => {
    return apiClient.get<AdminKycQueueResponse>('/admin/users/kyc-queue', { params });
  },

  approveUserKyc: (userId: string): Promise<{ utilisateurId: string; statutKyc: string; vehiclesPromoted: number }> => {
    return apiClient.patch<{ utilisateurId: string; statutKyc: string; vehiclesPromoted: number }>(`/admin/users/${userId}/kyc/approve`);
  },

  rejectUserKyc: (userId: string, raison?: string): Promise<{ id: string; statutKyc: string; kycRejectionReason: string | null }> => {
    return apiClient.patch<{ id: string; statutKyc: string; kycRejectionReason: string | null }>(`/admin/users/${userId}/kyc/reject`, { raison });
  },

  getVehicleModerationQueue: (params?: { statut?: string; search?: string; page?: number; limit?: number }): Promise<AdminVehicleQueueResponse> => {
    return apiClient.get<AdminVehicleQueueResponse>('/admin/vehicles/moderation-queue', { params });
  },

  validateVehicle: (vehicleId: string): Promise<{ id: string; statut: string; marque: string; modele: string }> => {
    return apiClient.patch<{ id: string; statut: string; marque: string; modele: string }>(`/admin/vehicles/${vehicleId}/validate`);
  },

  suspendVehicle: (vehicleId: string, raison: string): Promise<{ id: string; statut: string }> => {
    return apiClient.patch<{ id: string; statut: string }>(`/admin/vehicles/${vehicleId}/suspend`, { raison });
  },

  featureVehicle: (vehicleId: string, active: boolean, featuredUntil?: string): Promise<{ id: string; isFeatured: boolean }> => {
    return apiClient.patch<{ id: string; isFeatured: boolean }>(`/admin/vehicles/${vehicleId}/feature`, { active, featuredUntil });
  },
};

export interface AdminVehicleQueueItem {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  type: string;
  transmission: string | null;
  carburant: string | null;
  nombrePlaces: number | null;
  immatriculation: string;
  prixParJour: number;
  ville: string;
  adresse: string;
  statut: 'EN_ATTENTE_VALIDATION' | 'VERIFIE' | 'SUSPENDU' | 'BROUILLON';
  carteGriseUrl: string | null;
  assurance: string | null;
  joursMinimum: number;
  ageMinimum: number;
  zoneConduite: string | null;
  reglesSpecifiques: string | null;
  fraisLivraison: number | null;
  proposeLivraisonDakar: boolean;
  fraisLivraisonDakar: number | null;
  proposeLivraisonAibd: boolean;
  fraisLivraisonAibd: number | null;
  creeLe: string;
  isFeatured: boolean;
  featuredUntil: string | null;
  slaWaitHours: number;
  photos: Array<{ id: string; url: string; estPrincipale: boolean; position: number }>;
  equipements: string[];
  proprietaire: {
    id: string;
    prenom: string | null;
    nom: string | null;
    email: string | null;
    telephone: string | null;
    avatarUrl: string | null;
    statutKyc: string;
  } | null;
}

export interface AdminVehicleQueueResponse {
  data: AdminVehicleQueueItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    pending: number;
    verified: number;
    suspended: number;
    draft: number;
    total: number;
  };
}
