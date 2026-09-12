'use client';

/* ════════════════════════════════════════════════════════════════
   VehicleDetailHero — 2026 Editorial Masterpiece
════════════════════════════════════════════════════════════════ */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin, Star, Shield, ChevronLeft, ChevronRight,
  Car, Images, X, Sparkles, ShieldCheck
} from 'lucide-react';
import { cn, getTenantPricePerDay } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS } from '@/features/vehicles/owner/vehicle-helpers';
import { useCurrency } from '@/providers/currency-provider';
import { ShareVehicleButton } from '@/features/vehicles/owner/ShareVehicleButton';
import { PremiumPriceTag } from '@/components/ui/PremiumPriceTag';

interface Props { vehicle: Vehicle }
type Photo = { id: string; url: string };

/* ════════════════════════════════════════════════════════════════
   LIGHTBOX
════════════════════════════════════════════════════════════════ */
function Lightbox({
  photos, index, onClose, onChange,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      onChange(index < photos.length - 1 ? index + 1 : 0);
    } else if (distance < -minSwipeDistance) {
      onChange(index > 0 ? index - 1 : photos.length - 1);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onChange(index > 0 ? index - 1 : photos.length - 1);
      else if (e.key === 'ArrowRight') onChange(index < photos.length - 1 ? index + 1 : 0);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, photos.length, onClose, onChange]);

  const goToPrevious = () => onChange(index > 0 ? index - 1 : photos.length - 1);
  const goToNext = () => onChange(index < photos.length - 1 ? index + 1 : 0);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-white/90 text-[14px] font-extrabold tabular-nums bg-white/10 px-3 py-1 rounded-full border border-white/10">
            {index + 1} / {photos.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-white"
        >
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Main Image View */}
      <div className="flex-1 relative flex items-center justify-center min-h-0" onClick={e => e.stopPropagation()}>
        <div className="relative w-full h-full px-4 md:px-20">
          <Image src={photos[index].url} alt="" fill sizes="100vw" className="object-contain" />
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white shadow-2xl flex items-center justify-center transition-all active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-slate-900" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white shadow-2xl flex items-center justify-center transition-all active:scale-95"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-slate-900" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {/* Thumb strip */}
      {photos.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto px-6 py-5 scrollbar-none flex-shrink-0 justify-center" onClick={e => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(i)}
              className={cn(
                'relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden transition-all duration-200 flex-shrink-0',
                i === index
                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105 opacity-100'
                  : 'ring-1 ring-white/30 opacity-50 hover:opacity-100'
              )}
            >
              <Image src={p.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ADAPTIVE DESKTOP GALLERY
════════════════════════════════════════════════════════════════ */
function DesktopGallery({
  photos,
  onOpen,
}: {
  photos: Photo[];
  onOpen: (i: number) => void;
}) {
  const n = photos.length;
  const cell = 'relative cursor-pointer group bg-slate-100 overflow-hidden';
  const img = (p: Photo, i: number, sizes = '50vw') => (
    <Image
      src={p.url}
      alt=""
      fill
      sizes={sizes}
      priority={i === 0}
      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    />
  );
  const dim = 'absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300';

  if (n === 0) return (
    <div className="h-[480px] rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
      <Car className="h-20 w-20 text-slate-300" strokeWidth={1.2} />
    </div>
  );

  if (n === 1) return (
    <div className="h-[480px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
      <div className={cn(cell, 'w-full h-full')} onClick={() => onOpen(0)}>
        {img(photos[0], 0, '100vw')}
        <div className={dim} />
      </div>
    </div>
  );

  if (n === 2) return (
    <div className="h-[480px] rounded-3xl overflow-hidden grid grid-cols-2 gap-2 border border-slate-200/80 shadow-md">
      {photos.map((p, i) => (
        <div key={p.id} className={cell} onClick={() => onOpen(i)}>
          {img(p, i)} <div className={dim} />
        </div>
      ))}
    </div>
  );

  if (n === 3) return (
    <div className="h-[480px] rounded-3xl overflow-hidden grid grid-cols-2 gap-2 border border-slate-200/80 shadow-md">
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      <div className="grid grid-rows-2 gap-2">
        {[1, 2].map(i => (
          <div key={photos[i].id} className={cell} onClick={() => onOpen(i)}>
            {img(photos[i], i)} <div className={dim} />
          </div>
        ))}
      </div>
    </div>
  );

  if (n === 4) return (
    <div className="h-[480px] rounded-3xl overflow-hidden grid grid-cols-2 gap-2 border border-slate-200/80 shadow-md">
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      <div className="grid grid-rows-2 gap-2">
        <div className={cell} onClick={() => onOpen(1)}>
          {img(photos[1], 1)} <div className={dim} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[2, 3].map(i => (
            <div key={photos[i].id} className={cell} onClick={() => onOpen(i)}>
              {img(photos[i], i, '25vw')} <div className={dim} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[480px] rounded-3xl overflow-hidden grid grid-cols-2 gap-2 border border-slate-200/80 shadow-md">
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {photos.slice(1, 5).map((photo, idx) => {
          const i = idx + 1;
          const isLast = idx === 3 && n > 5;
          return (
            <div key={photo.id} className={cell} onClick={() => onOpen(i)}>
              {img(photo, i, '25vw')}
              <div className={dim} />
              {isLast && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl text-[13px] font-extrabold text-slate-900 shadow-lg group-hover:scale-105 transition-transform">
                    <Images className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    +{n - 5} photos
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MOBILE GALLERY
════════════════════════════════════════════════════════════════ */
function MobileGallery({
  photos, activeIndex, onPrev, onNext, onThumb, onOpen,
}: {
  photos: Photo[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onThumb: (i: number) => void;
  onOpen: () => void;
}) {
  if (photos.length === 0) return (
    <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
      <Car className="h-14 w-14 text-slate-300" strokeWidth={1.2} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
        <Image
          src={photos[activeIndex].url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover cursor-pointer"
          onClick={onOpen}
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronRight className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </button>
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-full px-3 py-1">
              <span className="text-[11.5px] font-bold text-white tabular-nums">
                {activeIndex + 1}/{photos.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onThumb(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === activeIndex
                  ? 'border-emerald-500 shadow-md shadow-emerald-500/20 scale-105'
                  : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              <Image src={p.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN HERO
════════════════════════════════════════════════════════════════ */
export function VehicleDetailHero({ vehicle }: Props): React.ReactElement {
  const photos = vehicle.photos ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { formatPrice } = useCurrency();

  const prev = () => setActiveIndex(i => (i > 0 ? i - 1 : photos.length - 1));
  const next = () => setActiveIndex(i => (i < photos.length - 1 ? i + 1 : 0));

  return (
    <>
      {lightboxOpen && photos.length > 0 && (
        <Lightbox
          photos={photos}
          index={activeIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveIndex}
        />
      )}

      <div className="space-y-6">

        {/* ── Mobile Gallery ── */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between">
            {vehicle.statut === 'VERIFIE' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-emerald-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                Véhicule Vérifié KYC
              </span>
            ) : <div />}
            <ShareVehicleButton vehicle={vehicle} />
          </div>

          <MobileGallery
            photos={photos}
            activeIndex={activeIndex}
            onPrev={prev}
            onNext={next}
            onThumb={setActiveIndex}
            onOpen={() => setLightboxOpen(true)}
          />
        </div>

        {/* ── Desktop Gallery ── */}
        <div className="hidden lg:block relative">
          <DesktopGallery
            photos={photos}
            onOpen={i => { setActiveIndex(i); setLightboxOpen(true); }}
          />

          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {vehicle.statut === 'VERIFIE' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/15 px-3.5 py-1.5 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                <span className="text-[11.5px] font-extrabold text-emerald-400 uppercase tracking-wider">Vérifié AutoLoc</span>
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <ShareVehicleButton vehicle={vehicle} />
          </div>
        </div>

        {/* ── Title Block (Fraunces Editorial Title) ── */}
        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(vehicle.types?.length ? vehicle.types : [vehicle.type]).map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                {TYPE_LABELS[t] ?? t}
              </span>
            ))}
            {vehicle.annee && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                Édition {vehicle.annee}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-[32px] sm:text-[40px] font-black tracking-tight text-slate-950 font-editorial leading-[1.08]">
                {vehicle.marque}{' '}
                <span className="text-emerald-600 font-extrabold">{vehicle.modele}</span>
              </h1>

              {/* Mobile Info Cards */}
              <div className="lg:hidden space-y-3 mt-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <MapPin className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 mb-0.5">Localisation</p>
                    <p className="text-[15px] font-extrabold text-slate-900 leading-tight">
                      {vehicle.ville}
                    </p>
                    {vehicle.adresse && (
                      <p className="text-[12.5px] text-slate-600 font-medium mt-0.5 truncate">
                        {vehicle.adresse}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.note > 0 && (
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Note</p>
                        <p className="text-[17px] font-black text-slate-900 tabular-nums">
                          {Number(vehicle.note).toFixed(1)} <span className="text-[11px] font-medium text-slate-400">({vehicle.totalAvis})</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {vehicle.totalLocations > 0 && (
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                        <Car className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Locations</p>
                        <p className="text-[17px] font-black text-slate-900 tabular-nums">
                          {vehicle.totalLocations}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Price Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 text-white shadow-lg">
                  <PremiumPriceTag
                    price={getTenantPricePerDay(Number(vehicle.prixParJour))}
                    size="hero"
                    variant="dark"
                    period="/ jour"
                  />
                </div>
              </div>

              {/* Desktop Inline Info */}
              <div className="hidden lg:flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-[14px] font-semibold text-slate-700">
                <span className="flex items-center gap-2 text-slate-900">
                  <MapPin className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                  {vehicle.ville}{vehicle.adresse ? `, ${vehicle.adresse}` : ''}
                </span>

                {vehicle.note > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                    <strong className="text-slate-900 font-extrabold">{Number(vehicle.note).toFixed(1)}</strong>
                    <span className="text-slate-500 font-medium">({vehicle.totalAvis} avis)</span>
                  </span>
                )}

                {vehicle.totalLocations > 0 && (
                  <span className="flex items-center gap-1 text-slate-700 font-bold">
                    <Car className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    {vehicle.totalLocations} location{vehicle.totalLocations > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}