'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { adminAnalyticsApi } from '../../../core/api/adminAnalyticsApi';
import type {
  AdminOverviewData,
  AdminRevenueTrendsData,
  AdminPaymentBreakdownData,
  AdminFleetStatsData,
  AdminFunnelData,
  AdminOpsCommandCenterData,
  AdminRiskQualityData,
  AdminUserActivationFunnelData,
  AdminSupplyPipelineData,
} from '../../../core/api/adminAnalyticsApi';

const ADMIN_SWR_OPTIONS = {
  dedupingInterval: 60 * 1000, // 1 minute
  revalidateOnFocus: false,
  keepPreviousData: true,
};

const FAST_OPS_SWR_OPTIONS = {
  dedupingInterval: 30 * 1000, // 30 secondes pour la file d'opérations temps réel
  revalidateOnFocus: true,
  keepPreviousData: true,
};

export function useAdminDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m' | 'ytd'>('30d');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  // 1. Overview
  const {
    data: overview,
    isLoading: isLoadingOverview,
    isValidating: isValidatingOverview,
    mutate: mutateOverview,
  } = useSWR<AdminOverviewData>(
    ['admin-overview', period],
    () => adminAnalyticsApi.getOverview(period),
    ADMIN_SWR_OPTIONS
  );

  // 2. Revenue Trends
  const {
    data: trends,
    isLoading: isLoadingTrends,
    isValidating: isValidatingTrends,
    mutate: mutateTrends,
  } = useSWR<AdminRevenueTrendsData>(
    ['admin-trends', period],
    () => adminAnalyticsApi.getRevenueTrends(period),
    ADMIN_SWR_OPTIONS
  );

  // 3. Payment Breakdown (Wave vs OM)
  const {
    data: payments,
    isLoading: isLoadingPayments,
    isValidating: isValidatingPayments,
    mutate: mutatePayments,
  } = useSWR<AdminPaymentBreakdownData>(
    ['admin-payments', period],
    () => adminAnalyticsApi.getPaymentBreakdown(period),
    ADMIN_SWR_OPTIONS
  );

  // 4. Fleet Stats
  const {
    data: fleetStats,
    isLoading: isLoadingFleetStats,
    isValidating: isValidatingFleetStats,
    mutate: mutateFleetStats,
  } = useSWR<AdminFleetStatsData>(
    'admin-fleet-stats',
    () => adminAnalyticsApi.getFleetStats(),
    ADMIN_SWR_OPTIONS
  );

  // 5. Conversion Funnel
  const {
    data: conversionFunnel,
    isLoading: isLoadingFunnel,
    isValidating: isValidatingFunnel,
    mutate: mutateFunnel,
  } = useSWR<AdminFunnelData>(
    ['admin-funnel', period],
    () => adminAnalyticsApi.getConversionFunnel(period),
    ADMIN_SWR_OPTIONS
  );

  // 6. Ops Command Center (Fast SLA Queue)
  const {
    data: opsCenter,
    isLoading: isLoadingOpsCenter,
    isValidating: isValidatingOpsCenter,
    mutate: mutateOpsCenter,
  } = useSWR<AdminOpsCommandCenterData>(
    'admin-ops-center',
    () => adminAnalyticsApi.getOpsCommandCenter(),
    FAST_OPS_SWR_OPTIONS
  );

  // 7. Users Activation Funnel
  const {
    data: usersFunnel,
    isLoading: isLoadingUsersFunnel,
    isValidating: isValidatingUsersFunnel,
    mutate: mutateUsersFunnel,
  } = useSWR<AdminUserActivationFunnelData>(
    'admin-users-funnel',
    () => adminAnalyticsApi.getUsersFunnel(),
    ADMIN_SWR_OPTIONS
  );

  // 8. Supply Pipeline
  const {
    data: supplyPipeline,
    isLoading: isLoadingSupplyPipeline,
    isValidating: isValidatingSupplyPipeline,
    mutate: mutateSupplyPipeline,
  } = useSWR<AdminSupplyPipelineData>(
    'admin-supply-pipeline',
    () => adminAnalyticsApi.getSupplyPipeline(),
    ADMIN_SWR_OPTIONS
  );

  // 9. Risk & Quality
  const {
    data: riskQuality,
    isLoading: isLoadingRiskQuality,
    isValidating: isValidatingRiskQuality,
    mutate: mutateRiskQuality,
  } = useSWR<AdminRiskQualityData>(
    'admin-risk-quality',
    () => adminAnalyticsApi.getRiskQuality(),
    ADMIN_SWR_OPTIONS
  );

  const mutateAll = useCallback(async () => {
    setLastRefreshedAt(new Date());
    await Promise.all([
      mutateOverview(),
      mutateTrends(),
      mutatePayments(),
      mutateFleetStats(),
      mutateFunnel(),
      mutateOpsCenter(),
      mutateUsersFunnel(),
      mutateSupplyPipeline(),
      mutateRiskQuality(),
    ]);
  }, [
    mutateOverview,
    mutateTrends,
    mutatePayments,
    mutateFleetStats,
    mutateFunnel,
    mutateOpsCenter,
    mutateUsersFunnel,
    mutateSupplyPipeline,
    mutateRiskQuality,
  ]);

  const isRefreshing = Boolean(
    isValidatingOverview ||
      isValidatingTrends ||
      isValidatingPayments ||
      isValidatingFleetStats ||
      isValidatingFunnel ||
      isValidatingOpsCenter ||
      isValidatingUsersFunnel ||
      isValidatingSupplyPipeline ||
      isValidatingRiskQuality
  );

  const isLoadingInitial = Boolean(
    isLoadingOverview &&
      isLoadingTrends &&
      isLoadingOpsCenter
  );

  return {
    period,
    setPeriod,

    overview,
    trends,
    payments,
    fleetStats,
    conversionFunnel,
    opsCenter,
    usersFunnel,
    supplyPipeline,
    riskQuality,

    isLoadingInitial,
    isRefreshing,
    lastRefreshedAt,
    mutateAll,
  };
}
