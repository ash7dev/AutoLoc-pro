'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, XCircle, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface CancelModalProps {
  reservationId: string;
  vehicleName?: string;
  open: boolean;
  onClose: () => void;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
export function CancelModal({ reservationId, vehicleName, open, onClose }: CancelModalProps) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = reason.trim().length >= 5 && !loading;

  async function handleCancel() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
        body: { raison: reason.trim() },
      });
      setDone(true);
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
    // reset after animation
    setTimeout(() => { setReason(''); setError(null); setDone(false); }, 300);
  }

  if (!open) return null;

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={cn(
        'relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden',
        'bg-white border border-slate-200/80',
        'shadow-2xl shadow-black/20',
        'animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300',
      )}>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-start gap-3 px-6 pt-4 pb-5 sm:pt-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[16px] font-black text-slate-900 leading-tight">
              Annuler la réservation
            </h2>
            {vehicleName && (
              <p className="text-[12px] text-slate-400 font-medium mt-0.5 truncate">{vehicleName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-6 h-px bg-slate-100" />

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {done ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[15px] font-black text-slate-800">Réservation annulée</p>
                <p className="text-[12.5px] text-slate-400 mt-1 leading-relaxed">
                  Votre réservation a bien été annulée. Vous serez redirigé automatiquement.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Redirection en cours…
              </div>
            </div>
          ) : (
            <>
              {/* Warning notice */}
              <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200/80">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-[12px] font-medium text-amber-800 leading-relaxed">
                  L&apos;annulation est définitive. Le remboursement dépend de la politique en vigueur.
                </p>
              </div>

              {/* Reason field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Motif d&apos;annulation <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Ex : Changement de plan, empêchement de dernière minute…"
                  rows={3}
                  disabled={loading}
                  className={cn(
                    'w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-slate-800 placeholder-slate-400',
                    'focus:outline-none focus:ring-2 resize-none transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/15'
                      : 'border-slate-200 focus:border-red-300 focus:ring-red-300/15',
                  )}
                />
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-[10.5px] font-medium',
                    reason.trim().length > 0 && reason.trim().length < 5
                      ? 'text-red-500' : 'text-slate-300',
                  )}>
                    {reason.trim().length > 0 && reason.trim().length < 5 && 'Minimum 5 caractères'}
                  </span>
                  <span className="text-[10.5px] text-slate-300 tabular-nums">{reason.length} car.</span>
                </div>
              </div>

              {/* API error */}
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" strokeWidth={2} />
                  <p className="text-[12px] font-semibold text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!done && (
          <div className="flex items-center gap-2 px-6 pb-6 sm:pb-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              Conserver
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!canSubmit}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all',
                canSubmit
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed',
              )}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              }
              {loading ? 'Annulation…' : 'Confirmer l\'annulation'}
            </button>
          </div>
        )}

        {/* iOS safe area bottom padding */}
        <div className="sm:hidden h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}
