'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, XCircle, Search, Clock, User, CreditCard, Building2,
  Loader2, X, Banknote, AlertCircle, Timer, Download,
  ArrowUp, ArrowDown, ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

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
  pending:   { label: 'En attente', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  processed: { label: 'Traité',     bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  rejected:  { label: 'Refusé',     bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400' },
};

type SortKey = 'amount' | 'date';

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

function ageLabel(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days} j`;
}

function exportWithdrawalsCsv(withdrawals: Withdrawal[]) {
  const headers = ['Propriétaire', 'Montant (FCFA)', 'Méthode', 'Coordonnées bancaires', 'Date demande', 'Statut'];
  const rows = withdrawals.map((w) => [
    w.ownerName, String(w.amount), w.method, w.bankInfo, w.requestedAt, STATUS_CONFIG[w.status].label,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'retraits.csv'; a.click();
  URL.revokeObjectURL(url);
}

function SortTh({ label, sortKey, current, onToggle, align = 'left' }: {
  label: string; sortKey: SortKey;
  current: { key: SortKey; dir: 'asc' | 'desc' } | null;
  onToggle: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = current?.key === sortKey;
  const Icon = active ? (current.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <th className={`px-5 py-3 text-left`}>
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors',
          active ? 'text-black/60' : 'text-black/30 hover:text-black/50',
          align === 'right' && 'flex-row-reverse',
        )}
      >
        {label}
        <Icon className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </th>
  );
}

// ── Confirmation dialog ────────────────────────────────────────────────────────

function ConfirmValidateDialog({
  withdrawal, onConfirm, onCancel, isLoading,
}: {
  withdrawal: Withdrawal;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-black text-black">Valider le retrait</p>
            <p className="text-[12px] font-medium text-black/40 mt-0.5">
              <span className="font-bold text-black/60">{withdrawal.ownerName}</span>
            </p>
          </div>
          <button type="button" onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5 mb-5">
            <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-black text-emerald-900">
                {formatPrice(withdrawal.amount)} FCFA
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {withdrawal.method} · {withdrawal.bankInfo}
              </p>
            </div>
          </div>

          <p className="text-[12.5px] text-slate-500 mb-5 leading-relaxed">
            Confirmez-vous le virement de{' '}
            <span className="font-bold text-slate-800">{formatPrice(withdrawal.amount)} FCFA</span>{' '}
            vers <span className="font-bold text-slate-800">{withdrawal.ownerName}</span> ?
            Cette action est irréversible.
          </p>

          <div className="flex gap-2.5">
            <button type="button" onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[12.5px] font-bold text-black/50 py-2.5 hover:bg-slate-100 transition-all">
              Annuler
            </button>
            <button type="button" disabled={isLoading} onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-white text-[12.5px] font-bold py-2.5 hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />}
              Confirmer le virement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reject dialog ─────────────────────────────────────────────────────────────

function RejectWithdrawalDialog({
  withdrawal, onConfirm, onCancel, isLoading,
}: {
  withdrawal: Withdrawal;
  onConfirm: (raison: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [raison, setRaison] = useState('');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-black text-black">Refuser le retrait</p>
            <p className="text-[12px] font-medium text-black/40 mt-0.5">
              <span className="font-bold text-black/60">{withdrawal.ownerName}</span>{' '}
              · {formatPrice(withdrawal.amount)} FCFA
            </p>
          </div>
          <button type="button" onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          <label className="block mb-1.5 text-[11.5px] font-bold text-black/50">
            Raison du refus <span className="font-medium text-black/25">(optionnel)</span>
          </label>
          <textarea
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            placeholder="Ex : Coordonnées bancaires incorrectes, vérification en cours…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] font-medium text-black placeholder-black/25 resize-none focus:border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-400/20 transition-all"
          />

          <div className="flex gap-2.5 mt-4">
            <button type="button" onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[12.5px] font-bold text-black/50 py-2.5 hover:bg-slate-100 transition-all">
              Annuler
            </button>
            <button type="button" disabled={isLoading} onClick={() => onConfirm(raison)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500 text-white text-[12.5px] font-bold py-2.5 hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface AdminWithdrawalsListProps {
  withdrawals: Withdrawal[];
}

export function AdminWithdrawalsList({ withdrawals }: AdminWithdrawalsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'rejected'>('all');
  const [sort, setSort]     = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [validateTarget, setValidateTarget] = useState<Withdrawal | null>(null);
  const [rejectTarget, setRejectTarget]     = useState<Withdrawal | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const safeWithdrawals = Array.isArray(withdrawals) ? withdrawals : [];

  const filtered = safeWithdrawals.filter((w) => {
    if (filter !== 'all' && w.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return w.ownerName.toLowerCase().includes(q) || w.bankInfo.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        if (sort.key === 'amount') return (a.amount - b.amount) * dir;
        return (new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()) * dir;
      })
    : filtered;

  function toggleSort(key: SortKey) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  }

  const pendingWithdrawals = safeWithdrawals.filter((w) => w.status === 'pending');
  const totalPending = pendingWithdrawals.reduce((a, w) => a + w.amount, 0);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleValidate(id: string) {
    setPendingId(id);
    setValidateTarget(null);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.validateWithdrawal(id)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      showToast('success', 'Retrait validé — virement effectué.');
      router.refresh();
    } catch {
      showToast('error', 'Erreur lors de la validation. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  async function handleReject(id: string, raison: string) {
    setPendingId(id);
    setRejectTarget(null);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.rejectWithdrawal(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raison: raison.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Retrait refusé.');
      router.refresh();
    } catch {
      showToast('error', 'Erreur lors du refus. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {/* Banner total en attente */}
      {totalPending > 0 && filter !== 'processed' && filter !== 'rejected' && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-3.5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 flex-shrink-0">
              <Banknote className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600/70 mb-0.5">
                Total en attente
              </p>
              <p className="text-[16px] font-black text-amber-800 leading-none">
                {formatPrice(totalPending)}{' '}
                <span className="text-[12px] font-semibold text-amber-600">FCFA</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200/60 px-3 py-1.5 text-[12px] font-bold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {pendingWithdrawals.length} demande{pendingWithdrawals.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un propriétaire…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-[13px] font-medium text-black placeholder-black/30 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'pending', 'processed', 'rejected'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200',
                filter === f ? 'bg-black text-emerald-400 shadow-sm' : 'bg-slate-100 text-black/50 hover:bg-slate-200',
              )}>
              {f === 'all' ? 'Tous' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
        {/* CSV export */}
        <button
          type="button"
          onClick={() => exportWithdrawalsCsv(filtered)}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-black/50 hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={2} />
          Exporter CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30 text-left">Propriétaire</th>
                <SortTh label="Montant" sortKey="amount" current={sort} onToggle={toggleSort} />
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30 text-left">Méthode</th>
                <SortTh label="Demandé le" sortKey="date" current={sort} onToggle={toggleSort} />
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30 text-left">Statut</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100">
                        <Banknote className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-[13px] font-bold text-black/30">Aucune demande de retrait</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((w) => {
                  const isLoading = pendingId === w.id;
                  return (
                    <tr key={w.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      {/* Propriétaire */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0">
                            <User className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-black truncate">{w.ownerName}</p>
                            <p className="text-[11px] font-medium text-black/35 truncate max-w-[160px]">{w.bankInfo}</p>
                          </div>
                        </div>
                      </td>

                      {/* Montant */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-[14px] font-black text-black">
                          {formatPrice(w.amount)}
                          <span className="text-[11px] font-semibold text-black/40 ml-1">FCFA</span>
                        </span>
                      </td>

                      {/* Méthode */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/60">
                          {w.method === 'Virement'
                            ? <Building2 className="h-3.5 w-3.5 text-black/30" strokeWidth={1.75} />
                            : <CreditCard className="h-3.5 w-3.5 text-black/30" strokeWidth={1.75} />
                          }
                          {w.method}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-black/40">
                            <Clock className="h-3 w-3 text-black/20" strokeWidth={1.75} />
                            {w.requestedAt}
                          </span>
                          {w.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-600">
                              <Timer className="h-3 w-3" strokeWidth={2} />
                              {ageLabel(w.requestedAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
                          STATUS_CONFIG[w.status].bg, STATUS_CONFIG[w.status].text,
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[w.status].dot)} />
                          {STATUS_CONFIG[w.status].label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setValidateTarget(w)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-emerald-400 text-[11.5px] font-bold hover:bg-emerald-500 hover:text-white shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {isLoading
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                                }
                                Valider
                              </button>
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => setRejectTarget(w)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11.5px] font-bold text-black/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                                Refuser
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-medium text-black/25 italic">
                              {w.status === 'processed' ? 'Traité' : 'Refusé'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      {validateTarget && (
        <ConfirmValidateDialog
          withdrawal={validateTarget}
          onConfirm={() => handleValidate(validateTarget.id)}
          onCancel={() => setValidateTarget(null)}
          isLoading={pendingId === validateTarget.id}
        />
      )}
      {rejectTarget && (
        <RejectWithdrawalDialog
          withdrawal={rejectTarget}
          onConfirm={(raison) => handleReject(rejectTarget.id, raison)}
          onCancel={() => setRejectTarget(null)}
          isLoading={pendingId === rejectTarget.id}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-bold shadow-xl max-w-sm animate-in slide-in-from-bottom-2 duration-300',
          toast.type === 'success' ? 'bg-black border border-emerald-400/30 text-white' : 'bg-red-500 text-white',
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
