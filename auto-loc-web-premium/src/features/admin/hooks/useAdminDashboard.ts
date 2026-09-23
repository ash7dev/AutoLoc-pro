'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { adminAnalyticsApi } from '../../../core/api/adminAnalyticsApi';
import type { AdminDashboardSummaryData } from '../../../core/api/adminAnalyticsApi';

const ADMIN_SWR_OPTIONS = {
  dedupingInterval: 30 * 1000, // 30 secondes
  revalidateOnFocus: true,
  keepPreviousData: true,
};

export function useAdminDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m' | 'ytd'>('30d');
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  const {
    data: summary,
    isLoading,
    isValidating: isRefreshing,
    mutate,
  } = useSWR<AdminDashboardSummaryData>(
    ['admin-dashboard-summary', period, selectedCity],
    () => adminAnalyticsApi.getDashboardSummary(period, selectedCity),
    ADMIN_SWR_OPTIONS
  );

  const mutateAll = useCallback(async () => {
    setLastRefreshedAt(new Date());
    await mutate();
  }, [mutate]);

  return {
    period,
    setPeriod,
    selectedCity,
    setSelectedCity,

    overview: summary?.overview,
    trends: summary?.trends,
    payments: summary?.payments,
    fleetStats: summary?.fleetStats,
    conversionFunnel: summary?.conversionFunnel,
    opsCenter: summary?.opsCenter,
    usersFunnel: summary?.usersFunnel,
    supplyPipeline: summary?.supplyPipeline,
    riskQuality: summary?.riskQuality,
    unmetDemand: summary?.unmetDemand,
    cohorts: summary?.cohorts,
    escrow: summary?.escrow,

    isLoadingInitial: isLoading && !summary,
    isRefreshing,
    lastRefreshedAt,
    mutateAll,
  };
}
