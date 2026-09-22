'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Info,
  Loader2,
  ShieldAlert,
  Wallet,
  X,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { reservationsApi, OwnerReservationItem, CancellationQuoteResponse } from '@/src/core/api/reservationsApi';

export interface OwnerCancellationPreviewModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<boolean>;
}

const PRESET_OWNER_REASONS = [
  'Véhicule indisponible (panne/réparation)',
  'Erreur de calendrier / Double réservation',
  'Non-conformité des dates proposées',
  'Imprévu personnel majeur',
];

export const OwnerCancellationPreviewModal: React.FC<OwnerCancellationPreviewModalProps> = ({
  reservation,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [quote, setQuote] = useState<CancellationQuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessDone, setIsSuccessDone] = useState<boolean>(false);

  // Synchronisation ouverture/fermeture du <dialog> natif
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Chargement du devis d'annulation au moment de l'ouverture
  useEffect(() => {
    if (!isOpen || !reservation.id) return;
    setReason('');
    setQuote(null);
    setErrorMessage(null);
    setIsSuccessDone(false);

    setLoadingQuote(true);
    reservationsApi
      .getCancellationQuote(reservation.id)
      .then((data) => setQuote(data))
      .catch((err) => {
        console.warn('Simulation annulation non disponible:', err);
        // Fallback quote si l'endpoint n'est pas prêt
        setQuote({
          canCancel: true,
          isOwner: true,
          refundPercentage: 100,
          refundAmount: String(reservation.prixTotal || reservation.montantPayeEnLigne || 0),
          commissionRetained: '0',
          ownerPenaltyAmount: '0',
          ownerPenaltyPercentage: 0,
          warnings: [
            'Le locataire sera intégralement remboursé des sommes versées.',
            'Refuser une réservation peut impacter votre taux de réponse hôte.',
          ],
        });
      })
      .finally(() => setLoadingQuote(false));
  }, [isOpen, reservation.id, reservation.prixTotal, reservation.montantPayeEnLigne]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setErrorMessage('Le motif d’annulation doit contenir au moins 5 caractères.');
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
  const isPendingConfirmation = reservation?.statut === 'PAYEE';
  const actionText = isPendingConfirmation ? 'Refuser la demande' : 'Annuler la réservation';

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        if (isSubmitting) e.preventDefault();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
      className="m-auto w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col p-6 sm:p-7 space-y-6">
        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Fermer"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              <span>Politique d’annulation hôte</span>
            </div>
            <h2 id={titleId} className="font-fraunces text-xl font-normal text-[#041912]">
              {actionText}
            </h2>
            <p className="text-xs text-slate-500 font-mono font-medium">
              RÉF. #{reservation?.id?.slice(0, 8)?.toUpperCase()}
            </p>
          </div>
        </div>

        {isSuccessDone ? (
          /* Écran de confirmation réussie */
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#041912]">Réservation annulée</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                L’annulation a été traitée. Le locataire a été notifié et remboursé selon les conditions d’annulation AutoLoc.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto">
            {/* 1. Simulation du remboursement & pénalité hôte */}
            {loadingQuote ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0A3D2E] mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Calcul des règles d’annulation AutoLoc...</p>
              </div>
            ) : quote ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Conséquences financières pour le locataire & l’hôte</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-amber-800">
                      Remboursement locataire
                    </span>
                    <span className="text-lg font-black text-amber-900">
                      {formatCurrency(Number(quote.refundAmount || 0))} FCFA
                    </span>
                  </div>

                  {Number(quote.ownerPenaltyAmount || 0) > 0 ? (
                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-rose-800">
                        Pénalité hôte
                      </span>
                      <span className="text-lg font-black text-rose-700">
                        {formatCurrency(Number(quote.ownerPenaltyAmount || 0))} FCFA
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[10px] font-semibold uppercase text-emerald-800">
                        Pénalité hôte
                      </span>
                      <span className="text-lg font-black text-emerald-700">0 FCFA</span>
                    </div>
                  )}
                </div>

                {quote.warnings && quote.warnings.length > 0 && (
                  <ul className="space-y-1 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900">
                    {quote.warnings.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-medium leading-tight">
                        <span className="text-amber-600">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            {/* Message d'erreur */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* 2. Sélection du motif avec puces pré-définies Hôte */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Raison du refus / d’annulation *
                </label>
                <span className="text-[11px] text-slate-400 font-medium">{reason.length}/500</span>
              </div>

              {/* Preset Chips Hôte */}
              <div className="flex flex-wrap gap-2">
                {PRESET_OWNER_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
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
                placeholder="Indiquez le motif précis de votre annulation..."
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
                    <span>Traitement…</span>
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
    </dialog>
  );
};
