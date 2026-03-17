'use client';

import React, { useState } from 'react';
import {
  Search, Download, CheckCircle2, XCircle, Clock, Eye, Activity,
  ChevronDown, Filter, ArrowUp, ArrowDown, ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminActivityItem } from '@/lib/nestjs/admin';

type StatusFilter = AdminActivityItem['status'] | 'all';
type TypeFilter   = AdminActivityItem['type']   | 'all';
type SortDir      = 'asc' | 'desc';

const STATUS_CONFIG: Record<AdminActivityItem['status'], {
  icon: React.ElementType; color: string; bg: string; border: string; dot: string; label: string;
}> = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50',  border: 'border-emerald-400/20', dot: 'bg-emerald-400', label: 'Succès'     },
  warning: { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50',    border: 'border-amber-400/20',   dot: 'bg-amber-400',   label: 'En attente' },
  error:   { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50',      border: 'border-red-400/20',     dot: 'bg-red-400',     label: 'Erreur'     },
  info:    { icon: Eye,          color: 'text-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-400/20',    dot: 'bg-blue-400',    label: 'Info'       },
};

const TYPE_LABELS: Record<AdminActivityItem['type'], string> = {
  kyc:         'KYC',
  vehicle:     'Véhicule',
  withdrawal:  'Retrait',
  dispute:     'Litige',
  user:        'Utilisateur',
  reservation: 'Réservation',
};

const PAGE_SIZE = 25;

function exportAuditCsv(items: AdminActivityItem[]) {
  const headers = ['Action', 'Détail', 'Catégorie', 'Statut', 'Heure'];
  const rows = items.map((i) => [
    i.action, i.detail, TYPE_LABELS[i.type] ?? i.type, STATUS_CONFIG[i.status].label, i.time,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'journal-audit.csv'; a.click();
  URL.revokeObjectURL(url);
}

interface AdminAuditLogProps {
  items?: AdminActivityItem[];
}

export function AdminAuditLog({ items = [] }: AdminAuditLogProps) {
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>('all');
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>('all');
  const [sortDir,       setSortDir]       = useState<SortDir>('desc');
  const [visible,       setVisible]       = useState(PAGE_SIZE);

  const safeItems = Array.isArray(items) ? items : [];

  const filtered = safeItems.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (typeFilter   !== 'all' && i.type   !== typeFilter)   return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return i.action.toLowerCase().includes(q) || i.detail.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    // items come ordered from backend; use index as proxy if no timestamp
    const ai = safeItems.indexOf(a);
    const bi = safeItems.indexOf(b);
    return sortDir === 'desc' ? ai - bi : bi - ai;
  });

  const paginated = sorted.slice(0, visible);
  const hasMore   = visible < sorted.length;

  // Compteurs par statut
  const statusCounts = safeItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});
  const typeCounts = safeItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: search + sort + export */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25" strokeWidth={2} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
              placeholder="Rechercher une action ou un détail…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
                text-[13px] font-medium text-black placeholder-black/25
                focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20
                transition-all shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-[12.5px] font-semibold transition-all',
              sortDir !== 'desc'
                ? 'border-black bg-black text-emerald-400'
                : 'border-slate-200 text-black/50 hover:bg-slate-50 hover:text-black',
            )}
          >
            {sortDir === 'desc'
              ? <ArrowDown className="w-3.5 h-3.5" strokeWidth={2} />
              : <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
            }
            {sortDir === 'desc' ? 'Récents en premier' : 'Anciens en premier'}
          </button>
          <button
            type="button"
            onClick={() => exportAuditCsv(sorted)}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-[12.5px] font-semibold text-black/50 hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Exporter CSV
          </button>
        </div>

        {/* Row 2: statut filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
            <Filter className="w-3 h-3" strokeWidth={2} /> Statut
          </span>
          {(['all', 'success', 'warning', 'error', 'info'] as const).map((s) => {
            const count = s === 'all' ? safeItems.length : (statusCounts[s] ?? 0);
            if (s !== 'all' && count === 0) return null;
            const cfg = s !== 'all' ? STATUS_CONFIG[s] : null;
            const isActive = statusFilter === s;
            return (
              <button key={s} type="button"
                onClick={() => { setStatusFilter(s); setVisible(PAGE_SIZE); }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
                  isActive ? 'bg-black text-emerald-400' : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black',
                )}
              >
                {cfg && <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />}
                {s === 'all' ? 'Tous' : cfg!.label}
                <span className={cn('text-[10px] font-bold rounded-full px-1.5 py-0.5',
                  isActive ? 'bg-white/10 text-emerald-400/80' : 'bg-black/5 text-black/35'
                )}>{count}</span>
              </button>
            );
          })}

          <span className="w-px h-5 bg-slate-200 mx-1" />

          {/* Type filters */}
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
            Catégorie
          </span>
          {(['all', 'kyc', 'vehicle', 'withdrawal', 'dispute', 'user', 'reservation'] as const).map((t) => {
            const count = t === 'all' ? safeItems.length : (typeCounts[t] ?? 0);
            if (t !== 'all' && count === 0) return null;
            const isActive = typeFilter === t;
            return (
              <button key={t} type="button"
                onClick={() => { setTypeFilter(t); setVisible(PAGE_SIZE); }}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
                  isActive ? 'bg-black text-emerald-400' : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black',
                )}
              >
                {t === 'all' ? 'Tous' : TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] font-medium text-black/35">
          {sorted.length} événement{sorted.length > 1 ? 's' : ''}
          {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
            <span className="ml-1 text-black/20">· filtré{sorted.length > 1 ? 's' : ''}</span>
          )}
        </span>
        {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
          <button type="button"
            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearch(''); setVisible(PAGE_SIZE); }}
            className="text-[12px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── Log list ── */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100">
              <Activity className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-bold text-black/30">Aucun événement trouvé</p>
            <p className="text-[12.5px] font-medium text-black/20">
              {search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Le journal est vide pour le moment'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paginated.map((item, idx) => {
              const s = STATUS_CONFIG[item.status];
              const StatusIcon = s.icon;
              return (
                <div
                  key={item.id ?? idx}
                  className="group flex items-start gap-4 px-5 py-4 hover:bg-slate-50/70 transition-colors duration-150"
                >
                  {/* Status icon */}
                  <div className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 mt-0.5 border',
                    s.bg, s.border,
                  )}>
                    <StatusIcon className={cn('w-4 h-4', s.color)} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-black leading-snug">{item.action}</p>
                        <p className="text-[12px] font-medium text-black/40 mt-0.5 leading-snug">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Type badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-black/40 uppercase tracking-wide">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        {/* Status badge */}
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold',
                          s.bg, s.color,
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                          {s.label}
                        </span>
                        {/* Time */}
                        <span className="text-[11px] font-medium text-black/25 whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl
                border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-black/60
                hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />
              Voir {Math.min(PAGE_SIZE, sorted.length - visible)} de plus · {sorted.length - visible} restants
            </button>
          </div>
        )}

        {/* Footer */}
        {paginated.length > 0 && !hasMore && (
          <div className="border-t border-slate-50 px-5 py-3 text-center">
            <p className="text-[11px] font-medium text-black/20">
              Tout affiché · {sorted.length} événement{sorted.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
