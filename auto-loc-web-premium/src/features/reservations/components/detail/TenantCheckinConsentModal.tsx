'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantCheckinConsentModalProps {
  booking: TenantReservationDetailData;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Contenu                                                                    */
/* -------------------------------------------------------------------------- */

const CONSENT_ITEMS = [
  {
    key: 'keys',
    text: 'J’atteste avoir reçu les clés du véhicule et pris possession de ce dernier.',
  },
  {
    key: 'condition',
    text: 'Je confirme que l’état du véhicule est conforme aux photos transmises par l’hôte.',
  },
  {
    key: 'contract',
    text: 'J’accepte le démarrage officiel de la location et la prise d’effet des garanties d’assurance.',
  },
] as const;

type ConsentKey = (typeof CONSENT_ITEMS)[number]['key'];
type Consents = Record<ConsentKey, boolean>;

const EMPTY_CONSENTS: Consents = { keys: false, condition: false, contract: false };

/** "EXTERIEUR_AVANT" -> "Exterieur avant" ; un libellé déjà lisible reste tel quel. */
const formatCategory = (value: string) =>
  /^[A-Z_]+$/.test(value) ? value.charAt(0) + value.slice(1).replace(/_/g, ' ').toLowerCase() : value;

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

export const TenantCheckinConsentModal: React.FC<TenantCheckinConsentModalProps> = ({
  booking,
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const titleId = useId();
  const hintId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);

  const [consents, setConsents] = useState<Consents>(EMPTY_CONSENTS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const photos = booking.photosEtatLieu?.filter((p) => p.type === 'CHECKIN') ?? [];
  const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : undefined;
  const lightboxOpen = currentPhoto !== undefined;

  const consentCount = CONSENT_ITEMS.filter((item) => consents[item.key]).length;
  const isAllConsented = consentCount === CONSENT_ITEMS.length;

  // <dialog> natif : focus piégé, Échap, fond inerte
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxOpen && !dialog.open) dialog.showModal();
    if (!lightboxOpen && dialog.open) dialog.close();
  }, [lightboxOpen]);

  // Un consentement ne doit jamais rester coché d'une ouverture à l'autre
  useEffect(() => {
    if (!isOpen) {
      setConsents(EMPTY_CONSENTS);
      setSelectedIndex(null);
    }
  }, [isOpen]);

  const showPrev = () =>
    setSelectedIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  const showNext = () =>
    setSelectedIndex((i) => (i === null ? i : (i + 1) % photos.length));

  const lightboxButtonClass =
    'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white';

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // Pendant l'envoi, Échap ne ferme pas la modale
        onCancel={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
        onClose={() => {
          if (isOpen) onClose();
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60"
      >
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          {/* En-tête */}
          <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-7 sm:pb-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-champagne/40 text-brand-main">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div>
                <h2 id={titleId} className="font-display text-xl text-brand-dark">
                  Validation de la prise en charge
                </h2>
                <p className="text-sm text-slate-500">
                  Contrôlez le véhicule et les photos de l’hôte avant de confirmer.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Fermer"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Contenu défilant */}
          <div className="space-y-7 overflow-y-auto px-6 pb-6 sm:px-7">
            {/* 1. Photos de l'hôte */}
            <section aria-label="Photos de l’état des lieux" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Camera className="h-4 w-4 text-brand-main" strokeWidth={1.5} aria-hidden="true" />
                  État des lieux déposé par l’hôte
                </h3>
                {photos.length > 0 && (
                  <span className="shrink-0 rounded-full border border-brand-main/15 bg-brand-main/5 px-2.5 py-0.5 text-xs font-semibold text-brand-main">
                    {plural(photos.length, 'photo')}
                  </span>
                )}
              </div>

              {photos.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {photos.map((photo, idx) => (
                    <li key={photo.id || idx}>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        aria-label={`Agrandir la photo ${idx + 1}${photo.categorie ? ` (${formatCategory(photo.categorie)})` : ''
                          }`}
                        className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 transition-colors hover:border-brand-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        {photo.categorie && (
                          <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-md bg-black/65 px-1.5 py-0.5 text-left text-[11px] font-medium text-white">
                            {formatCategory(photo.categorie)}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm text-slate-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-main" aria-hidden="true" />
                  <p>
                    L’hôte a validé son inspection de départ. Inspectez physiquement le véhicule
                    avant de donner votre consentement.
                  </p>
                </div>
              )}
            </section>

            {/* 2. Attestation */}
            <fieldset className="space-y-3 border-t border-slate-100 pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <legend className="font-display text-lg text-brand-dark">Votre attestation</legend>
                <span className="text-xs tabular-nums text-slate-500" aria-live="polite">
                  {consentCount} sur {CONSENT_ITEMS.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {CONSENT_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:border-slate-300 has-[:checked]:border-brand-main has-[:checked]:bg-brand-main/[0.04] has-[:checked]:ring-1 has-[:checked]:ring-brand-main has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-main has-[:focus-visible]:ring-offset-2"
                  >
                    <input
                      type="checkbox"
                      checked={consents[item.key]}
                      onChange={(e) =>
                        setConsents((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      disabled={isSubmitting}
                      className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#0A3D2E]"
                    />
                    <span className="text-sm leading-relaxed text-slate-800">{item.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Actions (toujours visibles) */}
          <div className="border-t border-slate-100 bg-white px-6 py-4 sm:px-7">
            {!isAllConsented && (
              <p id={hintId} className="mb-3 text-xs text-slate-500 sm:text-right">
                Cochez les trois attestations pour continuer.
              </p>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="cursor-pointer rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!isAllConsented || isSubmitting}
                aria-describedby={!isAllConsented ? hintId : undefined}
                aria-busy={isSubmitting}
                onClick={() => onConfirm()}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-main px-6 py-3 text-sm font-semibold text-champagne shadow-md transition-colors hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {isSubmitting ? 'Validation…' : 'Confirmer et démarrer la location'}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* Agrandissement d'une photo, avec navigation */}
      <dialog
        ref={lightboxRef}
        aria-label="Agrandissement de la photo"
        onClose={() => setSelectedIndex(null)}
        onClick={(e) => {
          // Clic sur le fond
          if (e.target === e.currentTarget) setSelectedIndex(null);
        }}
        onKeyDown={(e) => {
          if (photos.length < 2) return;
          if (e.key === 'ArrowLeft') showPrev();
          if (e.key === 'ArrowRight') showNext();
        }}
        className="m-auto w-full max-w-4xl bg-transparent p-4 text-white backdrop:bg-black/85"
      >
        {currentPhoto && selectedIndex !== null && (
          <figure className="relative flex flex-col items-center gap-3">
            <img
              src={currentPhoto.url}
              alt={`Photo ${selectedIndex + 1} de l’état des lieux`}
              className="max-h-[78dvh] max-w-full rounded-2xl object-contain"
            />
            <figcaption className="text-center text-sm text-white/85">
              Photo {selectedIndex + 1} sur {photos.length}
              {currentPhoto.categorie ? ` : ${formatCategory(currentPhoto.categorie)}` : ''}
            </figcaption>

            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="Fermer l’agrandissement"
              className={`absolute right-2 top-2 ${lightboxButtonClass}`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Photo précédente"
                  className={`absolute left-2 top-[40%] -translate-y-1/2 ${lightboxButtonClass}`}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Photo suivante"
                  className={`absolute right-2 top-[40%] -translate-y-1/2 ${lightboxButtonClass}`}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </figure>
        )}
      </dialog>
    </>
  );
};