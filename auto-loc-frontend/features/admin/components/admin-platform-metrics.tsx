import React from 'react';
import { Users, Car, DollarSign, Activity, TrendingUp } from 'lucide-react';

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

const ICONS = [Users, Car, DollarSign, Activity];

export function AdminPlatformMetrics({ metrics = DEFAULT_METRICS }: AdminPlatformMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {metrics.map((metric, i) => {
        const Icon = ICONS[i] ?? Activity;
        return (
          <div
            key={metric.label}
            className="rounded-2xl bg-black border border-white/10 p-5 group hover:border-emerald-400/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-4 w-4 text-white/30" strokeWidth={1.75} />
              {metric.change !== '—' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {metric.change}
                </span>
              )}
            </div>
            <p className="text-[22px] font-black text-white leading-none tracking-tight tabular-nums">
              {metric.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-white/35 uppercase tracking-widest">
              {metric.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
