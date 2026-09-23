'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { ownerDashboardApi } from '../../../core/api';
import { useUserStore } from '../../../core/store/useUserStore';
import type {
  OwnerOverviewAnalytics,
  RevenueBreakdownResponse,
  OccupancyAnalyticsResponse,
  FleetPerformanceResponse,
  OwnerInsightsResponse,
} from '../../../core/api/analyticsApi';
import type { OwnerNotificationsCount } from '../../../core/api/reservationsApi';
import type { WalletData } from '../../../core/api/walletApi';
import type { OwnerReviewsResponse } from '../../../core/api/reviewsApi';

interface UseOwnerDashboardOptions {
  revenueGroupBy?: 'day' | 'week' | 'month';
  revenueTimeRange?: '7d' | '30d' | '6m' | '1y';
}

// Configuration TTL (Time-To-Live) par domaine métier selon la politique Big Tech
const ANALYTICS_SWR_OPTIONS = {
  dedupingInterval: 5 * 60 * 1000, // 5 minutes de fraîcheur
  revalidateOnFocus: false,
  revalidateIfStale: false,
  keepPreviousData: true,
};

const WALLET_SWR_OPTIONS = {
  dedupingInterval: 2 * 60 * 1000, // 2 minutes de fraîcheur
  revalidateOnFocus: false,
  keepPreviousData: true,
};

const NOTIFICATIONS_SWR_OPTIONS = {
  dedupingInterval: 30 * 1000, // 30 secondes
  revalidateOnFocus: true,
  focusThrottleInterval: 30 * 1000,
  keepPreviousData: true,
};

function getUserIdFromToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('autoloc_token');
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
}

/**
 * Hook orchestrateur SWR du Dashboard Owner.
 * Récupère en parallèle et met en cache toutes les données financières, opérationnelles
 * et analytiques nécessaires au fonctionnement de la page /dashboard avec une stratégie de cache stricte.
 */
export function useOwnerDashboard(options?: UseOwnerDashboardOptions) {
  const { user } = useUserStore();
  const revenueGroupBy = options?.revenueGroupBy || 'month';
  const revenueTimeRange = options?.revenueTimeRange || '6m';

  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  const effectiveUserId = user?.id || getUserIdFromToken();

  /**
   * 1. GET /analytics/owner/overview (Tier 1 - 5 min TTL)
   */
  const {
    data: overview,
    error: errorOverview,
    isLoading: isLoadingOverview,
    isValidating: isValidatingOverview,
    mutate: mutateOverview,
  } = useSWR<OwnerOverviewAnalytics>(
    'analytics-overview',
    () => ownerDashboardApi.analytics.getOverview(),
    ANALYTICS_SWR_OPTIONS
  );

  /**
   * 2. GET /analytics/owner/revenue-breakdown (Tier 1 - 5 min TTL)
   */
  const {
    data: revenue,
    error: errorRevenue,
    isLoading: isLoadingRevenue,
    isValidating: isValidatingRevenue,
    mutate: mutateRevenue,
  } = useSWR<RevenueBreakdownResponse>(
    ['analytics-revenue', revenueGroupBy, revenueTimeRange],
    () => {
      const now = new Date();
      let startDate: string | undefined;
      if (revenueTimeRange === '7d') {
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = d.toISOString().split('T')[0];
      } else if (revenueTimeRange === '30d') {
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = d.toISOString().split('T')[0];
      } else if (revenueTimeRange === '6m') {
        const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        startDate = d.toISOString().split('T')[0];
      } else if (revenueTimeRange === '1y') {
        const d = new Date(now.getFullYear(), 0, 1);
        startDate = d.toISOString().split('T')[0];
      }
      return ownerDashboardApi.analytics.getRevenueBreakdown({
        groupBy: revenueGroupBy,
        startDate,
        endDate: now.toISOString().split('T')[0],
      });
    },
    ANALYTICS_SWR_OPTIONS
  );

  /**
   * 3. GET /analytics/owner/occupancy (Tier 1 - 5 min TTL)
   */
  const {
    data: occupancy,
    error: errorOccupancy,
    isLoading: isLoadingOccupancy,
    isValidating: isValidatingOccupancy,
    mutate: mutateOccupancy,
  } = useSWR<OccupancyAnalyticsResponse>(
    'analytics-occupancy',
    () => ownerDashboardApi.analytics.getOccupancyStats(),
    ANALYTICS_SWR_OPTIONS
  );

  /**
   * 4. GET /analytics/owner/fleet-performance (Tier 1 - 5 min TTL)
   */
  const {
    data: fleet,
    error: errorFleet,
    isLoading: isLoadingFleet,
    isValidating: isValidatingFleet,
    mutate: mutateFleet,
  } = useSWR<FleetPerformanceResponse>(
    'analytics-fleet',
    () => ownerDashboardApi.analytics.getFleetPerformance(),
    ANALYTICS_SWR_OPTIONS
  );

  /**
   * 5. GET /analytics/owner/insights (Tier 1 - 5 min TTL)
   */
  const {
    data: insights,
    error: errorInsights,
    isLoading: isLoadingInsights,
    isValidating: isValidatingInsights,
    mutate: mutateInsights,
  } = useSWR<OwnerInsightsResponse>(
    'analytics-insights',
    () => ownerDashboardApi.analytics.getInsights(),
    ANALYTICS_SWR_OPTIONS
  );

  /**
   * 6. GET /reservations/owner/notifications (Tier 3 - 30s TTL)
   */
  const {
    data: notifications,
    error: errorNotifications,
    isLoading: isLoadingNotifications,
    isValidating: isValidatingNotifications,
    mutate: mutateNotifications,
  } = useSWR<OwnerNotificationsCount>(
    'owner-notifications',
    () => ownerDashboardApi.reservations.getOwnerNotifications(),
    NOTIFICATIONS_SWR_OPTIONS
  );

  /**
   * 7. GET /wallet (Tier 2 - 2 min TTL)
   */
  const {
    data: wallet,
    error: errorWallet,
    isLoading: isLoadingWallet,
    isValidating: isValidatingWallet,
    mutate: mutateWallet,
  } = useSWR<WalletData>(
    'wallet-me',
    () => ownerDashboardApi.wallet.getWallet(),
    WALLET_SWR_OPTIONS
  );

  /**
   * 8. GET /reviews/user (Tier 2 - 2 min TTL)
   */
  const {
    data: reviews,
    error: errorReviews,
    isLoading: isLoadingReviews,
    isValidating: isValidatingReviews,
    mutate: mutateReviews,
  } = useSWR<OwnerReviewsResponse>(
    effectiveUserId ? ['reviews-user', effectiveUserId] : null,
    () => ownerDashboardApi.reviews.getUserReviews(effectiveUserId!),
    WALLET_SWR_OPTIONS
  );

  /**
   * Rafraîchissement manuel de toutes les requêtes du Dashboard
   */
  const mutateAll = useCallback(async () => {
    setLastRefreshedAt(new Date());
    await Promise.all([
      mutateOverview(),
      mutateRevenue(),
      mutateOccupancy(),
      mutateFleet(),
      mutateInsights(),
      mutateNotifications(),
      mutateWallet(),
      mutateReviews(),
    ]);
  }, [
    mutateOverview,
    mutateRevenue,
    mutateOccupancy,
    mutateFleet,
    mutateInsights,
    mutateNotifications,
    mutateWallet,
    mutateReviews,
  ]);

  const isRefreshing = Boolean(
    isValidatingOverview ||
      isValidatingRevenue ||
      isValidatingOccupancy ||
      isValidatingFleet ||
      isValidatingInsights ||
      isValidatingNotifications ||
      isValidatingWallet ||
      isValidatingReviews
  );

  const hasError = Boolean(
    errorOverview ||
      errorRevenue ||
      errorOccupancy ||
      errorFleet ||
      errorInsights ||
      errorNotifications ||
      errorWallet ||
      errorReviews
  );

  return {
    user,
    overview,
    revenue,
    occupancy,
    fleet,
    insights,
    notifications,
    wallet,
    reviews,

    isLoadingOverview,
    isLoadingRevenue,
    isLoadingOccupancy,
    isLoadingFleet,
    isLoadingInsights,
    isLoadingNotifications,
    isLoadingWallet,
    isLoadingReviews,

    isRefreshing,
    lastRefreshedAt,
    hasError,
    mutateAll,
  };
}
