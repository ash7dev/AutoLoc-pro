'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin, Star, Shield, ChevronLeft, ChevronRight,
  Car, Share2, Heart, Images, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props { vehicle: Vehicle }

/* ── Lightbox ─────────────────────────────────────────────────── */
function Lightbox({
  photos, index, onClose, onChange,
}: {
  photos: { id: string; url: string }[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/96 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/40 text-[13px] font-medium tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center px-14 md:px-24 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image src={photos[index].url} alt="" fill sizes="100vw" className="object-contain" />
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange(index > 0 ? index - 1 : photos.length - 1)}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => onChange(index < photos.length - 1 ? index + 1 : 0)}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}
      </div>

      <div
        className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-none flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'relative flex-shrink-0 w-16 h-11 rounded-xl overflow-hidden border-2 transition-all duration-200',
              i === index ? 'border-emerald-400 opacity-100' : 'border-transparent opacity-30 hover:opacity-60',
            )}
          >
            <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Hero ────────────────────────────────────────────────── */
export function VehicleDetailHero({ vehicle }: Props): React.ReactElement {
  const photos = vehicle.photos ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const activePhoto = photos[activeIndex]?.url ?? null;
  const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
  const next = () => setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

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
        {/* ── Photo display ──────────────────────────────────────── */}

        {/* Mobile: single slider */}
        <div className="lg:hidden space-y-2.5">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
            {activePhoto ? (
              <Image
                src={activePhoto}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                fill priority sizes="100vw"
                className="object-cover cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Car className="h-16 w-16 text-slate-200" strokeWidth={1.2} />
              </div>
            )}

            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              {vehicle.statut === 'VERIFIE' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1">
                  <Shield className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <button type="button" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors">
                <Share2 className="w-3.5 h-3.5 text-slate-700" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Heart className={cn('w-3.5 h-3.5 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-slate-700')} strokeWidth={2} />
              </button>
            </div>

            {photos.length > 1 && (
              <>
                <button type="button" onClick={prev} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <ChevronLeft className="w-4 h-4 text-slate-800" />
                </button>
                <button type="button" onClick={next} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <ChevronRight className="w-4 h-4 text-slate-800" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-[11px] font-semibold text-white tabular-nums">{activeIndex + 1}/{photos.length}</span>
                </div>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'relative flex-shrink-0 w-16 h-11 rounded-xl overflow-hidden border-2 transition-all duration-200',
                    i === activeIndex ? 'border-emerald-400 shadow-sm shadow-emerald-400/30' : 'border-transparent opacity-50 hover:opacity-80',
                  )}
                >
                  <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Airbnb grid */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-2xl overflow-hidden">
          {/* Main large photo — spans 2 cols + 2 rows */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer group bg-slate-100"
            onClick={() => { setActiveIndex(0); setLightboxOpen(true); }}
          >
            {photos[0] ? (
              <Image
                src={photos[0].url}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                fill priority sizes="50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Car className="h-20 w-20 text-slate-200" strokeWidth={1.2} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10">
              {vehicle.statut === 'VERIFIE' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-700" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Heart className={cn('w-4 h-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-slate-700')} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* 4 secondary photos */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative cursor-pointer group bg-slate-100 overflow-hidden"
              onClick={() => { setActiveIndex(i); setLightboxOpen(true); }}
            >
              {photos[i] ? (
                <Image
                  src={photos[i].url}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Car className="h-8 w-8 text-slate-200" strokeWidth={1.2} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-200" />

              {/* Show all on last */}
              {i === 4 && photos.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl text-[12px] font-bold text-slate-800 shadow-lg">
                    <Images className="w-3.5 h-3.5" strokeWidth={2} />
                    +{photos.length - 5} photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Title block ────────────────────────────────────────── */}
        <div className="pt-1">
          {/* Pill badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {TYPE_LABELS[vehicle.type] ?? vehicle.type}
            </span>
            {vehicle.annee && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {vehicle.annee}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-[28px] sm:text-[34px] font-black tracking-tight text-slate-900 leading-[1.1]">
                {vehicle.marque}{' '}
                <span className="text-emerald-500">{vehicle.modele}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                  {vehicle.ville}{vehicle.adresse ? `, ${vehicle.adresse}` : ''}
                </span>
                {vehicle.note > 0 && (
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                    {vehicle.note.toFixed(1)}
                    <span className="font-normal text-slate-400">({vehicle.totalAvis} avis)</span>
                  </span>
                )}
                {vehicle.totalLocations > 0 && (
                  <span className="text-[13px] text-slate-400 font-medium">{vehicle.totalLocations} locations</span>
                )}
              </div>
            </div>

            {/* Price visible on mobile only — desktop uses sidebar */}
            <div className="lg:hidden flex items-baseline gap-1.5 pt-1">
              <span className="text-[30px] font-black text-emerald-500 tabular-nums leading-none">
                {formatPrice(vehicle.prixParJour)}
              </span>
              <span className="text-[13px] font-semibold text-slate-400">FCFA/jour</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}