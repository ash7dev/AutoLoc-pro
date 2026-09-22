'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Info,
  PhoneCall,
  ShieldAlert,
  UserX,
  X,
} from 'lucide-react';
import { OwnerReservationItem } from '@/src/core/api/reservationsApi';

export interface OwnerSignalNoshowModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (commentaire?: string) => Promise<void>;
}

export const OwnerSignalNoshowModal: React.FC<OwnerSignalNoshowModalProps> = ({
  reservation,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [commentaire, setCommentaire] = useState<string>('');
  const [attested, setAttested] = useState<boolean>(true);

  // Synchronisation ouverture/fermeture du <dialog> natif
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Réinitialisation des états à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setCommentaire('');
      setAttested(true);
    }
  }, [isOpen]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attested || isSubmitting) return;
    await onSubmit(commentaire.trim());
  };

  const tenantName = reservation?.locataire?.prenom
    ? `${reservation.locataire.prenom} ${reservation.locataire.nom}`
    : 'Le locataire';

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
      <form onSubmit={handleFormSubmit} className="flex max-h-[calc(100dvh-2rem)] flex-col">
        {/* ── En-tête de la Modale ────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <UserX className="h-6 w-6 text-amber-700" />
            </span>
            <div>
              <h2 id={titleId} className="font-fraunces text-xl font-normal text-[#041912]">
                Signalement d'absence (No-Show)
              </h2>
              <p className="text-xs text-slate-500">
                Signaler la non-présentation de {tenantName}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Contenu Défilant ───────────────────────────────────────────── */}
        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          {/* Notice explication procédure No-Show */}
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Clock className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Règles de dédommagement No-Show Hôte</span>
            </div>
            <ul className="space-y-1.5 pl-5 list-disc text-amber-900/90 leading-relaxed">
              <li>
                <strong>Délai réglementaire :</strong> Ce signalement est possible 2 heures après l'heure de rendez-vous convenue.
              </li>
              <li>
                <strong>Délai de grâce T+5h :</strong> Le locataire est immédiatement alerté par SMS/Email pour régulariser son retard.
              </li>
              <li>
                <strong>Pénalité & Indemnité :</strong> Sans manifestation d'ici T+5h, la réservation sera annulée automatiquement avec versement de votre indemnité hôte.
              </li>
            </ul>
          </div>

          {/* Commentaire / Détails des tentatives de contact */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Précisions sur les tentatives de contact (Optionnel)
            </label>
            <textarea
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ex: Appels répétés sans réponse depuis 09h30, SMS envoyé sur WhatsApp sans retour."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Attestation obligatoire */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 border-t border-slate-100 pt-3">
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-amber-600"
            />
            <span>
              J'atteste avoir tenté de contacter {tenantName} à plusieurs reprises par téléphone/SMS sans succès.
            </span>
          </label>
        </div>

        {/* ── Pied de la Modale (Actions) ─────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!attested || isSubmitting}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <UserX className="h-4 w-4" />
            <span>{isSubmitting ? 'Transmission…' : 'Signaler l\'absence (No-Show)'}</span>
          </button>
        </div>
      </form>
    </dialog>
  );
};
