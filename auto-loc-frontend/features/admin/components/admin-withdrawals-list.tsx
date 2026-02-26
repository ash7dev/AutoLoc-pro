'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Eye, Search, Clock, User, CreditCard, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Withdrawal {
  id: string;
  ownerName: string;
  amount: number;
  method: string;
  bankInfo: string;
  requestedAt: string;
  status: 'pending' | 'processed' | 'rejected';
}

const STATUS_CONFIG = {
  pending: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  processed: { label: 'Traité', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  rejected: { label: 'Refusé', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
};

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

interface AdminWithdrawalsListProps {
  withdrawals: Withdrawal[];
}

export function AdminWithdrawalsList({ withdrawals }: AdminWithdrawalsListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'rejected'>('all');

  const filtered = withdrawals.filter((w) => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return w.ownerName.toLowerCase().includes(q);
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
            placeholder="Rechercher un propriétaire…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
              text-[13px] font-medium text-black placeholder-black/30
              focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'pending', 'processed', 'rejected'] as const).map((f) => (
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Propriétaire
                </th>
                <th className="text-left px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Montant
                </th>
                <th className="text-left px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Méthode
                </th>
                <th className="text-left px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Demandé
                </th>
                <th className="text-left px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Statut
                </th>
                <th className="text-right px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <p className="text-[14px] font-bold text-black/30">Aucune demande</p>
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100">
                          <User className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-black">{w.ownerName}</p>
                          <p className="text-[11px] font-medium text-black/35">{w.bankInfo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[13px] font-bold text-black">
                        {formatPrice(w.amount)} FCFA
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-[12px] font-medium text-black/50">
                        {w.method === 'Virement' ? (
                          <Building2 className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                        ) : (
                          <CreditCard className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                        )}
                        {w.method}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-black/40">
                        <Clock className="h-3.5 w-3.5 text-black/20" strokeWidth={1.75} />
                        {w.requestedAt}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
                        STATUS_CONFIG[w.status].bg, STATUS_CONFIG[w.status].text,
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[w.status].dot)} />
                        {STATUS_CONFIG[w.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                            bg-slate-100 text-[11px] font-bold text-black/60
                            hover:bg-slate-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                          Détails
                        </button>
                        {w.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                bg-emerald-50 text-[11px] font-bold text-emerald-700
                                hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                              Valider
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                                bg-red-50 text-[11px] font-bold text-red-600
                                hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
