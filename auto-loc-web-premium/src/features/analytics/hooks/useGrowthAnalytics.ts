'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  adminAnalyticsApi,
  AdminDashboardSummaryData,
  AdminGrowthAttributionSummaryData,
} from '@/src/core/api/adminAnalyticsApi';

export function useGrowthAnalytics(period: string = '30d') {
  const [summary, setSummary] = useState<AdminDashboardSummaryData | null>(null);
  const [attribution, setAttribution] = useState<AdminGrowthAttributionSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [summaryRes, attributionRes] = await Promise.all([
        adminAnalyticsApi.getDashboardSummary(period),
        adminAnalyticsApi.getGrowthAttributionSummary(period),
      ]);
      setSummary(summaryRes);
      setAttribution(attributionRes);
    } catch (err) {
      console.error('Failed to fetch growth analytics:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    attribution,
    isLoading,
    isError,
    refresh: fetchData,
  };
}
