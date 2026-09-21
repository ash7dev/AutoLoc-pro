'use client';

import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { compactNumber, fcfa, toNumber, type Amount } from './dashboardUtils';

type GroupBy = 'day' | 'week' | 'month';
type TimeRange = '30d' | '6m' | '1y';

/**
 * Champs attendus de GET /analytics/owner/revenue-breakdown.
 * Seul `netProprietaire` est obligatoire ; le libellé de période est lu dans
 * `periode`, `label` ou `date` (le premier présent).
 */
export interface RevenuePoint {
  netProprietaire: Amount;
  caBrut?: Amount;
  commissionAutoLoc?: Amount;
  joursLoues?: Amount;
  periode?: string;
  label?: string;
  date?: string;
}

export interface RevenueChartData {
  timeSeries?: RevenuePoint[];
}

interface RevenueChartProps {
  data?: RevenueChartData;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  timeRange?: TimeRange;
  onTimeRangeChange?: (timeRange: TimeRange) => void;
  isLoading?: boolean;
}

const RANGES: Array<{ id: TimeRange; label: string; defaultGroupBy: GroupBy }> = [
  { id: '30d', label: '30 jours', defaultGroupBy: 'day' },
  { id: '6m', label: '6 mois', defaultGroupBy: 'month' },
  { id: '1y', label: 'Année', defaultGroupBy: 'month' },
];

const GROUPS: Array<{ id: GroupBy; label: string }> = [
  { id: 'day', label: 'Par jour' },
  { id: 'week', label: 'Par semaine' },
  { id: 'month', label: 'Par mois' },
];

const CHART_H = 'h-56 sm:h-64';
const GRID_STEPS = [0, 25, 50, 75, 100];

const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const dayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

function formatPeriod(raw: string | undefined, groupBy: GroupBy): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}$/.test(raw)) return monthShort.format(new Date(`${raw}-01T00:00:00`));
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw.length === 10 ? `${raw}T00:00:00` : raw);
    if (!Number.isNaN(d.getTime())) return groupBy === 'month' ? monthShort.format(d) : dayMonth.format(d);
  }
  return raw;
}

/** Arrondit le maximum à une valeur « ronde » divisible proprement en quarts. */
function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const norm = max / magnitude;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 4 ? 4 : norm <= 8 ? 8 : 10;
  return niceNorm * magnitude;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  groupBy,
  onGroupByChange,
  timeRange = '6m',
  onTimeRangeChange,
  isLoading = false,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const points = useMemo(
    () =>
      (data?.timeSeries ?? []).map((p, i) => {
        const net = toNumber(p.netProprietaire);
        const brutRaw = toNumber(p.caBrut);
        const brut = brutRaw > 0 ? Math.max(brutRaw, net) : net;
        return {
          label: formatPeriod(p.periode ?? p.label ?? p.date, groupBy) || String(i + 1),
          net,
          brut,
          commission: toNumber(p.commissionAutoLoc) || Math.max(0, brut - net),
          jours: toNumber(p.joursLoues),
        };
      }),
    [data, groupBy],
  );

  const handleGroupBy = (next: GroupBy) => {
    setHovered(null);
    onGroupByChange(next);
  };

  const handleTimeRange = (range: (typeof RANGES)[number]) => {
    setHovered(null);
    if (onTimeRangeChange) {
      onTimeRangeChange(range.id);
    }
    onGroupByChange(range.defaultGroupBy);
  };

  const segmented = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtre de Plage Temporelle (30 jours, 6 mois, Année) */}
      <div
        role="group"
        aria-label="Plage temporelle"
        className="inline-flex rounded-full bg-[#0A3D2E]/[0.06] p-1"
      >
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={timeRange === r.id}
            onClick={() => handleTimeRange(r)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${
              timeRange === r.id
                ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                : 'text-slate-600 hover:text-[#041912]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Regroupement (Par jour, Par semaine, Par mois) */}
      <div
        role="group"
        aria-label="Regrouper les revenus par"
        className="inline-flex rounded-full border border-[#0A3D2E]/10 bg-white p-1 shadow-xs"
      >
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={groupBy === g.id}
            onClick={() => handleGroupBy(g.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${
              groupBy === g.id
                ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                : 'text-slate-600 hover:text-[#041912]'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>
  );

  const isEmpty = points.length === 0 || points.every((p) => p.brut === 0);

  return (
    <DashboardCard
      title="Évolution des revenus"
      description="Ce que rapportent vos véhicules, période après période"
      action={segmented}
    >
      {isLoading ? (
        <div className="space-y-6" aria-busy="true">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Pas encore de revenus"
          text="Vos revenus apparaîtront ici dès votre première réservation payée."
        />
      ) : (
        <ChartBody points={points} hovered={hovered} setHovered={setHovered} />
      )}
    </DashboardCard>
  );
};

/* -------------------------------------------------------------------------- */
/* Corps du graphique                                                         */
/* -------------------------------------------------------------------------- */

interface ChartPoint {
  label: string;
  net: number;
  brut: number;
  commission: number;
  jours: number;
}

const ChartBody: React.FC<{
  points: ChartPoint[];
  hovered: number | null;
  setHovered: (i: number | null) => void;
}> = ({ points, hovered, setHovered }) => {
  const max = niceMax(Math.max(...points.map((p) => p.brut)));
  const activeIndex = Math.min(hovered ?? points.length - 1, points.length - 1);
  const active = points[activeIndex];

  const totalNet = points.reduce((sum, p) => sum + p.net, 0);
  const labelStep = Math.ceil(points.length / 8);

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <p className="text-sm text-slate-500">Net sur la période</p>
          <p className="font-display text-3xl tabular-nums text-[#041912]">
            {formatCurrency(totalNet)}
            <span className="ml-1.5 font-sans text-sm text-slate-500">FCFA</span>
          </p>
        </div>
        <ul className="flex items-center gap-5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#0A3D2E]" />
            Net propriétaire
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#F1DFB6]" />
            Commission AutoLoc
          </li>
        </ul>
      </div>

      <div className="flex gap-3" onMouseLeave={() => setHovered(null)}>
        {/* Axe vertical */}
        <div aria-hidden="true" className={`relative w-11 shrink-0 ${CHART_H}`}>
          {GRID_STEPS.map((p) => (
            <span
              key={p}
              style={{ bottom: `${p}%` }}
              className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-slate-500"
            >
              {p === 0 ? '0' : compactNumber.format((max * p) / 100)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Lignes de repère */}
          <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 ${CHART_H}`}>
            {GRID_STEPS.map((p) => (
              <span
                key={p}
                style={{ bottom: `${p}%` }}
                className={`absolute inset-x-0 border-t ${p === 0 ? 'border-[#0A3D2E]/20' : 'border-dashed border-[#0A3D2E]/10'
                  }`}
              />
            ))}
          </div>

          {/* Barres */}
          <div className={`relative flex items-end gap-1 sm:gap-2 ${CHART_H}`}>
            {points.map((p, i) => {
              const isActive = i === activeIndex;
              const trackPct = Math.max((p.brut / max) * 100, p.brut > 0 ? 1.5 : 0);
              const netPct = p.brut > 0 ? (p.net / p.brut) * 100 : 0;
              return (
                <button
                  key={`${p.label}-${i}`}
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onClick={() => setHovered(i)}
                  aria-label={`${p.label} : net ${fcfa(p.net)}`}
                  className="flex h-full min-w-0 flex-1 items-end rounded-md focus-visible:bg-[#0A3D2E]/[0.04] focus-visible:outline-none"
                >
                  <span
                    style={{ height: `${trackPct}%` }}
                    className={`relative block w-full rounded-t-md transition-colors ${isActive ? 'bg-[#F1DFB6]' : 'bg-[#F1DFB6]/45'
                      }`}
                  >
                    <span
                      style={{ height: `${netPct}%` }}
                      className={`absolute inset-x-0 bottom-0 block rounded-t-md transition-colors ${isActive ? 'bg-[#0A3D2E]' : 'bg-[#0A3D2E]/60'
                        }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Libellés */}
          <div aria-hidden="true" className="mt-2.5 flex gap-1 sm:gap-2">
            {points.map((p, i) => (
              <span
                key={`${p.label}-${i}`}
                className="flex min-w-0 flex-1 justify-center whitespace-nowrap text-[11px] text-slate-500"
              >
                {i % labelStep === 0 ? p.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Détail de la période active */}
      <dl
        aria-live="polite"
        className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-[#0A3D2E]/[0.04] p-4 text-sm sm:grid-cols-4 sm:p-5"
      >
        <div>
          <dt className="text-slate-500">Période</dt>
          <dd className="mt-0.5 font-display text-lg text-[#041912]">{active.label}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Net propriétaire</dt>
          <dd className="mt-0.5 font-display text-lg tabular-nums text-[#041912]">{fcfa(active.net)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Commission AutoLoc</dt>
          <dd className="mt-0.5 font-display text-lg tabular-nums text-[#041912]">{fcfa(active.commission)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Jours loués</dt>
          <dd className="mt-0.5 font-display text-lg tabular-nums text-[#041912]">{active.jours}</dd>
        </div>
      </dl>
    </div>
  );
};