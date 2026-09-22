'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { clamp } from './dashboardUtils';

type BadgeVariant = 'amber' | 'slate' | 'emerald';

interface KpiTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  progressGauge?: {
    percentage: number;
    /** @deprecated conservé pour compatibilité : la couleur suit désormais la charte. */
    colorClass?: string;
  };
  badge?: { text: string; variant?: BadgeVariant };
  /** Rang d'apparition (0, 1, 2…) : décale l'entrée de chaque tuile. */
  delayIndex?: number;
}

const BADGE_CLASS: Record<BadgeVariant, string> = {
  // amber = attention : champagne appuyé
  amber: 'bg-[#F1DFB6]/60 text-[#5C4410]',
  slate: 'bg-slate-100 text-slate-700',
  // emerald = positif : teinte forêt
  emerald: 'bg-[#0A3D2E]/[0.08] text-[#0A3D2E]',
};

const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;

export const KpiTile: React.FC<KpiTileProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  progressGauge,
  badge,
  delayIndex = 0,
}) => {
  const reduceMotion = useReducedMotion();
  const dash = progressGauge ? (clamp(progressGauge.percentage, 0, 100) / 100) * RING_C : 0;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delayIndex * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[8.5rem] flex-col justify-between gap-3 rounded-2xl border border-[#0A3D2E]/10 bg-white p-3.5 sm:rounded-3xl sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F1DFB6]/40 text-[#0A3D2E] sm:h-9 sm:w-9 sm:rounded-xl">
            <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h3 className="truncate text-xs font-medium text-slate-600 sm:text-sm">{title}</h3>
        </div>
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:text-xs ${BADGE_CLASS[badge.variant ?? 'slate']}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2 sm:gap-4">
        <div className="min-w-0 space-y-1 sm:space-y-1.5">
          <p className="font-display text-2xl leading-none tracking-tight tabular-nums text-[#041912] sm:text-4xl">
            {value}
          </p>
          {subtitle && <p className="text-[11px] leading-tight text-slate-500 sm:text-sm">{subtitle}</p>}
        </div>

        {progressGauge && (
          <svg viewBox="0 0 60 60" className="h-10 w-10 shrink-0 -rotate-90 sm:h-[60px] sm:w-[60px]" aria-hidden="true">
            <circle cx="30" cy="30" r={RING_R} fill="none" stroke="#0A3D2E" strokeOpacity="0.1" strokeWidth="5" />
            {dash > 0 && (
              <circle
                cx="30"
                cy="30"
                r={RING_R}
                fill="none"
                stroke="#0A3D2E"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${RING_C - dash}`}
              />
            )}
          </svg>
        )}
      </div>
    </motion.article>
  );
};