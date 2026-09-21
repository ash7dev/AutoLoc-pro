'use client';

import React, { useEffect, useState } from 'react';
import {
  XCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  X,
  ArrowRight,
  Loader2,
  DollarSign,
  Info,
} from 'lucide-react';
import { fetchApi } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface CancellationQuote {
  canCancel: boolean;
  isOwner?: boolean;
  refundPercentage: number;
  refundAmount: string;
  commissionRetained: string;
  ownerPenaltyAmount?: string;
  ownerPenaltyPercentage?: number;
  warnings: string[];
}

interface TenantCancellationPreviewModalProps {
  booking: TenantReservationDetailData;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
}

const PRESET_REASONS = [
  'Changement de programme',
  'Imprévu personnel',
  'Erreur de dates',
  'Véhicule plus nécessaire',
];

export const TenantCancellationPreviewModal: React.FC<TenantCancellationPreviewModalProps> = ({
  booking,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [quote, setQuote] = useState<CancellationQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessDone, setIsSuccessDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setReason('');
    setQuote(null);
    setErrorMessage(null);
    setIsSuccessDone(false);

    setLoadingQuote(true);
    fetchApi<CancellationQuote>(`/reservations/${booking.id}/cancellation-quote`)
      .then((data) => setQuote(data))
      .catch((err) => {
        console.warn('Quote cancellation non disponible:', err);
        // Fallback quote si l'endpoint quote n'est pas encore dispo
        setQuote({
          canCancel: true,
          refundPercentage: 100,
          refundAmount: String(booking.montantPayeEnLigne ?? booking.prixTotal ?? 0),
          commissionRetained: '0',
          warnings: [
            'L’annulation sera traitée selon les conditions d’annulation AutoLoc.',
            'Le remboursement sera crédité sur le moyen de paiement d’origine.',
          ],
        });
      })
      .finally(() => setLoadingQuote(false));
  }, [booking.id, booking.montantPayeEnLigne, booking.prixTotal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setErrorMessage('Le motif d’annulation doit faire au moins 5 caractères.');
      return;
    }

    const success = await onConfirm(trimmedReason);
    if (success) {
      setIsSuccessDone(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  const isFormValid = reason.trim().length >= 5 && !isSubmitting && !loadingQuote;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <XCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              <span>Politique d’annulation</span>
            </div>
            <h3 className="text-lg font-bold text-[#041912]">Annuler la réservation</h3>
            <p className="text-xs text-slate-500 font-mono font-medium">
              RÉF. #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {isSuccessDone ? (
          /* Confirmation d'annulation réussie */
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-[#041912]">Réservation annulée</h4>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                Votre réservation a bien été annulée. Une confirmation et les détails du remboursement vous ont été transmis.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Carte d'estimation du remboursement */}
            {loadingQuote ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A3D2E] mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Calcul des règles de remboursement AutoLoc...</p>
              </div>
            ) : quote ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Remboursement estimé locataire</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-900">
                    {formatCurrency(Number(quote.refundAmount || 0))} FCFA
                  </span>
                  <span className="text-xs font-bold text-amber-700">({quote.refundPercentage}% du règlement)</span>
                </div>
                {quote.warnings.length > 0 && (
                  <ul className="space-y-1 pt-1 border-t border-amber-200/60 text-[11px] text-amber-800">
                    {quote.warnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-medium">
                        <span className="text-amber-600">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {/* Erreur */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* 2. Motif d'annulation avec puces pré-définies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Raison de l’annulation *
                </label>
                <span className="text-[11px] text-slate-400 font-medium">{reason.length}/500</span>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-2">
                {PRESET_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                      reason === preset
                        ? 'bg-[#0A3D2E] border-[#0A3D2E] text-[#F1DFB6] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                placeholder="Indiquez le motif de votre annulation (ex: imprévu personnel, changement de programme...)"
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-400"
              />
              {reason.trim().length > 0 && reason.trim().length < 5 && (
                <p className="text-[11px] font-bold text-rose-600">• 5 caractères minimum requis</p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Garder la réservation
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirmer l’annulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
