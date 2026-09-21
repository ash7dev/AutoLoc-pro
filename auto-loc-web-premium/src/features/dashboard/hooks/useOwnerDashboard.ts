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
  revenueTimeRange?: '30d' | '6m' | '1y';
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
  } = useSWR<OwnerOverviewAnalytics>('analytics-overview', () =>
    ownerDashboardApi.analytics.getOverview()
  );

  /**
   * 2. GET /analytics/owner/revenue-breakdown
   * Rôle : Récupère les séries temporelles de revenus selon la plage (30d, 6m, 1y) et le groupement (jour, semaine, mois).
   */
  const {
    data: revenue,
    error: errorRevenue,
    isLoading: isLoadingRevenue,
  } = useSWR<RevenueBreakdownResponse>(
    ['analytics-revenue', revenueGroupBy, revenueTimeRange],
    () => {
      const now = new Date();
      let startDate: string | undefined;
      if (revenueTimeRange === '30d') {
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

  /**
   * 3. GET /analytics/owner/occupancy
   * Rôle : Calcule et ventile le taux d'occupation commercial réel de la flotte sur 30 jours.
   * Fournit : Répartition exacte des jours de calendrier entre jours loués, disponibles,
   * bloqués à titre personnel et véhicules en maintenance (OccupancyDonutCard).
   */
  const {
    data: occupancy,
    error: errorOccupancy,
    isLoading: isLoadingOccupancy,
  } = useSWR<OccupancyAnalyticsResponse>('analytics-occupancy', () =>
    ownerDashboardApi.analytics.getOccupancyStats()
  );

  /**
   * 4. GET /analytics/owner/fleet-performance
   * Rôle : Analyse la rentabilité et l'attractivité individuelle de chaque véhicule.
   * Fournit : Classement de la flotte avec CA net par véhicule, taux d'occupation,
   * nombre de vues, clics 30 jours, taux de conversion et note moyenne (FleetPerformanceTable).
   */
  const {
    data: fleet,
    error: errorFleet,
    isLoading: isLoadingFleet,
  } = useSWR<FleetPerformanceResponse>('analytics-fleet', () =>
    ownerDashboardApi.analytics.getFleetPerformance()
  );

  /**
   * 5. GET /analytics/owner/insights
   * Rôle : Génère des recommandations et diagnostics automatisés par IA.
   * Fournit : Conseils catégorisés (Performance, Tarification, Qualité d'annonce, Opérationnel)
   * avec codes d'action directs pour maximiser le chiffre d'affaires (InsightsPanel).
   */
  const {
    data: insights,
    error: errorInsights,
    isLoading: isLoadingInsights,
  } = useSWR<OwnerInsightsResponse>('analytics-insights', () =>
    ownerDashboardApi.analytics.getInsights()
  );

  /**
   * 6. GET /reservations/owner/notifications
   * Rôle : Récupère les alertes et compteurs de demandes urgentes en temps réel.
   * Fournit : Nombre de confirmations en attente de validation et litiges ouverts pour
   * afficher des badges réactifs sur les boutons d'action rapide (QuickActionsBar).
   */
  const {
    data: notifications,
    error: errorNotifications,
    isLoading: isLoadingNotifications,
  } = useSWR<OwnerNotificationsCount>('owner-notifications', () =>
    ownerDashboardApi.reservations.getOwnerNotifications()
  );

  /**
   * 7. GET /wallet/me
   * Rôle : Récupère les détails financiers du compte portefeuille du propriétaire.
   * Fournit : Solde disponible, solde retirable (Wave / Orange Money) et l'historique
   * des 5 dernières transactions de débit/crédit (RecentTransactionsCard).
   */
  const {
    data: wallet,
    error: errorWallet,
    isLoading: isLoadingWallet,
  } = useSWR<WalletData>('wallet-me', () =>
    ownerDashboardApi.wallet.getWallet()
  );

  /**
   * 8. GET /reviews/user/:id
   * Rôle : Récupère les évaluations et commentaires laissés par les locataires.
   * Fournit : Liste des derniers avis reçus avec notes étoiles, commentaires et locataire auteur
   * pour alimenter le carousel (LatestReviewsCarousel).
   */
  const {
    data: reviews,
    error: errorReviews,
    isLoading: isLoadingReviews,
  } = useSWR<OwnerReviewsResponse>(
    user?.id ? ['reviews-user', user.id] : null,
    () => ownerDashboardApi.reviews.getUserReviews(user!.id)
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

    hasError,
  };
}
