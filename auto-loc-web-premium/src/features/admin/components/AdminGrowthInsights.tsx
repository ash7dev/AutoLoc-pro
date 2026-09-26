'use client';

import React from 'react';
import { Compass, Repeat, ShieldCheck, AlertCircle } from 'lucide-react';
import type {
  AdminUnmetDemandData,
  AdminCohortsData,
  AdminFinancialEscrowData,
} from '../../../core/api/adminAnalyticsApi';
import { formatXOF } from './AdminExecutiveMetrics';

interface AdminGrowthInsightsProps {
  unmetDemand?: AdminUnmetDemandData;
  cohorts?: AdminCohortsData;
  escrow?: AdminFinancialEscrowData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';
const SLATE = '#4a5f75';

export const AdminGrowthInsights: React.FC<AdminGrowthInsightsProps> = ({
  unmetDemand,
  cohorts,
  escrow,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse" style={fontStyle}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={fontStyle}>
      {/* 1. Unmet Demand & Search Losses */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(178, 124, 45, 0.1)' }}>
                <Compass className="w-4.5 h-4.5" style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="text-base font-normal text-brand-dark dark:text-white">Demande non satisfaite</h3>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  Recherches à 0 résultat (manque d'offre)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Recherches sans réponse :</span>
              <span className="text-xl font-normal tabular-nums" style={{ color: GOLD }}>
                {unmetDemand?.totalFailedSearches || 0} recherches
              </span>
            </div>

            {unmetDemand?.topFailedCities && unmetDemand.topFailedCities.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium block">
                  Top villes sous-équipées
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {unmetDemand.topFailedCities.map((c) => (
                    <span
                      key={c.ville}
                      className="px-2.5 py-1 rounded-lg text-xs border"
                      style={{ backgroundColor: 'rgba(178, 124, 45, 0.08)', color: '#8a5a1f', borderColor: 'rgba(178, 124, 45, 0.2)' }}
                    >
                      {c.ville} ({c.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
          <span>Opportunité de recrutement d'hôtes ciblée.</span>
        </div>
      </div>

      {/* 2. Rétention & Cohortes Locataires */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
                <Repeat className="w-4.5 h-4.5" style={{ color: FOREST }} />
              </div>
              <div>
                <h3 className="text-base font-normal text-brand-dark dark:text-white">Rétention & LTV</h3>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  Taux de réservation récurrente locataires
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Taux de répétition :</span>
              <span className="text-2xl font-normal tabular-nums" style={{ color: FOREST }}>
                {cohorts?.repeatRate || 0}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${cohorts?.repeatRate || 0}%`, backgroundColor: FOREST }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Locataires uniques</span>
                <span className="font-normal text-slate-900 dark:text-white text-sm tabular-nums">
                  {cohorts?.totalUniqueRenters || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Locataires fidèles</span>
                <span className="font-normal text-slate-900 dark:text-white text-sm tabular-nums">
                  {cohorts?.repeatRentersCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          Clientèle captive effectuant plusieurs réservations.
        </div>
      </div>

      {/* 3. Escrow & Trésorerie Marchande */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
                <ShieldCheck className="w-4.5 h-4.5" style={{ color: FOREST }} />
              </div>
              <div>
                <h3 className="text-base font-normal text-brand-dark dark:text-white">Séquestre & escrow float</h3>
                <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  Fonds immobilisés sur les comptes Wave/OM
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total sous séquestre :</span>
              <span className="font-normal text-base tabular-nums" style={{ color: FOREST }}>
                {formatXOF(escrow?.totalEscrowVolume || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Commission sécurisée :</span>
              <span className="font-medium tabular-nums" style={{ color: GOLD }}>
                {formatXOF(escrow?.securedCommissionInEscrow || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Payouts hôtes en attente :</span>
              <span className="font-medium tabular-nums" style={{ color: SLATE }}>
                {formatXOF(escrow?.pendingHostPayoutInEscrow || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          {escrow?.activeEscrowBookingsCount || 0} réservations actuellement en cours d'exécution.
        </div>
      </div>
    </div>
  );
};