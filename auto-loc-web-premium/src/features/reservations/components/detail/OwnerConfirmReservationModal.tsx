'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { OwnerReservationItem } from '@/src/core/api/reservationsApi';

export interface OwnerConfirmReservationModalProps {
  reservation: OwnerReservationItem;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (heureDebut: string, consignes?: string) => Promise<void>;
}

const PRESET_TIMES = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatConfirmationDeadline = (
  creeLe?: string,
  dateDebut?: string,
  tacitDeadline?: string
): string => {
  let target: Date | null = null;

  if (tacitDeadline) {
    const d = new Date(tacitDeadline);
    if (!isNaN(d.getTime())) target = d;
  }

  if (!target && creeLe && dateDebut) {
    const createdDate = new Date(creeLe);
    const startDate = new Date(dateDebut);

    if (!isNaN(createdDate.getTime()) && !isNaN(startDate.getTime())) {
      const createdDay =
        createdDate.getUTCFullYear() * 10000 +
        (createdDate.getUTCMonth() + 1) * 100 +
        createdDate.getUTCDate();
      const startDay =
        startDate.getUTCFullYear() * 10000 +
        (startDate.getUTCMonth() + 1) * 100 +
        startDate.getUTCDate();
      const isSameDay = createdDay === startDay;

      if (isSameDay) {
        const diffMs = startDate.getTime() - createdDate.getTime();
        if (diffMs <= 3 * 3600 * 1000) {
          target = new Date(
            Math.min(
              createdDate.getTime() + 30 * 60 * 1000,
              Math.max(createdDate.getTime() + 15 * 60 * 1000, startDate.getTime() - 15 * 60 * 1000)
            )
          );
        } else {
          target = new Date(startDate.getTime() - 2 * 3600 * 1000);
        }
      } else {
        const date24h = new Date(createdDate.getTime() + 24 * 3600 * 1000);
        const startMinus2h = new Date(startDate.getTime() - 2 * 3600 * 1000);
        target = date24h.getTime() < startMinus2h.getTime() ? date24h : startMinus2h;
      }
    }
  }

  if (!target && dateDebut) {
    const startDate = new Date(dateDebut);
    if (!isNaN(startDate.getTime())) {
      target = new Date(startDate.getTime() - 2 * 3600 * 1000);
    }
  }

  if (!target) {
    return 'dans un délai de 24h';
  }

  try {
    const formatted = target.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    const capitalizedDay = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${capitalizedDay} à ${hours}:${minutes}`;
  } catch {
    return 'dans un délai restreint';
  }
};

export const OwnerConfirmReservationModal: React.FC<OwnerConfirmReservationModalProps> = ({
  reservation,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [customTime, setCustomTime] = useState<string>('');
  const [consignes, setConsignes] = useState<string>('');
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
      setSelectedTime('10:00');
      setCustomTime('');
      setConsignes('');
      setAttested(true);
    }
  }, [isOpen]);

  const effectiveTime = customTime.trim() ? customTime.trim() : selectedTime;
  const isTimeValid = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(effectiveTime);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTimeValid || !attested || isSubmitting) return;
    await onConfirm(effectiveTime, consignes.trim());
  };

  const vehicleName = reservation?.vehicule
    ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}`
    : 'Véhicule';

  const tenantName = reservation?.locataire?.prenom
    ? `${reservation.locataire.prenom} ${reservation.locataire.nom}`
    : 'Locataire';

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
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4ADE80]/15 text-[#0A3D2E]">
              <CheckCircle2 className="h-6 w-6 text-[#059669]" />
            </span>
            <div>
              <h2 id={titleId} className="font-fraunces text-xl font-normal text-[#041912]">
                Confirmer la réservation
              </h2>
              <p className="text-xs text-slate-500">
                Fixez l'heure de départ et le lieu de remise du véhicule.
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
          {/* Carte Résumé Réservation */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
              <span className="font-bold text-slate-900 text-sm">{vehicleName}</span>
              <span className="font-mono text-[10px] font-bold text-[#0A3D2E] bg-emerald-100/60 px-2 py-0.5 rounded-md">
                RÉF. #{reservation?.id?.slice(0, 8)?.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-semibold text-slate-800">{tenantName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium text-slate-700">
                  Début : {formatDate(reservation?.dateDebut)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-200/60 pt-2 text-[11px] text-amber-900 font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>
                À valider avant le :{' '}
                <strong className="font-bold text-[#0A3D2E]">
                  {formatConfirmationDeadline(reservation?.creeLe, reservation?.dateDebut, reservation?.tacitCheckinDeadlineLe)}
                </strong>
              </span>
            </div>
          </div>

          {/* Sélection de l'heure de début */}
          <div className="space-y-3">
            <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#0A3D2E]" />
                Heure de rendez-vous (Check-in)
              </span>
              <span className="text-[#059669] font-mono text-sm">{effectiveTime}</span>
            </label>

            {/* Grille de créneaux rapides */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_TIMES.map((time) => {
                const isSelected = selectedTime === time && !customTime;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setCustomTime('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0A3D2E] bg-[#0A3D2E] text-[#F1DFB6] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>

            {/* Saisie d'une heure personnalisée */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Ou heure personnalisée :</span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="10:00"
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]"
              />
            </div>
          </div>

          {/* Consignes & lieu de rendez-vous (Optionnel) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Lieu de rdv / Consignes (Optionnel)
            </label>
            <textarea
              rows={2}
              value={consignes}
              onChange={(e) => setConsignes(e.target.value)}
              placeholder="Ex: Rendez-vous au parking de la résidence, m'appeler 15 min avant d'arriver."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]"
            />
          </div>

          {/* Notice & Engagement */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-3 text-xs text-emerald-950">
              <ShieldCheck className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                En confirmant, vous vous engagez à remettre le véhicule au locataire à l’heure et au lieu convenus.
              </p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-[#0A3D2E]"
              />
              <span>J'atteste que le véhicule est disponible et prêt à rouler.</span>
            </label>
          </div>
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
            disabled={!isTimeValid || !attested || isSubmitting}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-2.5 text-xs font-bold text-[#F1DFB6] shadow-md hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
            <span>{isSubmitting ? 'Confirmation…' : `Confirmer (${effectiveTime})`}</span>
          </button>
        </div>
      </form>
    </dialog>
  );
};
