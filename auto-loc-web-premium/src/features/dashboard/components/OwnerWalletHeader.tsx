'use client';

import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';

export interface OwnerWalletHeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  lastRefreshedAt?: Date | null;
}

export const OwnerWalletHeader: React.FC<OwnerWalletHeaderProps> = ({
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  lastRefreshedAt,
}) => {
  const formattedRefreshedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-2">
      <div className="min-w-0 space-y-2">
        <h1 className="font-fraunces text-3xl font-normal leading-[1.1] tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
          Mon <span className="text-emerald-600">Portefeuille</span>
        </h1>
        <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
          Consultez votre solde disponible, suivez l'historique de vos revenus et gérez vos demandes de virement.
        </p>
      </div>

      {onRefresh && (
        <div className="w-full shrink-0 sm:w-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="h-4 w-4 text-emerald-600" />
            <span>
              {isRefreshing
                ? 'Mise à jour...'
                : formattedRefreshedTime
                ? `Synchro ${formattedRefreshedTime}`
                : 'Actualiser'}
            </span>
            {isRefreshing && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
