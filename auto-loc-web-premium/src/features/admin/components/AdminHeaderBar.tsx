'use client';

import React from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface AdminHeaderBarProps {
  period: '7d' | '30d' | '90d' | '12m' | 'ytd';
  onPeriodChange: (period: '7d' | '30d' | '90d' | '12m' | 'ytd') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastRefreshedAt: Date | null;
}

const PERIOD_OPTIONS: Array<{ value: '7d' | '30d' | '90d' | '12m' | 'ytd'; label: string }> = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: '12m', label: '12 mois' },
  { value: 'ytd', label: 'YTD' },
];

export const AdminHeaderBar: React.FC<AdminHeaderBarProps> = ({
  period,
  onPeriodChange,
  isRefreshing,
  onRefresh,
  lastRefreshedAt,
}) => {
  const formattedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-900/10 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 border border-emerald-300 text-[#041912]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-fraunces" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              Serveur AutoLoc en Direct
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-fraunces" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
              Console Administrateur
            </span>
          </span>
        </div>

        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-fraunces font-normal tracking-tight text-[#041912] dark:text-white mt-2"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          Tour de Contrôle AutoLoc
        </h1>

        <p
          className="text-sm font-fraunces text-slate-600 dark:text-slate-400 mt-1"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          Pilotage financier, gouvernance des opérations et analytics de la marketplace en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
        {/* Period Selector Pills */}
        <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange(opt.value)}
              className={clsx(
                'px-3.5 py-1.5 text-xs font-fraunces rounded-xl transition-all duration-200',
                period === opt.value
                  ? 'bg-[#0A3D2E] text-[#F1DFB6] font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#041912] dark:hover:text-white font-medium'
              )}
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-xs font-fraunces font-bold text-[#041912] dark:text-[#F1DFB6] bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all shadow-xs active:scale-95 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          <RefreshCw className={clsx('w-3.5 h-3.5 text-emerald-600', isRefreshing && 'animate-spin')} />
          <span className="hidden sm:inline">
            {isRefreshing ? 'Mise à jour...' : formattedTime ? `Màj ${formattedTime}` : 'Rafraîchir'}
          </span>
        </button>
      </div>
    </div>
  );
};
