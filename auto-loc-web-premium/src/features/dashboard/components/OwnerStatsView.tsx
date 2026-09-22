'use client';

import React, { useState } from 'react';
import { useOwnerDashboard } from '../hooks/useOwnerDashboard';

import { OwnerStatsHeader } from './OwnerStatsHeader';
import { FinancialHeroCard } from './FinancialHeroCard';
import { KpiTile } from './KpiTile';
import { RevenueChart } from './RevenueChart';
import { FleetPerformanceTable } from './FleetPerformanceTable';
import { OccupancyDonutCard } from './OccupancyDonutCard';
import { InsightsPanel } from './InsightsPanel';
import { LatestReviewsCarousel } from './LatestReviewsCarousel';

import { Calendar, CheckCircle2, Star, Percent } from 'lucide-react';

export const OwnerStatsView: React.FC = () => {
  const [revenueGroupBy, setRevenueGroupBy] = useState<'day' | 'week' | 'month'>('month');
  const [revenueTimeRange, setRevenueTimeRange] = useState<'7d' | '30d' | '6m' | '1y'>('6m');

  const {
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
    isLoadingReviews,
    mutateAll,
  } = useOwnerDashboard({ revenueGroupBy, revenueTimeRange });

  const financials = overview?.financials;
  const operational = overview?.operational;
  const fleetOverview = overview?.fleet;

  const soldeDisponibleNum = parseFloat(wallet?.balance?.soldeDisponible || '0') || 0;

  return (
    <div className="space-y-10">
      {/* 1. Header spécifique Stats & Activités */}
      <OwnerStatsHeader onRefresh={mutateAll} isLoading={isLoadingOverview || isLoadingRevenue} />

      {/* SECTION 1: SYNTHÈSE KPI & INDICATEURS CLÉS */}
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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

      {/* SECTION 2: ÉVOLUTION DES REVENUS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Évolution des Revenus
            </h2>
            <p className="text-xs text-slate-500">Ce que rapportent vos véhicules, période après période</p>
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
      </section>

      {/* SECTION 3: PERFORMANCE ET OCCUPATION DE LA FLOTTE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Performance & Occupation
            </h2>
            <p className="text-xs text-slate-500">Classement de vos véhicules et ventilation de disponibilité</p>
          </div>
        </div>

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

      {/* SECTION 4: RECOMMANDATIONS ET AVIS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#0A3D2E]/10 pb-3">
          <div>
            <h2 className="font-display text-xl font-medium tracking-tight text-[#041912]">
              Recommandations & Retours Locataires
            </h2>
            <p className="text-xs text-slate-500">Conseils d'optimisation et avis des utilisateurs</p>
          </div>
        </div>

        {/* Recommandations Insights Panel */}
        <div className="grid grid-cols-1 gap-6">
          <InsightsPanel insights={insights?.insights} isLoading={isLoadingInsights} />
        </div>

        {/* Tenant Reviews Carousel */}
        <LatestReviewsCarousel reviews={reviews?.data} isLoading={isLoadingReviews} />
      </section>
    </div>
  );
};
