'use client';

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

/**
 * Hook orchestrateur SWR du Dashboard Owner.
 * Récupère en parallèle et met en cache toutes les données financières, opérationnelles
 * et analytiques nécessaires au fonctionnement de la page /dashboard.
 */
export function useOwnerDashboard(options?: UseOwnerDashboardOptions) {
  const { user } = useUserStore();
  const revenueGroupBy = options?.revenueGroupBy || 'month';
  const revenueTimeRange = options?.revenueTimeRange || '6m';

  /**
   * 1. GET /analytics/owner/overview
   * Rôle : Récupère l'aperçu global financier et opérationnel du propriétaire.
   * Fournit : CA Brut mois, net propriétaire, revenus encaissés (double check-in),
   * fonds en attente (escrow), solde wallet, réservations actives, check-ins/outs du jour et litiges.
   */
  const {
    data: overview,
    error: errorOverview,
    isLoading: isLoadingOverview,
    mutate: mutateOverview,
  } = useSWR<OwnerOverviewAnalytics>('analytics-overview', () =>
    ownerDashboardApi.analytics.getOverview()
  );

  const {
    data: revenue,
    error: errorRevenue,
    isLoading: isLoadingRevenue,
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
    }
  );

  const {
    data: occupancy,
    error: errorOccupancy,
    isLoading: isLoadingOccupancy,
    mutate: mutateOccupancy,
  } = useSWR<OccupancyAnalyticsResponse>('analytics-occupancy', () =>
    ownerDashboardApi.analytics.getOccupancyStats()
  );

  const {
    data: fleet,
    error: errorFleet,
    isLoading: isLoadingFleet,
    mutate: mutateFleet,
  } = useSWR<FleetPerformanceResponse>('analytics-fleet', () =>
    ownerDashboardApi.analytics.getFleetPerformance()
  );

  const {
    data: insights,
    error: errorInsights,
    isLoading: isLoadingInsights,
    mutate: mutateInsights,
  } = useSWR<OwnerInsightsResponse>('analytics-insights', () =>
    ownerDashboardApi.analytics.getInsights()
  );

  const {
    data: notifications,
    error: errorNotifications,
    isLoading: isLoadingNotifications,
    mutate: mutateNotifications,
  } = useSWR<OwnerNotificationsCount>('owner-notifications', () =>
    ownerDashboardApi.reservations.getOwnerNotifications()
  );

  const {
    data: wallet,
    error: errorWallet,
    isLoading: isLoadingWallet,
    mutate: mutateWallet,
  } = useSWR<WalletData>('wallet-me', () =>
    ownerDashboardApi.wallet.getWallet()
  );

  const {
    data: reviews,
    error: errorReviews,
    isLoading: isLoadingReviews,
    mutate: mutateReviews,
  } = useSWR<OwnerReviewsResponse>(
    user?.id ? ['reviews-user', user.id] : null,
    () => ownerDashboardApi.reviews.getUserReviews(user!.id)
  );

  const mutateAll = () => {
    mutateOverview();
    mutateRevenue();
    mutateOccupancy();
    mutateFleet();
    mutateInsights();
    mutateNotifications();
    mutateWallet();
    mutateReviews();
  };

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

    hasError,
    mutateAll,
  };
}
