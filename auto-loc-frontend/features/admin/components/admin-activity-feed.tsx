'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye, Activity, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminActivityItem } from '@/lib/nestjs/admin';

type ActivityStatus = AdminActivityItem['status'];

const STATUS_CONFIG: Record<ActivityStatus, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  dot: string;
  label: string;
}> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-400/20', dot: 'bg-emerald-400', label: 'Succès'       },
  warning: { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50',    border: 'border-amber-400/20',   dot: 'bg-amber-400',   label: 'En attente'   },
  error:   { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50',      border: 'border-red-400/20',     dot: 'bg-red-400',     label: 'Erreur'       },
  info:    { icon: Eye,          color: 'text-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-400/20',    dot: 'bg-blue-400',    label: 'Info'         },
};

const FILTER_TABS: { value: ActivityStatus | 'all'; label: string }[] = [
  { value: 'all',     label: 'Tout'       },
  { value: 'success', label: 'Succès'     },
  { value: 'warning', label: 'En attente' },
  { value: 'error',   label: 'Erreurs'    },
  { value: 'info',    label: 'Info'       },
];

const PAGE_SIZE = 5;

interface AdminActivityFeedProps {
  items?: AdminActivityItem[];
}

export function AdminActivityFeed({ items = [] }: AdminActivityFeedProps) {
  const [filter, setFilter]   = useState<ActivityStatus | 'all'>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);
  const paginated = filtered.slice(0, visible);
  const hasMore   = visible < filtered.length;

  // Compteurs par statut
  const counts = items.reduce<Record<ActivityStatus, number>>(
    (acc, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }),
    {} as Record<ActivityStatus, number>,
  );

  return (
    <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-[15px] font-black tracking-tight text-black">
            Activité récente
          </h2>
          <p className="text-[11.5px] font-medium text-black/35 mt-0.5">
            {items.length} événement{items.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20
          bg-emerald-400/5 px-3 py-1.5 text-[11px] font-bold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          En temps réel
        </span>
      </div>

      {/* ── Filter tabs ── */}
      {items.length > 0 && (
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-100 overflow-x-auto">
          {FILTER_TABS.map(({ value, label }) => {
            const count = value === 'all' ? items.length : (counts[value as ActivityStatus] ?? 0);
            if (value !== 'all' && count === 0) return null;
            const isActive = filter === value;
            const cfg = value !== 'all' ? STATUS_CONFIG[value as ActivityStatus] : null;

            return (
              <button
                key={value}
                type="button"
                onClick={() => { setFilter(value); setVisible(PAGE_SIZE); }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold',
                  'transition-all duration-150 whitespace-nowrap flex-shrink-0',
                  isActive
                    ? 'bg-black text-emerald-400'
                    : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black'
                )}
              >
                {cfg && (
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
                )}
                {label}
                <span className={cn(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center',
                  isActive ? 'bg-white/10 text-emerald-400/80' : 'bg-black/5 text-black/35'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100">
            <Activity className="w-5 h-5 text-slate-400" strokeWidth={1.75} />
          </div>
          <p className="text-[13px] font-semibold text-black/35">
            Aucune activité{filter !== 'all' ? ' pour ce filtre' : ' récente'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {paginated.map((item, idx) => {
            const s = STATUS_CONFIG[item.status];
            const StatusIcon = s.icon;
            const isFirst = idx === 0;

            return (
              <div
                key={item.id}
                className={cn(
                  'group flex items-start gap-3 px-5 py-3.5',
                  'hover:bg-slate-50/80 transition-colors duration-150',
                  // Highlight du premier item (le plus récent)
                  isFirst && filter === 'all' && 'bg-slate-50/40',
                )}
              >
                {/* Icône statut */}
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 mt-0.5 border',
                  s.bg, s.border,
                )}>
                  <StatusIcon className={cn('w-3.5 h-3.5', s.color)} strokeWidth={2} />
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-bold text-black tracking-tight leading-snug">
                      {item.action}
                    </p>
                    <span className="text-[10.5px] font-medium text-black/25 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-black/40 mt-0.5 leading-snug">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-50">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl
              border border-slate-200 bg-white px-4 py-2.5
              text-[12.5px] font-semibold text-black/60
              hover:bg-slate-50 hover:text-black hover:border-slate-300
              transition-all duration-150"
          >
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            Voir {Math.min(PAGE_SIZE, filtered.length - visible)} de plus
          </button>
        </div>
      )}

      {/* ── Footer count ── */}
      {paginated.length > 0 && !hasMore && (
        <div className="px-5 pb-4 pt-2 border-t border-slate-50 text-center">
          <p className="text-[11px] font-medium text-black/20">
            Tout affiché — {filtered.length} élément{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
