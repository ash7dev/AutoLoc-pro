'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Search, User, CreditCard, Loader2, X, DollarSign, Calendar, Car, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS, type AdminRefund } from '@/lib/nestjs/admin';

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

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

// ── Confirmation dialog ────────────────────────────────────────────────────────

function ConfirmProcessDialog({
  refund, onConfirm, onCancel, isLoading,
}: {
  refund: AdminRefund;
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
            <p className="text-[14px] font-black text-black">Confirmer le remboursement</p>
            <p className="text-[12px] font-medium text-black/40 mt-0.5">
              <span className="font-bold text-black/60">{refund.locataire.prenom} {refund.locataire.nom}</span>
            </p>
          </div>
          <button type="button" onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3.5 mb-5">
            <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-[13px] font-black text-blue-900">
                {formatPrice(refund.montantRembourse)} FCFA
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                InTouch · {refund.fournisseur}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-[11px] font-bold text-amber-800 mb-2">⚠️ Important</p>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Assurez-vous d'avoir <strong>effectué le virement InTouch</strong> avant de confirmer.
              Cette action marquera le remboursement comme traité.
            </p>
          </div>

          <p className="text-[12.5px] text-slate-500 mb-5 leading-relaxed">
            Confirmez-vous avoir remboursé{' '}
            <span className="font-bold text-slate-800">{formatPrice(refund.montantRembourse)} FCFA</span>{' '}
            à <span className="font-bold text-slate-800">{refund.locataire.prenom} {refund.locataire.nom}</span> via InTouch ?
          </p>

          <div className="flex gap-2.5">
            <button type="button" onClick={onCancel}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 text-[12.5px] font-bold text-black/50 py-2.5 hover:bg-slate-100 transition-all">
              Annuler
            </button>
            <button type="button" disabled={isLoading} onClick={onConfirm}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 text-white text-[12.5px] font-bold py-2.5 hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />}
              Confirmer le remboursement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toast notification ─────────────────────────────────────────────────────────

function Toast({ type, msg, onClose }: { type: 'success' | 'error'; msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-5 duration-300">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border',
        type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
      )}>
        {type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={2} />
        ) : (
          <XCircle className="w-4 h-4 text-red-600" strokeWidth={2} />
        )}
        <p className={cn(
          'text-[13px] font-bold',
          type === 'success' ? 'text-emerald-800' : 'text-red-800',
        )}>
          {msg}
        </p>
        <button onClick={onClose} className="ml-2">
          <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ── Main List Component ────────────────────────────────────────────────────────

export function AdminRefundsList({ refunds }: { refunds: AdminRefund[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [processTarget, setProcessTarget] = useState<AdminRefund | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const safeRefunds = Array.isArray(refunds) ? refunds : [];

  const filtered = safeRefunds.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.locataire.prenom.toLowerCase().includes(q)
        || r.locataire.nom.toLowerCase().includes(q)
        || r.vehicule.marque.toLowerCase().includes(q)
        || r.vehicule.modele.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPending = safeRefunds.reduce((a, r) => a + r.montantRembourse, 0);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleProcess(id: string) {
    setPendingId(id);
    setProcessTarget(null);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.processRefund(id)}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      showToast('success', 'Remboursement marqué comme effectué.');
      router.refresh();
    } catch {
      showToast('error', 'Erreur lors du traitement. Réessayez.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      {/* Banner total en attente */}
      {totalPending > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-3.5 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-100 flex-shrink-0">
              <DollarSign className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600/70 mb-0.5">
                Total à rembourser
              </p>
              <p className="text-[16px] font-black text-blue-800 leading-none">
                {formatPrice(totalPending)}{' '}
                <span className="text-[12px] font-semibold text-blue-600">FCFA</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 border border-blue-200/60 px-3 py-1.5 text-[12px] font-bold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {safeRefunds.length} remboursement{safeRefunds.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-[13px] font-medium text-black placeholder-black/30 focus:border-blue-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/30 transition-all"
          />
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[14px] font-bold text-slate-500">
            Aucun remboursement en attente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((refund) => {
            const isProcessing = pendingId === refund.id;

            return (
              <div
                key={refund.id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-blue-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800">
                        {refund.vehicule.marque}{' '}
                        <span className="text-blue-600">{refund.vehicule.modele}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Réf. {refund.reservationId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mr-1.5 animate-pulse" />
                      En attente
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {ageLabel(refund.annuleLe || refund.creeLe)}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* Locataire */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <User className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Locataire</p>
                      <p className="text-[12px] font-bold text-slate-800 truncate">
                        {refund.locataire.prenom} {refund.locataire.nom}
                      </p>
                    </div>
                  </div>

                  {/* Montant */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Montant</p>
                      <p className="text-[12px] font-bold text-blue-800">
                        {formatPrice(refund.montantRembourse)} F
                      </p>
                    </div>
                  </div>

                  {/* Date annulation */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Annulée le</p>
                      <p className="text-[12px] font-bold text-slate-800">
                        {fmtDate(refund.annuleLe || refund.creeLe)}
                      </p>
                    </div>
                  </div>

                  {/* Véhicule */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Car className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Immatriculation</p>
                      <p className="text-[12px] font-bold text-slate-800 truncate font-mono">
                        {refund.vehicule.immatriculation || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Raison annulation */}
                {refund.raisonAnnulation && (
                  <div className="mb-4 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Raison</p>
                    <p className="text-[11px] text-slate-600 italic line-clamp-2">
                      "{refund.raisonAnnulation}"
                    </p>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setProcessTarget(refund)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[13px] font-bold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        Marquer comme remboursé
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation dialog */}
      {processTarget && (
        <ConfirmProcessDialog
          refund={processTarget}
          onConfirm={() => handleProcess(processTarget.id)}
          onCancel={() => setProcessTarget(null)}
          isLoading={!!pendingId}
        />
      )}

      {/* Toast */}
      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}
    </>
  );
}
