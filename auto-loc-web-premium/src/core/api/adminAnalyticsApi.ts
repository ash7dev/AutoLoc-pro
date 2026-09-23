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

export const adminAnalyticsApi = {
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
};
