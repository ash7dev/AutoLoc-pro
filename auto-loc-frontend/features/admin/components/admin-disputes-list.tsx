'use client';

import React, { useState } from 'react';
import {
  Search, AlertTriangle, Scale, Calendar, Car, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Dispute {
  id: string;
  reservationId: string;
  renterName: string;
  ownerName: string;
  vehicle: string;
  reason: string;
  description: string;
  amount: number | null;
  openedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
}

const STATUS_CONFIG = {
  open: { label: 'Ouvert', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  investigating: { label: 'En cours', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  resolved: { label: 'Résolu', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  dismissed: { label: 'Classé', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Faible', bg: 'bg-slate-100', text: 'text-slate-600' },
  medium: { label: 'Moyenne', bg: 'bg-amber-50', text: 'text-amber-700' },
  high: { label: 'Élevée', bg: 'bg-red-50', text: 'text-red-700' },
};

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

interface AdminDisputesListProps {
  disputes: Dispute[];
}

export function AdminDisputesList({ disputes }: AdminDisputesListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'dismissed'>('all');

  const filtered = disputes.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.renterName.toLowerCase().includes(q)
        || d.ownerName.toLowerCase().includes(q)
        || d.vehicle.toLowerCase().includes(q)
        || d.reservationId.includes(q);
    }
    return true;
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un litige…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-[13px] font-medium text-black placeholder-black/30 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'open', 'investigating', 'resolved', 'dismissed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200',
                filter === f ? 'bg-black text-emerald-400 shadow-sm' : 'bg-slate-100 text-black/50 hover:bg-slate-200',
              )}
            >
              {f === 'all' ? 'Tous' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Dispute cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <Scale className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
          <p className="text-[14px] font-bold text-black/30">Aucun litige trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const status = STATUS_CONFIG[d.status];
            const priority = PRIORITY_CONFIG[d.priority];
            return (
              <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all duration-200">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50">
                      <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-black">{d.reason}</p>
                      <p className="text-[11px] font-medium text-black/35">{d.reservationId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
                      status.bg, status.text,
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold',
                      priority.bg, priority.text,
                    )}>
                      {priority.label}
                    </span>
                  </div>
                </div>

                <p className="text-[12px] font-medium text-black/50 mb-3">
                  {d.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] font-medium text-black/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                    Locataire : {d.renterName}
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                    {d.vehicle}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                    {d.openedAt}
                  </div>
                </div>

                {d.amount !== null && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-[12px] font-bold text-amber-700">
                    Montant estimé : {formatPrice(d.amount)} FCFA
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
