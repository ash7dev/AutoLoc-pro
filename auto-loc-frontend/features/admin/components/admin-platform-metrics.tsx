import React from 'react';
import { Users, Car, DollarSign, Star } from 'lucide-react';

export interface PlatformMetric {
  label: string;
  value: string | number;
  change: string;
  changePositive?: boolean;
}

interface AdminPlatformMetricsProps {
  metrics?: PlatformMetric[];
}

const DEFAULT_METRICS: PlatformMetric[] = [
  { label: 'Utilisateurs actifs', value: '—', change: '—', changePositive: true },
  { label: 'Locations ce mois',   value: '—', change: '—', changePositive: true },
  { label: 'Revenu plateforme',   value: '—', change: '—', changePositive: true },
  { label: 'Taux satisfaction',   value: '—', change: '—', changePositive: true },
];

const METRIC_CONFIG = [
  { Icon: Users,       accent: 'bg-blue-500/10 text-blue-400',    glow: 'group-hover:shadow-blue-500/10'    },
  { Icon: Car,         accent: 'bg-emerald-500/10 text-emerald-400', glow: 'group-hover:shadow-emerald-500/10' },
  { Icon: DollarSign,  accent: 'bg-violet-500/10 text-violet-400', glow: 'group-hover:shadow-violet-500/10'  },
  { Icon: Star,        accent: 'bg-amber-500/10 text-amber-400',   glow: 'group-hover:shadow-amber-500/10'   },
];

export function AdminPlatformMetrics({ metrics = DEFAULT_METRICS }: AdminPlatformMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {metrics.map((metric, i) => {
        const cfg = METRIC_CONFIG[i] ?? METRIC_CONFIG[0];
        const { Icon } = cfg;
        const isLoaded = metric.value !== '—';

        return (
          <div
            key={metric.label}
            className={`group relative rounded-2xl bg-black border border-white/8 p-5 overflow-hidden
              transition-all duration-300 hover:border-white/15 hover:shadow-2xl ${cfg.glow}`}
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative flex items-start justify-between mb-4">
              <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${cfg.accent} flex-shrink-0`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              {metric.change !== '—' && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  ↑ {metric.change}
                </span>
              )}
            </div>

            {isLoaded ? (
              <p className="text-[26px] font-black text-white leading-none tracking-tight tabular-nums">
                {metric.value}
              </p>
            ) : (
              <div className="h-7 w-20 rounded-lg bg-white/5 animate-pulse mb-0.5" />
            )}

            <p className="mt-1.5 text-[11px] font-semibold text-white/35 uppercase tracking-widest leading-tight">
              {metric.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
