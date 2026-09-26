'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight, ShieldCheck, X } from 'lucide-react';
export interface InspectionPhotoItem {
  id: string;
  url: string;
  type: 'CHECKIN' | 'CHECKOUT' | string;
  categorie?: string | null;
}

interface TenantInspectionPhotosCardProps {
  photos?: InspectionPhotoItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  AVANT: 'Face avant',
  ARRIERE: 'Face arrière',
  COTE_GAUCHE: 'Côté gauche',
  COTE_DROIT: 'Côté droit',
  COMPTEUR_KM: 'Compteur KM',
  CARBURANT: 'Jauge carburant',
  HABITACLE: 'Habitacle & Sièges',
  COFFRE: 'Coffre',
  CHOC_RAYURE: 'Rayure / Impact',
};

const getCategoryLabel = (categorie?: string | null) => {
  if (!categorie) return 'Photo d’inspection';
  if (CATEGORY_LABELS[categorie]) return CATEGORY_LABELS[categorie];
  const text = categorie.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const TABS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'CHECKIN', label: 'Prise en charge' },
  { key: 'CHECKOUT', label: 'Restitution' },
] as const;

type Tab = (typeof TABS)[number]['key'];

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main';

/* Badge Départ / Retour sur les vignettes */
const TypeBadge: React.FC<{ type: string }> = ({ type }) =>
  type === 'CHECKIN' ? (
    <span className="rounded-full bg-champagne px-2 py-0.5 text-[10px] font-semibold text-brand-main shadow-sm">
      Départ
    </span>
  ) : (
    <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
      Retour
    </span>
  );

export const TenantInspectionPhotosCard: React.FC<TenantInspectionPhotosCardProps> = ({
  photos = [],
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  const checkinPhotos = useMemo(() => photos.filter((p) => p.type === 'CHECKIN'), [photos]);
  const checkoutPhotos = useMemo(() => photos.filter((p) => p.type === 'CHECKOUT'), [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeTab === 'CHECKIN') return checkinPhotos;
    if (activeTab === 'CHECKOUT') return checkoutPhotos;
    return photos;
  }, [activeTab, checkinPhotos, checkoutPhotos, photos]);

  const counts: Record<Tab, number> = {
    ALL: photos.length,
    CHECKIN: checkinPhotos.length,
    CHECKOUT: checkoutPhotos.length,
  };

  const count = filteredPhotos.length;
  const isOpen = selectedIndex !== null;
  const current = selectedIndex !== null ? filteredPhotos[selectedIndex] : undefined;

  const openLightbox = (photoId: string) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photoId);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const step = (direction: 1 | -1) =>
    setSelectedIndex((prev) => (prev === null ? prev : (prev + direction + count) % count));

  /* Lightbox : clavier, verrouillage du scroll, focus */
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, count]);

  /* Garde la vignette active visible dans la bande */
  useEffect(() => {
    if (selectedIndex === null) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    thumbRefs.current[selectedIndex]?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || count < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  return (
    <>
      <div className="space-y-5 rounded-3xl bg-white p-5 text-slate-900 shadow-[0_1px_2px_rgba(10,61,46,0.06),0_12px_28px_-16px_rgba(10,61,46,0.28)] ring-1 ring-slate-900/[0.06] sm:p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-main text-champagne">
              <Camera className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </div>
            <div>
              <h3 className="font-fraunces text-xl font-normal leading-tight tracking-tight text-slate-900">
                État des lieux
              </h3>
              <p className="text-xs text-slate-500">
                Photos prises à la prise en charge et à la restitution
              </p>
            </div>
          </div>

          {photos.length > 0 && (
            <span className="hidden shrink-0 items-center gap-1.5 pt-1 text-xs font-medium text-brand-main sm:inline-flex">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Horodatées
            </span>
          )}
        </div>

        {/* Onglets */}
        {photos.length > 0 && (
          <div
            role="tablist"
            aria-label="Filtrer les photos"
            className="no-scrollbar flex w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1 sm:w-fit"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 motion-reduce:transition-none ${focusRing} ${active
                      ? 'bg-brand-main text-champagne shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-[11px] font-medium tabular-nums opacity-60">
                    {counts[tab.key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Grille */}
        {count === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-slate-50 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-main text-champagne">
              <Camera className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </div>
            <p className="mt-3 font-fraunces text-lg font-normal text-slate-900">
              Aucune photo d’état des lieux
            </p>
            <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
              {activeTab === 'CHECKIN'
                ? 'Aucune photo prise lors de la prise en charge du véhicule.'
                : activeTab === 'CHECKOUT'
                  ? 'Aucune photo prise lors de la restitution.'
                  : 'Les photos ajoutées par l’hôte ou par vous apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {filteredPhotos.map((photo) => {
              const label = getCategoryLabel(photo.categorie);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openLightbox(photo.id)}
                  aria-label={`Agrandir la photo : ${label}`}
                  className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 text-left ring-1 ring-slate-900/[0.06] ${focusRing}`}
                >
                  <Image
                    src={photo.url}
                    alt={label}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 to-transparent" />

                  <div className="absolute left-2 top-2">
                    <TypeBadge type={photo.type} />
                  </div>

                  <p className="absolute inset-x-3 bottom-2.5 truncate text-xs font-medium text-white">
                    {label}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {current && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photos de l’état des lieux"
          className="fixed inset-0 z-50 flex flex-col bg-black/95 pb-[env(safe-area-inset-bottom)] text-white animate-in fade-in duration-200 motion-reduce:animate-none"
        >
          {/* Barre du haut */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-xs text-white/60">
                {current.type === 'CHECKIN' ? 'Prise en charge' : 'Restitution'}
                <span className="mx-2 inline-block h-3 w-px translate-y-0.5 bg-white/25" aria-hidden />
                <span className="tabular-nums">
                  {selectedIndex + 1} / {count}
                </span>
              </p>
              <h4 className="truncate font-fraunces text-lg font-normal leading-tight">
                {getCategoryLabel(current.categorie)}
              </h4>
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label="Fermer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scène */}
          <div
            className="relative min-h-0 flex-1 touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="absolute inset-x-4 inset-y-0 sm:inset-x-20">
              <Image
                key={current.id}
                src={current.url}
                alt={getCategoryLabel(current.categorie)}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-champagne"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Vignettes */}
          {count > 1 && (
            <div className="no-scrollbar overflow-x-auto px-4 py-4">
              <div className="mx-auto flex w-max gap-2">
                {filteredPhotos.map((p, idx) => (
                  <button
                    key={p.id}
                    ref={(el) => {
                      thumbRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={`Voir la photo ${idx + 1} : ${getCategoryLabel(p.categorie)}`}
                    aria-current={idx === selectedIndex}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity duration-200 motion-reduce:transition-none ${idx === selectedIndex
                        ? 'border-champagne'
                        : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                  >
                    <Image src={p.url} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};