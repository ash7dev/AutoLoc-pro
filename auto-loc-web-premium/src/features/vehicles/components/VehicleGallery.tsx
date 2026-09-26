'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff, Maximize2 } from 'lucide-react';
import { VehicleGalleryModal } from './VehicleGalleryModal';

interface VehicleGalleryProps {
  images?: string[];
  title?: string;
  vehicleType?: string;
}

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

export const VehicleGallery: React.FC<VehicleGalleryProps> = ({
  images = [],
  title = 'Véhicule',
  vehicleType,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Filtrer uniquement les URLs d'images valides
  const validImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  const total = validImages.length;
  const hasMany = total > 1;
  const current = Math.min(activeIndex, Math.max(total - 1, 0));

  const goTo = (index: number) => setActiveIndex((index + total) % total);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Garde la vignette active centrée dans le rail
  useEffect(() => {
    const rail = thumbsRef.current;
    const thumb = rail?.children[current] as HTMLElement | undefined;
    if (!rail || !thumb) return;
    rail.scrollTo({
      left: thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: 'smooth',
    });
  }, [current]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMany) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMany) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) prev();
    else next();
  };

  // Cas sans photo disponible
  if (total === 0) {
    return (
      <div className="w-full aspect-[16/10] md:aspect-[16/8] rounded-[28px] bg-[#F4F2EC] border border-[#E7E2D3] flex flex-col items-center justify-center p-8 text-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: FOREST, color: CHAMPAGNE }}
        >
          <ImageOff className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg text-slate-900 font-display">Pas encore de photos</h3>
          <p className="text-sm text-slate-500 mt-1">
            Le propriétaire n'a pas encore ajouté de visuels pour ce véhicule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" onKeyDown={handleKeyDown}>
      {/* ── Image principale ───────────────────────────────────────────── */}
      <div
        tabIndex={hasMany ? 0 : -1}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
        onClick={() => setModalOpen(true)}
        aria-label={`Photos de ${title}`}
        className="group relative w-full aspect-[4/3] md:aspect-[16/8] rounded-[28px] overflow-hidden cursor-zoom-in select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-main"
        style={{ backgroundColor: FOREST }}
      >
        {validImages.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={`${title} - Photo ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 1100px"
            aria-hidden={i !== current}
            draggable={false}
            unoptimized
            className={`object-cover transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.02] ${i === current ? 'opacity-100' : 'opacity-0'
              }`}
          />
        ))}

        {/* Voile léger en bas pour la lisibilité du dock */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

        {/* Type de véhicule */}
        {vehicleType && (
          <span
            className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border pointer-events-none"
            style={{
              backgroundColor: `${FOREST}CC`,
              color: CHAMPAGNE,
              borderColor: `${CHAMPAGNE}26`,
            }}
          >
            {vehicleType}
          </span>
        )}

        {/* Dock : même langage que la barre de navigation mobile */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-full backdrop-blur-md border shadow-lg cursor-default"
          style={{ backgroundColor: `${FOREST}E6`, borderColor: `${CHAMPAGNE}26` }}
        >
          {hasMany && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Photo précédente"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                style={{ color: CHAMPAGNE }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span
                className="min-w-[3.75rem] text-center text-sm font-display tabular-nums"
                style={{ color: CHAMPAGNE }}
                aria-live="polite"
              >
                {current + 1} / {total}
              </span>

              <button
                type="button"
                onClick={next}
                aria-label="Photo suivante"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                style={{ color: CHAMPAGNE }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <span className="w-px h-5 mx-1" style={{ backgroundColor: `${CHAMPAGNE}33` }} />
            </>
          )}

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="Voir en plein écran"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
            style={{ backgroundColor: CHAMPAGNE, color: FOREST }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Rail de vignettes (tablette et desktop) ────────────────────── */}
      {hasMany && (
        <div
          ref={thumbsRef}
          className="relative hidden md:flex gap-2.5 mt-3 px-1.5 py-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {validImages.map((src, i) => {
            const isActive = i === current;
            return (
              <button
                key={`${src}-thumb-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-current={isActive}
                className={`relative shrink-0 w-24 aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-main ${isActive
                    ? 'ring-2 ring-offset-2 ring-brand-main opacity-100'
                    : 'opacity-55 hover:opacity-100'
                  }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="96px"
                  draggable={false}
                  unoptimized
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Modale plein écran ─────────────────────────────────────────── */}
      <VehicleGalleryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={validImages}
        initialIndex={current}
        vehicleTitle={title}
      />
    </div>
  );
};