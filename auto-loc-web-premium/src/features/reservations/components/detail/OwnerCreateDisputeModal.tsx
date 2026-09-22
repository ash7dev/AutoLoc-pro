'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  Loader2,
  Phone,
  ShieldAlert,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OwnerReservationItem, CreateDisputePayload } from '@/src/core/api/reservationsApi';

export interface OwnerCreateDisputeModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateDisputePayload) => Promise<boolean>;
}

const PRESET_DISPUTE_MOTIFS = [
  'Dégradation / Rayure / Choc carrosserie',
  'Véhicule restitué très sale / Odeur',
  'Dépassement kilométrique important',
  'Retard significatif à la restitution',
  'Carburant manquant à la restitution',
  'Autre non-conformité majeure',
];

export const OwnerCreateDisputeModal: React.FC<OwnerCreateDisputeModalProps> = ({
  reservation,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [motif, setMotif] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coutEstime, setCoutEstime] = useState<string>('');
  const [attestationConfirmed, setAttestationConfirmed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessDone, setIsSuccessDone] = useState<boolean>(false);

  // Sync open/close state with native HTML dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Reset form state on modal open
  useEffect(() => {
    if (isOpen) {
      setMotif('');
      setDescription('');
      setCoutEstime('');
      setAttestationConfirmed(false);
      setErrorMessage(null);
      setIsSuccessDone(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedMotif = motif.trim();
    const trimmedDescription = description.trim();

    if (!trimmedMotif) {
      setErrorMessage('Veuillez sélectionner ou indiquer un motif de litige.');
      return;
    }

    if (trimmedDescription.length < 10) {
      setErrorMessage('La description détaillée doit contenir au moins 10 caractères.');
      return;
    }

    if (!attestationConfirmed) {
      setErrorMessage('Vous devez certifier la véracité des faits signalés.');
      return;
    }

    const payload: CreateDisputePayload = {
      motif: trimmedMotif,
      description: trimmedDescription,
      coutEstime: coutEstime ? Number(coutEstime) : undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      setIsSuccessDone(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const isFormValid =
    motif.trim().length > 0 &&
    description.trim().length >= 10 &&
    attestationConfirmed &&
    !isSubmitting;

  const vehicleName = reservation?.vehicule
    ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}`
    : 'Véhicule';

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
      className="m-auto w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60"
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

        {/* Header Modale */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>Arbitrage & Support AutoLoc</span>
            </div>
            <h2 id={titleId} className="font-fraunces text-xl font-normal text-[#041912]">
              Déclarer un litige / dégât
            </h2>
            <p className="text-xs text-slate-500 font-mono font-medium">
              {vehicleName} • RÉF. #{reservation?.id?.slice(0, 8)?.toUpperCase()}
            </p>
          </div>
        </div>

        {isSuccessDone ? (
          /* Confirmation Succès */
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#041912]">Dossier de litige ouvert</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                Votre signalement a été enregistré. Le solde de la réservation reste consigné en escrow pendant l’instruction du dossier par notre cellule d'arbitrage.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1">
            {/* Banner Information Procédure Litige AutoLoc */}
            <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200/90 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-950">
                <Info className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Garanties & Procédure d’arbitrage hôte</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-900/90 font-medium">
                Dès la déclaration du litige, les fonds de la réservation sont gelés sur le compte de cantonnement. Notre équipe comparera l’état des lieux de départ et de retour pour procéder à une régularisation sous 24h à 48h.
              </p>
            </div>

            {/* Message d'erreur */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* 1. Sélection du motif (Puces pré-définies + champ texte) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Motif principal du litige *
              </label>

              {/* Chips des motifs pré-définis */}
              <div className="flex flex-wrap gap-2">
                {PRESET_DISPUTE_MOTIFS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMotif(preset)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                      motif === preset
                        ? 'bg-rose-900 border-rose-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Sélectionnez un motif ci-dessus ou saisissez-en un sur-mesure..."
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            {/* 2. Description détaillée des faits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Description détaillée des circonstances *
                </label>
                <span className="text-[11px] text-slate-400 font-medium">{description.length}/1000</span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                placeholder="Décrivez précisément l'incident, le lieu, l'heure du constat et les échanges avec le locataire..."
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder:text-slate-400"
              />
              {description.trim().length > 0 && description.trim().length < 10 && (
                <p className="text-[11px] font-bold text-rose-600">• 10 caractères minimum requis</p>
              )}
            </div>

            {/* 3. Estimation des coûts de réparation (optionnel) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Montant estimé des dégâts / préjudice (FCFA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={coutEstime}
                  onChange={(e) => setCoutEstime(e.target.value)}
                  placeholder="Ex: 50000"
                  className="w-full pl-10 pr-16 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  FCFA
                </div>
              </div>
              {coutEstime && Number(coutEstime) > 0 && (
                <p className="text-[11px] text-slate-500 font-mono font-medium">
                  Montant saisi : {formatCurrency(Number(coutEstime))} FCFA
                </p>
              )}
            </div>

            {/* 4. Indication des preuves photos */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-800">Photos de l'état des lieux</p>
                <p className="text-slate-500">
                  Les photos enregistrées lors du check-in et du check-out seront automatiquement jointes à ce dossier.
                </p>
              </div>
            </div>

            {/* 5. Case à cocher d'attestation sur l'honneur */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={attestationConfirmed}
                onChange={(e) => setAttestationConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-700 font-medium leading-tight">
                J'atteste sur l'honneur l'exactitude des informations transmises et je m'engage à fournir tout justificatif complémentaire demandé par le support d'arbitrage AutoLoc.
              </span>
            </label>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Envoi du dossier…</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Ouvrir le litige</span>
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
