'use client';

import React, { useState } from 'react';
import { useGrowthAnalytics } from '@/src/features/analytics/hooks/useGrowthAnalytics';
import { GrowthKpiCard } from '@/src/features/analytics/components/GrowthKpiCard';
import { MetaCapiHealthWidget } from '@/src/features/analytics/components/MetaCapiHealthWidget';
import { AttributionFunnelWidget } from '@/src/features/analytics/components/AttributionFunnelWidget';
import { UnmetDemandHeatmap } from '@/src/features/analytics/components/UnmetDemandHeatmap';
import { CampaignPerformanceTable } from '@/src/features/analytics/components/CampaignPerformanceTable';
import { CapiTelemetryLog } from '@/src/features/analytics/components/CapiTelemetryLog';

export default function GrowthPage() {
  const [period, setPeriod] = useState<string>('30d');
  const { summary, attribution, isLoading, isError, refresh } = useGrowthAnalytics(period);

  const periods = [
    { label: '7 jours', value: '7d' },
    { label: '30 jours', value: '30d' },
    { label: '90 jours', value: '90d' },
    { label: 'Depuis janvier', value: 'ytd' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0A3D2E] border-t-transparent" />
          <span className="font-sans text-[13px] text-[#0A3D2E]/50">
            Chargement des métriques Growth
          </span>
        </div>
      </div>
    );
  }

  if (isError || !summary || !attribution) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-6">
        <div className="max-w-md rounded-[20px] border border-[#9C4A32]/20 bg-white p-6 text-center">
          <p className="mb-3 font-sans text-[13px] font-medium text-[#9C4A32]">
            Impossible de charger les données analytics.
          </p>
          <button
            onClick={refresh}
            className="rounded-full bg-[#0A3D2E] px-4 py-2 font-sans text-[13px] font-medium text-[#F1DFB6] transition-colors hover:bg-[#041912]"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { overview, conversionFunnel, unmetDemand, cohorts } = summary;
  const { metaCapiStatus, sources } = attribution;

  return (
    <div className="min-h-screen space-y-6 bg-[#FAF9F6] p-6 lg:p-10">
      <div className="flex flex-col justify-between gap-4 border-b border-[#0A3D2E]/10 pb-6 lg:flex-row lg:items-center">
        <div>
          <span className="font-sans text-[11px] font-medium text-[#0A3D2E]/45">
            Growth &amp; attribution
          </span>
          <h1 className="mt-0.5 font-fraunces font-normal tracking-tight text-[#041912] text-2xl lg:text-3xl">
            Tableau de bord Growth
          </h1>
          <p className="mt-1 font-sans text-[12.5px] text-[#0A3D2E]/50">
            Analytique en temps réel — PostgreSQL et Meta Conversions API
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-[#0A3D2E]/10 bg-white p-1 font-sans text-[12.5px] font-medium">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-full px-3.5 py-1.5 transition-colors ${period === p.value
                    ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                    : 'text-[#0A3D2E]/50 hover:text-[#0A3D2E]'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={refresh}
            title="Rafraîchir les données"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0A3D2E]/10 bg-white text-[#0A3D2E]/60 transition-colors hover:text-[#0A3D2E]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.9 2.5M19.5 9A8 8 0 0 0 4.6 6.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <MetaCapiHealthWidget
        pixelId={metaCapiStatus.pixelId}
        isCapiConfigured={metaCapiStatus.capiConfigured}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GrowthKpiCard
          title="GMV brut"
          value={`${overview.financials.gmv.toLocaleString('fr-FR')} FCFA`}
          trendPercentage={overview.financials.gmvDelta}
          subtext={`${overview.financials.bookingsCount} réservations confirmées`}
          accentColor="forest"
        />

        <GrowthKpiCard
          title="Revenu net commission"
          value={`${overview.financials.netRevenue.toLocaleString('fr-FR')} FCFA`}
          trendPercentage={overview.financials.netRevenueDelta}
          subtext={`Taux de commission : ${overview.financials.takeRate}%`}
          accentColor="forest"
        />

        <GrowthKpiCard
          title="Panier moyen"
          value={`${overview.financials.aov.toLocaleString('fr-FR')} FCFA`}
          subtext="Valeur moyenne par réservation"
          accentColor="champagne"
        />

        <GrowthKpiCard
          title="Taux de répétition"
          value={`${cohorts.repeatRate}%`}
          subtext={`${cohorts.repeatRentersCount} locataires fidèles (≥ 2 réservations)`}
          accentColor="gold"
        />
      </div>

      <AttributionFunnelWidget
        steps={conversionFunnel.steps}
        overallConversion={conversionFunnel.overallConversion}
      />

      <UnmetDemandHeatmap
        totalFailedSearches={unmetDemand.totalFailedSearches}
        topFailedCities={unmetDemand.topFailedCities}
        topFailedTypes={unmetDemand.topFailedTypes}
      />

      <CampaignPerformanceTable sources={sources} />

      <CapiTelemetryLog
        pixelId={metaCapiStatus.pixelId}
        isCapiConfigured={metaCapiStatus.capiConfigured}
      />
    </div>
  );
}