"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Car, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  url: string;
  estPrincipale?: boolean;
}

interface VehiclePhotoGalleryProps {
  photos: Photo[];
  marque: string;
  modele: string;
}

export function VehiclePhotoGallery({ photos, marque, modele }: VehiclePhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trouver la photo principale et la mettre en premier
  const sortedPhotos = photos.length > 0
    ? [
        ...photos.filter(p => p.estPrincipale),
        ...photos.filter(p => !p.estPrincipale)
      ]
    : [];

  const currentPhoto = sortedPhotos[currentIndex];
  const hasPhotos = sortedPhotos.length > 0;
  const hasMultiplePhotos = sortedPhotos.length > 1;

  const goToNext = () => {
    if (currentIndex < sortedPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < sortedPhotos.length - 1) {
      goToNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[280px] lg:h-full bg-slate-100 overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {hasPhotos ? (
        <>
          {/* Photo actuelle */}
          <Image
            src={currentPhoto.url}
            alt={`${marque} ${modele} - Photo ${currentIndex + 1}`}
            fill
            priority={currentIndex === 0}
            className="object-cover transition-opacity duration-300"
          />

          {/* Navigation arrows - desktop only */}
          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className={cn(
                  "hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-10",
                  "w-10 h-10 rounded-full items-center justify-center",
                  "bg-black/50 backdrop-blur-sm border border-white/20",
                  "text-white transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  currentIndex === 0
                    ? "cursor-not-allowed opacity-0"
                    : "hover:bg-black/70 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex === sortedPhotos.length - 1}
                className={cn(
                  "hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 z-10",
                  "w-10 h-10 rounded-full items-center justify-center",
                  "bg-black/50 backdrop-blur-sm border border-white/20",
                  "text-white transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  currentIndex === sortedPhotos.length - 1
                    ? "cursor-not-allowed opacity-0"
                    : "hover:bg-black/70 hover:scale-110 active:scale-95"
                )}
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Indicateurs de position */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm">
              {sortedPhotos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-200",
                    idx === currentIndex
                      ? "bg-white w-5"
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Voir photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Badge nombre de photos */}
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-sm px-2.5 py-1.5 text-[11px] font-bold text-white">
            <ImageIcon className="w-3 h-3" strokeWidth={2} />
            {currentIndex + 1} / {sortedPhotos.length}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <Car className="w-12 h-12 text-slate-300" strokeWidth={1} />
          <p className="text-[11px] text-slate-400 font-medium">Aucune photo</p>
        </div>
      )}
    </div>
  );
}
