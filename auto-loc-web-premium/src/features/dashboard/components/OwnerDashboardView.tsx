'use client';

import React, { useState } from 'react';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard';

import { OwnerDashboardGreeting } from './OwnerDashboardGreeting';
import { QuickActionsBar } from './QuickActionsBar';
import { FinancialHeroCard } from './FinancialHeroCard';
import { KpiTile } from './KpiTile';
import { RevenueChart } from './RevenueChart';
import { FleetPerformanceTable } from './FleetPerformanceTable';
import { OccupancyDonutCard } from './OccupancyDonutCard';
import { RecentTransactionsCard } from './RecentTransactionsCard';
import { InsightsPanel } from './InsightsPanel';
import { LatestReviewsCarousel } from './LatestReviewsCarousel';

import { Calendar, CheckCircle2, Star, Percent } from 'lucide-react';

export const OwnerDashboardView: React.FC = () => {
  const [revenueGroupBy, setRevenueGroupBy] = useState<'day' | 'week' | 'month'>('month');
  const [revenueTimeRange, setRevenueTimeRange] = useState<'30d' | '6m' | '1y'>('6m');

  const {
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
    isLoadingWallet,
    isLoadingReviews,
  } = useOwnerDashboard({ revenueGroupBy, revenueTimeRange });

  const financials = overview?.financials;
  const operational = overview?.operational;
  const fleetOverview = overview?.fleet;

  const soldeDisponibleNum = parseFloat(wallet?.balance?.soldeDisponible || '0') || 0;

  return (
    <div className="space-y-10">
      {/* 1. Salutation / Greeting Header */}
      <OwnerDashboardGreeting
        prenom={user?.prenom}
        checkinsCount={operational?.checkinsAujourdhuiCount}
        checkoutsCount={operational?.checkoutsAujourdhuiCount}
        demandesCount={operational?.demandesEnAttenteCount}
      />

      {/* 2. Actions Rapides */}
      <QuickActionsBar
        demandesEnAttenteCount={operational?.demandesEnAttenteCount || notifications?.pendingConfirmations}
        soldeRetirableWallet={financials?.soldeRetirableWallet || parseFloat(wallet?.balance?.soldeRetirable || '0')}
      />

      {/* SECTION 1: PILOTAGE FINANCIER & PERFORMANCE GLOBALE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Synthèse Financière & Indicateurs
            </h2>
            <p className="text-xs text-slate-500">Aperçu du mois en cours et métriques clés</p>
          </div>
          <span className="rounded-full bg-[#0A3D2E]/5 px-3 py-1 text-xs font-semibold text-[#0A3D2E]">
            Mois en cours
          </span>
        </div>

        {/* Financial Hero Card */}
        <FinancialHeroCard
          netProprietaireMois={financials?.netProprietaireMois ?? 0}
          caBrutMois={financials?.caBrutMois ?? 0}
          commissionAutoLocMois={financials?.commissionAutoLocMois ?? 0}
          revenusEncaissesMois={financials?.revenusEncaissesMois ?? 0}
          revenusEnAttente={financials?.revenusEnAttente ?? 0}
          soldeDisponibleWallet={financials?.soldeDisponibleWallet ?? soldeDisponibleNum}
          variationMoisPourcentage={financials?.variationMoisPourcentage ?? 0}
          sparklineData={revenue?.timeSeries?.map((t) => t.netProprietaire)}
          isLoading={isLoadingOverview}
        />

        {/* 4 KPI Tiles Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            title="Taux d'occupation"
            value={`${Math.round(fleetOverview?.tauxOccupationReelMois ?? occupancy?.tauxOccupationCommercialPourcentage ?? 0)}%`}
            subtitle="Taux moyen sur 30 jours"
            icon={Percent}
            progressGauge={{
              percentage: fleetOverview?.tauxOccupationReelMois ?? occupancy?.tauxOccupationCommercialPourcentage ?? 0,
              colorClass: 'stroke-emerald-500',
            }}
            delayIndex={0}
          />

          <KpiTile
            title="Réservations Actives"
            value={operational?.reservationsActives ?? 0}
            subtitle={`${fleetOverview?.vehiculesLouesAujourdhuiCount ?? 0} / ${fleetOverview?.totalVehiculesCount ?? 0} véhicules loués`}
            icon={Calendar}
            badge={
              operational?.demandesEnAttenteCount
                ? { text: `${operational.demandesEnAttenteCount} en attente`, variant: 'amber' }
                : undefined
            }
            delayIndex={1}
          />

          <KpiTile
            title="Mouvements Jour"
            value={`${operational?.checkinsAujourdhuiCount ?? 0} ↓  ${operational?.checkoutsAujourdhuiCount ?? 0} ↑`}
            subtitle={`${operational?.checkinsAujourdhuiCount ?? 0} Check-ins / ${operational?.checkoutsAujourdhuiCount ?? 0} Check-outs`}
            icon={CheckCircle2}
            badge={
              operational?.litigesOuvertsCount
                ? { text: `${operational.litigesOuvertsCount} litige(s)`, variant: 'slate' }
                : undefined
            }
            delayIndex={2}
          />

          <KpiTile
            title="Note Flotte"
            value={fleetOverview?.noteMoyenneFlotte ? `${fleetOverview.noteMoyenneFlotte.toFixed(1)} ★` : '—'}
            subtitle={fleetOverview?.noteMoyenneFlotte ? 'Score moyen de satisfaction' : 'Pas encore d’avis'}
            icon={Star}
            badge={
              (fleetOverview?.noteMoyenneFlotte ?? 0) >= 4.5
                ? { text: 'Excellent', variant: 'emerald' }
                : undefined
            }
            delayIndex={3}
          />
        </div>
      </section>

      {/* SECTION 2: ANALYSE DES REVENUS & PERFORMANCE FLOTTE */}
      <section className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Analyse des Revenus & Flotte
            </h2>
            <p className="text-xs text-slate-500">Évolution temporelle et rentabilité par véhicule</p>
          </div>
        </div>

        {/* Revenue Evolution Chart */}
        <RevenueChart
          data={revenue}
          groupBy={revenueGroupBy}
          onGroupByChange={setRevenueGroupBy}
          timeRange={revenueTimeRange}
          onTimeRangeChange={setRevenueTimeRange}
          isLoading={isLoadingRevenue}
        />

        {/* Fleet Performance Table (2/3) + Occupancy Donut (1/3) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FleetPerformanceTable vehicles={fleet?.vehicles} isLoading={isLoadingFleet} />
          </div>
          <div className="lg:col-span-1">
            <OccupancyDonutCard data={occupancy} isLoading={isLoadingOccupancy} />
          </div>
        </div>
      </section>

      {/* SECTION 3: PORTEFEUILLE, CONSEILS IA & AVIS */}
      <section className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Activité Récente & Recommandations
            </h2>
            <p className="text-xs text-slate-500">Mouvements bancaires, conseils IA et retours locataires</p>
          </div>
        </div>

        {/* Recent Transactions (1/2) + IA Insights (1/2) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentTransactionsCard wallet={wallet} isLoading={isLoadingWallet} />
          <InsightsPanel insights={insights?.insights} isLoading={isLoadingInsights} />
        </div>

        {/* Tenant Reviews Carousel */}
        <LatestReviewsCarousel reviews={reviews?.data} isLoading={isLoadingReviews} />
      </section>
    </div>
  );
};
