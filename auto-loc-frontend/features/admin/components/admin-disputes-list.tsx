'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, AlertTriangle, Scale, Calendar, Car, User,
  CheckCircle2, XCircle, Loader2, X, ChevronDown, ChevronUp, AlertCircle,
  Timer, Download, ArrowUp, ArrowDown, ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

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
  open:          { label: 'Ouvert',       bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     pulse: true },
  investigating: { label: 'En cours',     bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   pulse: true },
  resolved:      { label: 'Fondé',        bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', pulse: false },
  dismissed:     { label: 'Non fondé',    bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400',   pulse: false },
};

const PRIORITY_CONFIG = {
  low:    { label: 'Priorité faible',   bg: 'bg-slate-100', text: 'text-slate-500' },
  medium: { label: 'Priorité moyenne',  bg: 'bg-amber-50',  text: 'text-amber-700' },
  high:   { label: 'Priorité élevée',   bg: 'bg-red-50',    text: 'text-red-600' },
};

type SortKey = 'priority' | 'date';
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

function ageLabel(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)} j`;
}

function exportDisputesCsv(disputes: Dispute[]) {
  const headers = ['Locataire', 'Propriétaire', 'Véhicule', 'Raison', 'Montant', 'Ouvert le', 'Statut', 'Priorité'];
  const rows = disputes.map((d) => [
    d.renterName, d.ownerName, d.vehicle, d.reason,
    d.amount != null ? String(d.amount) : '',
    d.openedAt,
    STATUS_CONFIG[d.status].label,
    PRIORITY_CONFIG[d.priority].label,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'litiges.csv'; a.click();
  URL.revokeObjectURL(url);
}

function SortBtn({ label, sortKey, current, onToggle }: {
  label: string; sortKey: SortKey;
  current: { key: SortKey; dir: 'asc' | 'desc' } | null;
  onToggle: (k: SortKey) => void;
}) {
  const active = current?.key === sortKey;
  const Icon = active ? (current.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <button type="button" onClick={() => onToggle(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all',
        active ? 'bg-black text-emerald-400' : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black',
      )}>
      <Icon className="w-3 h-3" strokeWidth={2.5} />
      {label}
    </button>
  );
}

// ── Confirm close dialog ───────────────────────────────────────────────────────

function ConfirmCloseDialog({
  dispute, verdict, onConfirm, onCancel, isLoading,
}: {
  dispute: Dispute;
  verdict: 'resolved' | 'dismissed';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const isFonde = verdict === 'resolved';
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
            <p className="text-[14px] font-black text-black">
              {isFonde ? 'Classer comme fondé' : 'Classer comme non fondé'}
            </p>
            <p className="text-[12px] font-medium text-black/40 mt-0.5 truncate max-w-[260px]">
              {dispute.reason}
            </p>
          </div>
          <button type="button" onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          <div className={cn(
            'rounded-xl border px-4 py-3.5 mb-5 text-[12.5px] leading-relaxed',
            isFonde ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600',
          )}>
            {isFonde
              ? 'Le litige sera marqué comme fondé. Le locataire a gain de cause. Cette action est définitive.'
              : 'Le litige sera classé comme non fondé. Le propriétaire a gain de cause. Cette action est définitive.'
            }
          </div>

          <div className="flex gap-2.5">
            <button type="button" onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[12.5px] font-bold text-black/50 py-2.5 hover:bg-slate-100 transition-all">
              Annuler
            </button>
            <button type="button" disabled={isLoading} onClick={onConfirm}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl text-white text-[12.5px] font-bold py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                isFonde ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-800 hover:bg-black',
              )}>
              {isLoading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : isFonde
                  ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  : <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
              }
              {isFonde ? 'Confirmer — Fondé' : 'Confirmer — Non fondé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dispute card ───────────────────────────────────────────────────────────────

function DisputeCard({
  dispute, pendingId, onInvestigate, onResolve, onDismiss,
}: {
  dispute: Dispute;
  pendingId: string | null;
  onInvestigate: (id: string) => void;
  onResolve: (dispute: Dispute) => void;
  onDismiss: (dispute: Dispute) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = pendingId === dispute.id;
  const status   = STATUS_CONFIG[dispute.status];
  const priority = PRIORITY_CONFIG[dispute.priority];
  const isActive = dispute.status === 'open' || dispute.status === 'investigating';

  return (
    <div className={cn(
      'rounded-2xl border bg-white transition-all duration-200',
      isActive ? 'border-slate-200 hover:shadow-md' : 'border-slate-100 opacity-80',
    )}>
      {/* Main row */}
      <div className="p-5">
        {/* Top */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0',
              dispute.priority === 'high' ? 'bg-red-50' : dispute.priority === 'medium' ? 'bg-amber-50' : 'bg-slate-100',
            )}>
              <AlertTriangle className={cn(
                'w-4 h-4',
                dispute.priority === 'high' ? 'text-red-500' : dispute.priority === 'medium' ? 'text-amber-500' : 'text-slate-400',
              )} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-black truncate leading-tight">{dispute.reason}</p>
              <p className="text-[11px] font-medium text-black/35 mt-0.5">{dispute.reservationId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold',
              status.bg, status.text,
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', status.dot, status.pulse && 'animate-pulse')} />
              {status.label}
            </span>
            <span className={cn('hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold', priority.bg, priority.text)}>
              {priority.label}
            </span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px] font-medium text-black/50 mb-3">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-black/20 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">Locataire : <span className="font-bold text-black/70">{dispute.renterName}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-black/20 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate">{dispute.vehicle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-black/20 flex-shrink-0" strokeWidth={1.75} />
            {dispute.openedAt}
            {isActive && (
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-amber-600">
                <Timer className="h-3 w-3" strokeWidth={2} />
                {ageLabel(dispute.openedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {dispute.amount !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-[11.5px] font-bold text-amber-700">
                {formatPrice(dispute.amount)} FCFA
              </span>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-black/40 hover:text-black/70 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded ? 'Réduire' : 'Aperçu rapide'}
            </button>
            <Link
              href={`/dashboard/admin/disputes/${dispute.id}`}
              className="inline-flex items-center gap-1 text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors ml-2"
            >
              Dossier complet &rarr;
            </Link>
          </div>

          {/* Actions */}
          {isActive && (
            <div className="flex items-center gap-2">
              {dispute.status === 'open' && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onInvestigate(dispute.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-[11.5px] font-bold text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" strokeWidth={2} />}
                  En cours
                </button>
              )}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onResolve(dispute)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-emerald-400 text-[11.5px] font-bold hover:bg-emerald-500 hover:text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />}
                Fondé
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onDismiss(dispute)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-[11.5px] font-bold text-black/50 hover:bg-slate-100 hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Non fondé
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded description */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60 rounded-b-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2">Description complète</p>
          <p className="text-[13px] text-slate-700 leading-relaxed">{dispute.description}</p>
          <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-black/40 font-medium">
            <User className="w-3.5 h-3.5" strokeWidth={1.75} />
            Propriétaire : <span className="font-bold text-black/60">{dispute.ownerName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface AdminDisputesListProps {
  disputes: Dispute[];
}

export function AdminDisputesList({ disputes }: AdminDisputesListProps) {
  const router = useRouter();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'all' | 'open' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [sort, setSort]       = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>({ key: 'priority', dir: 'desc' });
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ dispute: Dispute; verdict: 'resolved' | 'dismissed' } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const safeDisputes = Array.isArray(disputes) ? disputes : [];
  const filtered = safeDisputes.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.renterName.toLowerCase().includes(q)
        || d.ownerName.toLowerCase().includes(q)
        || d.vehicle.toLowerCase().includes(q)
        || d.reservationId.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        if (sort.key === 'priority')
          return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
        return (new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime()) * dir;
      })
    : filtered;

  function toggleSort(key: SortKey) {
    setSort((s) => s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleUpdateStatus(id: string, statut: 'EN_INVESTIGATION' | 'FONDE' | 'NON_FONDE') {
    if (statut === 'EN_INVESTIGATION') {
      showToast('success', 'Litige passé en cours d\'investigation (interface seulement).');
      return;
    }

    setPendingId(id);
    setConfirmTarget(null);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.updateDisputeStatus(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: statut }),
      });
      if (!res.ok) throw new Error();
      const labels = { EN_INVESTIGATION: '', FONDE: 'Litige classé fondé.', NON_FONDE: 'Litige classé non fondé.' };
      showToast('success', labels[statut]);
      router.refresh();
    } catch {
      showToast('error', 'Erreur lors de la mise à jour. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  const activeCount = safeDisputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
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
          <button
            type="button"
            onClick={() => exportDisputesCsv(filtered)}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-black/50 hover:bg-slate-50 hover:text-black hover:border-slate-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            Exporter CSV
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(['all', 'open', 'investigating', 'resolved', 'dismissed'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200',
                  filter === f ? 'bg-black text-emerald-400 shadow-sm' : 'bg-slate-100 text-black/50 hover:bg-slate-200',
                )}>
                {f === 'all' ? `Tous (${safeDisputes.length})` : f === 'open' ? `Ouverts (${safeDisputes.filter(d => d.status === 'open').length})` : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <SortBtn label="Priorité" sortKey="priority" current={sort} onToggle={toggleSort} />
          <SortBtn label="Date" sortKey="date" current={sort} onToggle={toggleSort} />
        </div>
      </div>

      {/* Active count banner */}
      {activeCount > 0 && filter === 'all' && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-[12.5px] font-semibold text-red-700">
            {activeCount} litige{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''} nécessitant une action
          </p>
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <Scale className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
          <p className="text-[14px] font-bold text-black/30">Aucun litige trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => (
            <DisputeCard
              key={d.id}
              dispute={d}
              pendingId={pendingId}
              onInvestigate={(id) => handleUpdateStatus(id, 'EN_INVESTIGATION')}
              onResolve={(dispute) => setConfirmTarget({ dispute, verdict: 'resolved' })}
              onDismiss={(dispute) => setConfirmTarget({ dispute, verdict: 'dismissed' })}
            />
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmTarget && (
        <ConfirmCloseDialog
          dispute={confirmTarget.dispute}
          verdict={confirmTarget.verdict}
          onConfirm={() => handleUpdateStatus(
            confirmTarget.dispute.id,
            confirmTarget.verdict === 'resolved' ? 'FONDE' : 'NON_FONDE',
          )}
          onCancel={() => setConfirmTarget(null)}
          isLoading={pendingId === confirmTarget.dispute.id}
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
