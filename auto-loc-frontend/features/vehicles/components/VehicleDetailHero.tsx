'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin, Star, Shield, ChevronLeft, ChevronRight,
  Car, Images, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS } from '@/features/vehicles/owner/vehicle-helpers';
import { useCurrency } from '@/providers/currency-provider';

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
  return (
    <div className="fixed inset-0 z-[100] bg-black/96 backdrop-blur-sm flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <span className="text-white/40 text-[13px] font-medium tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 relative flex items-center justify-center px-14 md:px-20 min-h-0"
        onClick={e => e.stopPropagation()}>
        <div className="relative w-full h-full">
          <Image src={photos[index].url} alt="" fill sizes="100vw" className="object-contain" />
        </div>
        {photos.length > 1 && (
          <>
            <button type="button"
              onClick={() => onChange(index > 0 ? index - 1 : photos.length - 1)}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button type="button"
              onClick={() => onChange(index < photos.length - 1 ? index + 1 : 0)}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumb strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-none flex-shrink-0 justify-center">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onChange(i)}
              className={cn(
                'relative h-20 w-20 rounded-xl overflow-hidden transition-all duration-200',
                i === index ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'ring-1 ring-white/40 hover:ring-white/60'
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
   ─────────────────────────────────────────────────────────────
   0 photos → placeholder
   1 photo  → full-width hero
   2 photos → 50 / 50 split
   3 photos → large left + 2 stacked right
   4 photos → large left + right: 1 top + 2 bottom
   5+       → large left + 2×2 grid right  (+N badge on last)
════════════════════════════════════════════════════════════════ */
function DesktopGallery({
  photos,
  onOpen,
}: {
  photos: Photo[];
  onOpen: (i: number) => void;
}) {
  const n = photos.length;

  /* shared classes */
  const cell = 'relative cursor-pointer group bg-slate-100 overflow-hidden';
  const img = (p: Photo, i: number, sizes = '50vw') => (
    <Image src={p.url} alt="" fill sizes={sizes} priority={i === 0}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
  );
  const dim = 'absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200';

  /* ── 0 ── */
  if (n === 0) return (
    <div className="h-[480px] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
      <Car className="h-20 w-20 text-slate-200" strokeWidth={1.2} />
    </div>
  );

  /* ── 1 ── */
  if (n === 1) return (
    <div className="h-[480px] rounded-2xl overflow-hidden">
      <div className={cn(cell, 'w-full h-full')} onClick={() => onOpen(0)}>
        {img(photos[0], 0, '100vw')}
        <div className={dim} />
      </div>
    </div>
  );

  /* ── 2 ── */
  if (n === 2) return (
    <div className="h-[480px] rounded-2xl overflow-hidden grid grid-cols-2 gap-2">
      {photos.map((p, i) => (
        <div key={p.id} className={cell} onClick={() => onOpen(i)}>
          {img(p, i)} <div className={dim} />
        </div>
      ))}
    </div>
  );

  /* ── 3 ── */
  if (n === 3) return (
    <div className="h-[480px] rounded-2xl overflow-hidden grid grid-cols-2 gap-2">
      {/* main */}
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      {/* right col */}
      <div className="grid grid-rows-2 gap-2">
        {[1, 2].map(i => (
          <div key={photos[i].id} className={cell} onClick={() => onOpen(i)}>
            {img(photos[i], i)} <div className={dim} />
          </div>
        ))}
      </div>
    </div>
  );

  /* ── 4 ── */
  if (n === 4) return (
    <div className="h-[480px] rounded-2xl overflow-hidden grid grid-cols-2 gap-2">
      {/* main */}
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      {/* right col: 1 full + 2 halves */}
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

  /* ── 5+ — Airbnb classic ── */
  return (
    <div className="h-[480px] rounded-2xl overflow-hidden grid grid-cols-2 gap-2">
      {/* main */}
      <div className={cn(cell, 'row-span-2')} onClick={() => onOpen(0)}>
        {img(photos[0], 0)} <div className={dim} />
      </div>
      {/* 2×2 right */}
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {[1, 2, 3, 4].map(i => {
          const isLast = i === 4;
          const hasMore = isLast && n > 5;
          return (
            <div key={photos[i]?.id ?? i} className={cell}
              onClick={() => onOpen(Math.min(i, n - 1))}>
              {photos[i] && img(photos[i], i, '25vw')}
              <div className={dim} />
              {hasMore && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-[12px] font-bold text-slate-800 shadow">
                    <Images className="w-3.5 h-3.5" strokeWidth={2} />
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
   MOBILE GALLERY — slider + thumbnails
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
    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
      <Car className="h-14 w-14 text-slate-200" strokeWidth={1.2} />
    </div>
  );

  return (
    <div className="space-y-2.5">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
        <Image src={photos[activeIndex].url} alt="" fill priority sizes="100vw"
          className="object-cover cursor-pointer" onClick={onOpen} />

        {photos.length > 1 && (
          <>
            <button type="button" onClick={onPrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-slate-800" strokeWidth={2.5} />
            </button>
            <button type="button" onClick={onNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-slate-800" strokeWidth={2.5} />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="text-[11px] font-semibold text-white tabular-nums">
                {activeIndex + 1}/{photos.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip — only when > 1 photo */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => onThumb(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-11 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === activeIndex
                  ? 'border-emerald-400 shadow-sm shadow-emerald-400/30'
                  : 'border-transparent opacity-50 hover:opacity-80',
              )}>
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

      <div className="space-y-5">

        {/* ── Mobile gallery ───────────────────────────────────── */}
        <div className="lg:hidden space-y-2.5">
          {/* Badges + actions row */}
          <div className="flex items-center gap-2">
            {vehicle.statut === 'VERIFIE' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1">
                <Shield className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
              </span>
            )}
            <div className="ml-auto flex gap-1.5">
              {/* Bouton partage supprimé */}
            </div>
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

        {/* ── Desktop gallery ──────────────────────────────────── */}
        <div className="hidden lg:block relative">
          <DesktopGallery
            photos={photos}
            onOpen={i => { setActiveIndex(i); setLightboxOpen(true); }}
          />

          {/* Overlay: badges */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            {vehicle.statut === 'VERIFIE' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
              </span>
            )}
          </div>

          {/* Overlay: action buttons supprimées */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {/* Espace vide */}
          </div>

        </div>

        {/* ── Title block ─────────────────────────────────────── */}
        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-700">
              {TYPE_LABELS[vehicle.type] ?? vehicle.type}
            </span>
            {vehicle.annee && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-700">
                {vehicle.annee}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight text-slate-900 leading-[1.1]">
                {vehicle.marque}{' '}
                <span className="text-emerald-500">{vehicle.modele}</span>
              </h1>

              {/* Mobile: Information Cards */}
              <div className="lg:hidden space-y-3 mt-4">
                {/* Location Card */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Localisation</p>
                    <p className="text-[14px] font-bold text-slate-900 leading-tight">
                      {vehicle.ville}
                    </p>
                    {vehicle.adresse && (
                      <p className="text-[13px] text-slate-600 font-medium mt-0.5 truncate">
                        {vehicle.adresse}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Rating */}
                  {vehicle.note > 0 && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Note</p>
                        <p className="text-[18px] font-black text-slate-900 leading-none tabular-nums">
                          {Number(vehicle.note).toFixed(1)}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {vehicle.totalAvis} avis
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {vehicle.totalLocations > 0 && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-slate-600" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Locations</p>
                        <p className="text-[18px] font-black text-slate-900 leading-none tabular-nums">
                          {vehicle.totalLocations}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {vehicle.totalLocations > 1 ? 'Réservations' : 'Réservation'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-2 border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700/60 mb-1">
                        Tarif de base
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[32px] font-black text-emerald-600 tabular-nums leading-none tracking-tight">
                          {formatPrice(Math.round(Number(vehicle.prixParJour) * 1.15))}
                        </span>
                        <span className="text-[14px] font-bold text-emerald-700/60">FCFA</span>
                      </div>
                      <p className="text-[12px] font-bold text-emerald-700/60 mt-1">/jour</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: Inline info */}
              <div className="hidden lg:flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                  {vehicle.ville}{vehicle.adresse ? `, ${vehicle.adresse}` : ''}
                </span>
                {vehicle.note > 0 && (
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                    {Number(vehicle.note).toFixed(1)}
                    <span className="font-medium text-slate-600">({vehicle.totalAvis} avis)</span>
                  </span>
                )}
                {vehicle.totalLocations > 0 && (
                  <span className="text-[13px] text-slate-700 font-semibold">
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