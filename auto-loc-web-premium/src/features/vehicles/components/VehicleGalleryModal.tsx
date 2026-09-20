'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';

interface VehicleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  vehicleTitle?: string;
}

export const VehicleGalleryModal: React.FC<VehicleGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  vehicleTitle = 'Véhicule de prestige',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Écouteur des touches clavier (Échap, Flèche Gauche, Flèche Droite)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Empêcher le défilement du body pendant l'ouverture de la modale
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between text-white animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Galerie photo - ${vehicleTitle}`}
    >
      {/* 1. Bar supérieure (Titre, Compteur, Bouton Fermer) */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 z-10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white font-display line-clamp-1">
              {vehicleTitle}
            </h2>
            <p className="text-xs text-slate-400">
              Photo {currentIndex + 1} sur {images.length}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Fermer la galerie"
          title="Fermer (Échap)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Zone d'affichage centrale de la photo */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 select-none">
        {/* Bouton Précédent */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
          </button>
        )}

        {/* Photo principale */}
        <div className="relative w-full max-w-5xl h-[55vh] sm:h-[65vh] lg:h-[72vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <Image
            src={images[currentIndex]}
            alt={`${vehicleTitle} - Photo ${currentIndex + 1}`}
            fill
            priority
            className="object-contain"
            sizes="(max-width: 1280px) 100vw, 1280px"
            unoptimized
          />
        </div>

        {/* Bouton Suivant */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
          </button>
        )}
      </div>

      {/* 3. Bandeau inférieur de vignettes (Thumbnails) */}
      {images.length > 1 && (
        <div className="p-4 sm:p-6 border-t border-white/10 bg-black/40">
          <div className="max-w-5xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-2 justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 sm:w-20 sm:h-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  idx === currentIndex
                    ? 'border-emerald-400 scale-105 shadow-lg shadow-emerald-500/20 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={img}
                  alt={`Vignette ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
