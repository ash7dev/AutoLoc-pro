'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { clamp, compactNumber, fcfa, toNumber, type Amount } from './dashboardUtils';

type GroupBy = 'day' | 'week' | 'month';
type TimeRange = '7d' | '30d' | '6m' | '1y';

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
  { id: '7d', label: '7 jours', defaultGroupBy: 'day' },
  { id: '30d', label: '30 jours', defaultGroupBy: 'day' },
  { id: '6m', label: '6 mois', defaultGroupBy: 'month' },
  { id: '1y', label: 'Année', defaultGroupBy: 'month' },
];

/** Nombre de points conservés par plage (coupe côté client les derniers points de la série). */
const RANGE_POINTS: Record<TimeRange, number> = { '7d': 7, '30d': 30, '6m': 6, '1y': 12 };

/* Géométrie du tracé */
const PAD_X = 10;
const PAD_T = 44; // réserve la place de la bulle de valeur au-dessus du graphique
const PAD_B = 4;
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

/* -------------------------------------------------------------------------- */
/* Courbe lissée (interpolation monotone : jamais de creux fantôme sous zéro)  */
/* -------------------------------------------------------------------------- */

interface Pt {
  x: number;
  y: number;
}

function monotonePath(pts: Pt[]): string {
  const n = pts.length;
  if (n < 2) return '';

  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }

  const t: number[] = new Array(n);
  t[0] = m[0];
  t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * m[i];
      t[i + 1] = k * b * m[i];
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${pts[i].x + h},${pts[i].y + t[i] * h} ${pts[i + 1].x - h},${pts[i + 1].y - t[i + 1] * h} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

/** Largeur réelle d'un élément, suivie au redimensionnement (tracé net, sans déformation). */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

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
      (data?.timeSeries ?? []).slice(-RANGE_POINTS[timeRange]).map((p, i) => {
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
    [data, groupBy, timeRange],
  );

  const handleTimeRange = (range: (typeof RANGES)[number]) => {
    setHovered(null);
    onTimeRangeChange?.(range.id);
    onGroupByChange(range.defaultGroupBy);
  };

  const segmented = (
    <div
      role="group"
      aria-label="Sélectionner la période d'évolution des revenus"
      className="inline-flex rounded-full bg-[#0A3D2E]/[0.06] p-1"
    >
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          aria-pressed={timeRange === r.id}
          onClick={() => handleTimeRange(r)}
          className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${timeRange === r.id ? 'bg-[#0A3D2E] text-[#F1DFB6]' : 'text-slate-600 hover:text-[#041912]'
            }`}
        >
          {r.label}
        </button>
      ))}
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
          <Skeleton className="h-72 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Pas encore de revenus"
          text="Vos revenus apparaîtront ici dès votre première réservation payée."
        />
      ) : (
        <ChartBody
          points={points}
          hovered={hovered}
          setHovered={setHovered}
          animateKey={`${timeRange}-${groupBy}`}
        />
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
  animateKey: string;
}> = ({ points, hovered, setHovered, animateKey }) => {
  const gid = useId().replace(/:/g, '');
  const reduceMotion = useReducedMotion();
  const [plotRef, width] = useElementWidth<HTMLDivElement>();

  const n = points.length;
  const height = width < 520 ? 232 : 280;
  const max = niceMax(Math.max(...points.map((p) => p.brut)));

  const activeIndex = Math.min(hovered ?? n - 1, n - 1);
  const active = points[activeIndex];

  const totalNet = points.reduce((sum, p) => sum + p.net, 0);
  const labelStep = Math.ceil(n / 8);

  const xAt = (i: number) => (n === 1 ? width / 2 : PAD_X + (i / (n - 1)) * Math.max(0, width - PAD_X * 2));
  const yAt = (v: number) => PAD_T + (1 - v / max) * (height - PAD_T - PAD_B);
  const yBase = yAt(0);

  const ready = width > 0;
  const netLine = ready ? monotonePath(points.map((p, i) => ({ x: xAt(i), y: yAt(p.net) }))) : '';
  const brutLine = ready ? monotonePath(points.map((p, i) => ({ x: xAt(i), y: yAt(p.brut) }))) : '';
  const closeArea = (line: string) => `${line} L${xAt(n - 1)},${yBase} L${xAt(0)},${yBase} Z`;

  const activeX = ready ? xAt(activeIndex) : 0;
  const bubbleX = clamp(activeX, 64, Math.max(64, width - 64));

  const handlePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (n < 2 || width === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left - PAD_X) / Math.max(1, width - PAD_X * 2);
    setHovered(clamp(Math.round(ratio * (n - 1)), 0, n - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = hovered ?? n - 1;
    if (e.key === 'ArrowLeft') setHovered(Math.max(0, current - 1));
    else if (e.key === 'ArrowRight') setHovered(Math.min(n - 1, current + 1));
    else if (e.key === 'Home') setHovered(0);
    else if (e.key === 'End') setHovered(n - 1);
    else return;
    e.preventDefault();
  };

  const draw = (delay = 0) => ({
    initial: reduceMotion ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });
  const fade = {
    initial: reduceMotion ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.35 },
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div>
          <p className="text-sm text-slate-500">Net sur la période</p>
          <p className="font-display text-3xl tabular-nums text-[#041912]">
            {formatCurrency(totalNet)}
            <span className="ml-1.5 font-sans text-sm text-slate-500">FCFA</span>
          </p>
        </div>
        <ul className="flex items-center gap-5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-[#0A3D2E]" />
            Net propriétaire
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-4 rounded-sm bg-[#F1DFB6]" />
            Commission AutoLoc
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        {/* Axe vertical */}
        <div aria-hidden="true" className="relative w-11 shrink-0" style={{ height }}>
          {ready &&
            GRID_STEPS.map((p) => (
              <span
                key={p}
                style={{ top: yAt((max * p) / 100) }}
                className="absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-slate-500"
              >
                {p === 0 ? '0' : compactNumber.format((max * p) / 100)}
              </span>
            ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            ref={plotRef}
            role="group"
            tabIndex={0}
            aria-label="Courbe des revenus. Utilisez les flèches gauche et droite pour parcourir les périodes."
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setHovered(null)}
            onKeyDown={handleKeyDown}
            className="relative touch-pan-y select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E]/40"
            style={{ height }}
          >
            {ready && (
              <>
                <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden="true">
                  <defs>
                    <linearGradient id={`${gid}-brut`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E3CC94" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#F1DFB6" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id={`${gid}-net`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A3D2E" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0A3D2E" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Lignes de repère */}
                  {GRID_STEPS.map((p) => (
                    <line
                      key={p}
                      x1={0}
                      x2={width}
                      y1={yAt((max * p) / 100)}
                      y2={yAt((max * p) / 100)}
                      stroke="#0A3D2E"
                      strokeOpacity={p === 0 ? 0.2 : 0.1}
                      strokeDasharray={p === 0 ? undefined : '3 5'}
                    />
                  ))}

                  {n > 1 && (
                    <>
                      {/* Brut : la bande entre les deux courbes = commission */}
                      <motion.path key={`brut-area-${animateKey}`} d={closeArea(brutLine)} fill={`url(#${gid}-brut)`} {...fade} />
                      <motion.path
                        key={`brut-line-${animateKey}`}
                        d={brutLine}
                        fill="none"
                        stroke="#D9BE85"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        {...draw()}
                      />
                      {/* Net */}
                      <motion.path key={`net-area-${animateKey}`} d={closeArea(netLine)} fill={`url(#${gid}-net)`} {...fade} />
                      <motion.path
                        key={`net-line-${animateKey}`}
                        d={netLine}
                        fill="none"
                        stroke="#0A3D2E"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        {...draw(0.1)}
                      />
                    </>
                  )}

                  {/* Repère de la période active */}
                  <line x1={activeX} x2={activeX} y1={PAD_T - 8} y2={yBase} stroke="#0A3D2E" strokeOpacity={0.25} />
                  {active.brut > active.net && (
                    <circle cx={activeX} cy={yAt(active.brut)} r={4} fill="#E3CC94" stroke="#fff" strokeWidth={2} />
                  )}
                  <circle cx={activeX} cy={yAt(active.net)} r={5.5} fill="#0A3D2E" stroke="#fff" strokeWidth={3} />
                </svg>

                {/* Bulle de valeur */}
                <div
                  aria-hidden="true"
                  style={{ left: bubbleX, top: 0 }}
                  className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0A3D2E] px-3.5 py-1.5 text-xs font-semibold tabular-nums text-[#F1DFB6]"
                >
                  {fcfa(active.net)}
                </div>
              </>
            )}
          </div>

          {/* Libellés */}
          <div aria-hidden="true" className="relative mt-2.5 h-4">
            {ready &&
              points.map((p, i) =>
                i % labelStep === 0 ? (
                  <span
                    key={`${p.label}-${i}`}
                    style={{ left: xAt(i) }}
                    className={`absolute -translate-x-1/2 whitespace-nowrap text-[11px] ${i === activeIndex ? 'font-semibold text-[#041912]' : 'text-slate-500'
                      }`}
                  >
                    {p.label}
                  </span>
                ) : null,
              )}
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