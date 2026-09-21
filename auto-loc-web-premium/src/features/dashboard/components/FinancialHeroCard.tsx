'use client';

import React, { useId } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { clamp, fcfa } from './dashboardUtils';

interface FinancialHeroCardProps {
  netProprietaireMois: number;
  caBrutMois: number;
  commissionAutoLocMois: number;
  revenusEncaissesMois: number;
  revenusEnAttente: number;
  soldeDisponibleWallet: number;
  variationMoisPourcentage: number;
  sparklineData?: number[];
  isLoading?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const SPARK_W = 400;
const SPARK_H = 120;
const SPARK_PAD = 10;

const variationFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

/** Courbe lissée (Bézier) + aire, en coordonnées du viewBox. */
function buildSparkline(values: number[]) {
  if (values.length < 2 || Math.max(...values) === Math.min(...values)) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * SPARK_W;
    const y = SPARK_H - SPARK_PAD - ((v - min) / range) * (SPARK_H - SPARK_PAD * 2);
    return [x, y] as const;
  });

  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    line += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }

  return {
    line,
    area: `${line} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`,
    lastYPercent: (pts[pts.length - 1][1] / SPARK_H) * 100,
  };
}

const SHELL =
  'relative overflow-hidden rounded-[32px] bg-[#0A3D2E] p-6 text-[#F1DFB6] ring-1 ring-inset ring-[#F1DFB6]/10 sm:p-9';

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

export const FinancialHeroCard: React.FC<FinancialHeroCardProps> = ({
  netProprietaireMois,
  caBrutMois,
  commissionAutoLocMois,
  revenusEncaissesMois,
  revenusEnAttente,
  soldeDisponibleWallet,
  variationMoisPourcentage,
  sparklineData,
  isLoading = false,
}) => {
  const gradientId = useId().replace(/:/g, '');

  if (isLoading) {
    return (
      <section aria-busy="true" aria-label="Synthèse financière du mois" className={SHELL}>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-44 animate-pulse rounded bg-[#F1DFB6]/15" />
            <div className="h-14 w-72 max-w-full animate-pulse rounded bg-[#F1DFB6]/15" />
            <div className="h-7 w-40 animate-pulse rounded-full bg-[#F1DFB6]/10" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-[#F1DFB6]/10" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#F1DFB6]/[0.07]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const spark = buildSparkline(sparklineData ?? []);
  const netShare = caBrutMois > 0 ? clamp((netProprietaireMois / caBrutMois) * 100, 0, 100) : 0;

  const up = variationMoisPourcentage > 0;
  const down = variationMoisPourcentage < 0;
  const VariationIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const variationClass = up
    ? 'bg-[#F1DFB6] text-[#041912]'
    : down
      ? 'bg-rose-300/15 text-rose-200'
      : 'bg-[#F1DFB6]/10 text-[#F1DFB6]/80';

  const stats = [
    { label: 'Encaissés ce mois', note: 'Validés au check-in', value: revenusEncaissesMois },
    { label: 'En attente', note: 'Sécurisés jusqu’au check-in', value: revenusEnAttente },
    { label: 'Solde du portefeuille', note: 'Disponible sur votre wallet', value: soldeDisponibleWallet },
  ];

  return (
    <section aria-label="Synthèse financière du mois" className={SHELL}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
        {/* Net du mois */}
        <div className="space-y-5">
          <p className="text-sm text-[#F1DFB6]/75">Net propriétaire du mois</p>
          <p className="font-display text-5xl leading-none tracking-tight tabular-nums sm:text-6xl">
            {formatCurrency(netProprietaireMois)}
            <span className="ml-2 font-sans text-base text-[#F1DFB6]/60 sm:text-lg">FCFA</span>
          </p>
          <p
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${variationClass}`}
          >
            <VariationIcon className="h-4 w-4" aria-hidden="true" />
            {variationMoisPourcentage === 0
              ? 'Stable par rapport au mois dernier'
              : `${variationFormat.format(variationMoisPourcentage)}\u00a0% vs mois dernier`}
          </p>
        </div>

        {/* Courbe d'évolution */}
        <div>
          {spark ? (
            <div className="relative h-28 pr-1.5 sm:h-32">
              <svg
                viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
                role="img"
                aria-label="Évolution du net propriétaire sur la période"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F1DFB6" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#F1DFB6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={spark.area} fill={`url(#${gradientId})`} />
                <path
                  d={spark.line}
                  fill="none"
                  stroke="#F1DFB6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span
                aria-hidden="true"
                style={{ top: `${spark.lastYPercent}%` }}
                className="absolute right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#F1DFB6] ring-4 ring-[#F1DFB6]/20"
              />
            </div>
          ) : (
            <p className="max-w-xs text-sm leading-relaxed text-[#F1DFB6]/60">
              La courbe d’évolution apparaîtra dès que vous aurez quelques réservations.
            </p>
          )}
        </div>
      </div>

      {/* Décomposition du chiffre d'affaires */}
      <div className="mt-9 space-y-3">
        <div aria-hidden="true" className="flex h-2 gap-1">
          <span className="rounded-full bg-[#F1DFB6]" style={{ width: `${netShare}%` }} />
          <span className="flex-1 rounded-full bg-[#F1DFB6]/20" />
        </div>
        <dl className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="flex items-center gap-2 text-[#F1DFB6]/75">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#F1DFB6]" />
              Chiffre d’affaires brut
            </dt>
            <dd className="font-medium tabular-nums">{fcfa(caBrutMois)}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="flex items-center gap-2 text-[#F1DFB6]/75">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#F1DFB6]/25" />
              Commission AutoLoc
            </dt>
            <dd className="font-medium tabular-nums">{fcfa(commissionAutoLocMois)}</dd>
          </div>
        </dl>
      </div>

      {/* Soldes */}
      <dl className="mt-8 grid grid-cols-1 divide-y divide-[#F1DFB6]/15 border-t border-[#F1DFB6]/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.label} className="space-y-1 py-4 sm:px-6 sm:first:pl-0 sm:last:pr-0">
            <dt className="text-sm text-[#F1DFB6]/75">{s.label}</dt>
            <dd className="font-display text-2xl tabular-nums">{fcfa(s.value)}</dd>
            <p className="text-xs text-[#F1DFB6]/55">{s.note}</p>
          </div>
        ))}
      </dl>
    </section>
  );
};