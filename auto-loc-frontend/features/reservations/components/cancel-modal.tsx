'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, XCircle, Loader2, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { translateError } from '@/lib/utils/api-error-fr';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface CancelModalProps {
  reservationId: string;
  vehicleName?: string;
  statut?: string;
  open: boolean;
  onClose: () => void;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
function getCancelWarning(statut?: string): { text: string; color: 'amber' | 'red'; icon: string } {
  if (statut === 'EN_ATTENTE_PAIEMENT') {
    return {
      text: 'Votre paiement n\'est pas encore confirmé. L\'annulation est immédiate et aucun remboursement ne sera effectué.',
      color: 'amber',
      icon: '⏳',
    };
  }
  if (statut === 'PAYEE') {
    return {
      text: 'Paiement confirmé. Le remboursement dépend du délai restant avant le début de la location (de 0 % à 100 % hors frais de service). L\'annulation est définitive.',
      color: 'amber',
      icon: '💰',
    };
  }
  if (statut === 'CONFIRMEE') {
    return {
      text: 'Le propriétaire a déjà confirmé cette réservation. Le remboursement peut être réduit ou nul selon le délai restant. L\'annulation est définitive.',
      color: 'red',
      icon: '🚨',
    };
  }
  return {
    text: 'L\'annulation est définitive. Le remboursement dépend de la politique en vigueur.',
    color: 'amber',
    icon: '⚠️',
  };
}

export function CancelModal({ reservationId, vehicleName, statut, open, onClose }: CancelModalProps) {
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
      }, 2000);
    } catch (err) {
      setError(translateError(err));
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

  const warning = getCancelWarning(statut);
  const isRed = warning.color === 'red';

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay with enhanced blur */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={cn(
        'relative w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[28px] overflow-hidden',
        'bg-white/95 backdrop-blur-xl border border-slate-200/60',
        'shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] sm:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]',
        'animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300',
        'max-h-[92dvh] overflow-y-auto',
      )}>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-4 pb-2 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300/80" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-start gap-4 px-6 pt-5 pb-5 sm:pt-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
            isRed
              ? "bg-gradient-to-br from-red-500 to-red-600 border border-red-400/20"
              : "bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400/20"
          )}>
            <XCircle className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[19px] font-black text-slate-900 leading-tight tracking-tight">
              Annuler la réservation
            </h2>
            {vehicleName && (
              <p className="text-[13px] text-slate-500 font-semibold mt-1 truncate">{vehicleName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30"
          >
            <X className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6 space-y-5">

          {done ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-4 border-white flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[18px] font-black text-slate-900">Réservation annulée</p>
                <p className="text-[13.5px] text-slate-500 font-medium leading-relaxed max-w-sm">
                  Votre réservation a bien été annulée. Vous allez être redirigé automatiquement.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12.5px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Redirection en cours…
              </div>
            </div>
          ) : (
            <>
              {/* Warning notice — contextuel selon le statut */}
              <div className={cn(
                'relative overflow-hidden rounded-2xl border-2 p-4 shadow-sm',
                isRed ? 'bg-red-50 border-red-200/80' : 'bg-amber-50 border-amber-200/80',
              )}>
                <div className="flex items-start gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl",
                    isRed ? 'bg-red-100/80' : 'bg-amber-100/80',
                  )}>
                    {warning.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-[11px] font-black uppercase tracking-wider mb-1.5',
                      isRed ? 'text-red-600' : 'text-amber-600'
                    )}>
                      {isRed ? 'Attention critique' : 'Information importante'}
                    </p>
                    <p className={cn(
                      'text-[13px] font-medium leading-relaxed',
                      isRed ? 'text-red-900' : 'text-amber-900'
                    )}>
                      {warning.text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                  <span>Motif d&apos;annulation</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Expliquez brièvement la raison de votre annulation..."
                  rows={4}
                  disabled={loading}
                  className={cn(
                    'w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-[13.5px] text-slate-800 placeholder-slate-400 font-medium',
                    'focus:outline-none focus:ring-4 resize-none transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    error
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-slate-200 focus:border-red-300 focus:ring-red-300/20',
                  )}
                />
                <div className="flex items-center justify-between px-1">
                  <span className={cn(
                    'text-[11px] font-bold',
                    reason.trim().length > 0 && reason.trim().length < 5
                      ? 'text-red-500' : 'text-slate-400',
                  )}>
                    {reason.trim().length > 0 && reason.trim().length < 5 && '⚠️ Minimum 5 caractères requis'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold tabular-nums">
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {/* API error */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border-2 border-red-200 animate-in slide-in-from-top-2 duration-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" strokeWidth={2.5} />
                  <p className="text-[13px] font-bold text-red-700 flex-1">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!done && (
          <div className="flex items-center gap-3 px-6 pb-6 sm:pb-7">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-[14px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              Conserver
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!canSubmit}
              className={cn(
                'flex-1 flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-[14px] font-black transition-all duration-200',
                canSubmit
                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <ChevronRight className="w-4.5 h-4.5" strokeWidth={3} />
              )}
              {loading ? 'Annulation…' : 'Confirmer l\'annulation'}
            </button>
          </div>
        )}

        {/* iOS safe area bottom padding */}
        <div className="sm:hidden pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
