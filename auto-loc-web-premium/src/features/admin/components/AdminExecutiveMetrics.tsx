'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Car, Users } from 'lucide-react';
import type { AdminOverviewData } from '../../../core/api/adminAnalyticsApi';
import { clsx } from 'clsx';

interface AdminExecutiveMetricsProps {
  data?: AdminOverviewData;
  isLoading?: boolean;
}

export function formatXOF(amount: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount) + ' XOF'
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return null;
  const isPositive = value >= 0;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-fraunces font-bold',
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
      )}
    >
      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {isPositive ? `+${value}%` : `${value}%`}
    </span>
  );
}

export const AdminExecutiveMetrics: React.FC<AdminExecutiveMetricsProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-36 rounded-[28px] bg-slate-100 dark:bg-slate-900/60 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const { financials, fleet, community } = data;

  return (
    <div className="space-y-4 font-fraunces">
      {/* Hero — GMV is the main number */}
      <div className="relative overflow-hidden rounded-[28px] bg-brand-main px-6 py-6 sm:px-8 sm:py-7 border border-champagne/20 shadow-md">
        <div
          className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #F1DFB6 0%, transparent 70%)' }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span
              className="text-sm font-fraunces text-champagne/80 font-medium"
            >
              Volume d'Affaires Global (GMV)
            </span>
            <div
              className="mt-1.5 text-4xl sm:text-5xl lg:text-6xl font-fraunces font-normal tracking-tight text-champagne"
            >
              {formatXOF(financials.gmv)}
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            {financials.gmvDelta !== null && (
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-sm font-fraunces font-bold',
                  financials.gmvDelta >= 0 ? 'text-champagne' : 'text-rose-300'
                )}
              >
                {financials.gmvDelta >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-300" />
                )}
                {financials.gmvDelta >= 0 ? `+${financials.gmvDelta}%` : `${financials.gmvDelta}%`}
              </span>
            )}
            <span
              className="text-sm font-fraunces text-champagne/70"
            >
              {financials.bookingsCount} réservations · {formatXOF(financials.aov)} en moyenne par contrat
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenu Net */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-fraunces text-brand-dark dark:text-slate-300 font-semibold"
            >
              Revenu Net AutoLoc
            </span>
            <Wallet className="w-5 h-5 text-brand-main dark:text-champagne" />
          </div>
          <div
            className="mt-2 text-2xl font-fraunces font-normal text-brand-dark dark:text-white"
          >
            {formatXOF(financials.netRevenue)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span
              className="text-xs font-fraunces text-slate-500 dark:text-slate-400"
            >
              Take rate moyen : {financials.takeRate}%
            </span>
            <Delta value={financials.netRevenueDelta} />
          </div>
        </div>

        {/* Occupation Flotte */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-fraunces text-brand-dark dark:text-slate-300 font-semibold"
            >
              Taux d'Occupation Flotte
            </span>
            <Car className="w-5 h-5 text-brand-main dark:text-champagne" />
          </div>
          <div
            className="mt-2 text-2xl font-fraunces font-normal text-brand-dark dark:text-white"
          >
            {fleet.fleetUtilizationRate}%
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span
              className="text-xs font-fraunces text-slate-500 dark:text-slate-400"
            >
              {fleet.activeVehiclesCount} sur {fleet.totalVehiclesCount} véhicules vérifiés actifs
            </span>
          </div>
        </div>

        {/* Communauté Active */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-fraunces text-brand-dark dark:text-slate-300 font-semibold"
            >
              Communauté Active
            </span>
            <Users className="w-5 h-5 text-brand-main dark:text-champagne" />
          </div>
          <div
            className="mt-2 text-2xl font-fraunces font-normal text-brand-dark dark:text-white"
          >
            {community.uniqueActiveMembersCount ?? (community.activeRentersCount + community.activeOwnersCount)} membre{(community.uniqueActiveMembersCount ?? (community.activeRentersCount + community.activeOwnersCount)) > 1 ? 's' : ''}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span
              className="text-xs font-fraunces text-slate-500 dark:text-slate-400"
            >
              {community.activeRentersCount} locataire{community.activeRentersCount > 1 ? 's' : ''} · {community.activeOwnersCount} hôte{community.activeOwnersCount > 1 ? 's' : ''} sur la période
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};