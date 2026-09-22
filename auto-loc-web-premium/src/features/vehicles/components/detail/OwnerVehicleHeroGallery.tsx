'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  FileEdit,
  Archive,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { Vehicle } from '../../types/vehicle.types';
import { formatCurrency } from '@/lib/utils';

export interface OwnerVehicleHeroGalleryProps {
  vehicle: Vehicle;
}

const getStatusBadge = (statut?: string) => {
  const s = (statut || '').toUpperCase();
  if (s === 'VERIFIE' || s === 'DISPONIBLE') {
    return {
      label: 'Annonce Vérifiée & Publiée',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      icon: CheckCircle2,
    };
  }
  if (s === 'EN_ATTENTE_VALIDATION') {
    return {
      label: 'En attente de validation AutoLoc',
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      icon: Clock,
    };
  }
  if (s === 'BROUILLON') {
    return {
      label: 'Brouillon en cours',
      bg: 'bg-slate-500/20 border-slate-400/30 text-slate-300',
      icon: FileEdit,
    };
  }
  if (s === 'ARCHIVE') {
    return {
      label: 'Annonce Archivée',
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      icon: Archive,
    };
  }
  return {
    label: statut || 'Statut Inconnu',
    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    icon: Sparkles,
  };
};

export const OwnerVehicleHeroGallery: React.FC<OwnerVehicleHeroGalleryProps> = ({ vehicle }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const photos = (vehicle.photos || []).map((p: any) => (typeof p === 'string' ? p : p.url));

  // Fallback to vehicle.images or default placeholder if no photos
  const displayPhotos =
    photos.length > 0
      ? photos
      : (vehicle as any).images && (vehicle as any).images.length > 0
      ? (vehicle as any).images
      : ['/images/placeholder-car.jpg'];

  const badge = getStatusBadge(vehicle.statut);
  const BadgeIcon = badge.icon;
  const marque = vehicle.marque || '';
  const modele = vehicle.modele || '';
  const annee = vehicle.annee ? `(${vehicle.annee})` : '';

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-[#041912] shadow-xl text-white">
        {/* Mobile View: Single Image Carousel with Overlay Info */}
        <div className="relative h-72 w-full sm:hidden">
          <Image
            src={displayPhotos[activePhotoIndex]}
            alt={`${marque} ${modele}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041912] via-[#041912]/20 to-transparent" />

          {/* Top Status & Price Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${badge.bg}`}
            >
              <BadgeIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{badge.label}</span>
            </span>

            <span className="rounded-full bg-[#0A3D2E]/90 border border-[#059669]/40 px-3 py-1 text-xs font-bold text-[#F1DFB6] backdrop-blur-md shadow-xs">
              {formatCurrency(vehicle.prixParJour || 0)} / j
            </span>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="font-fraunces text-2xl font-normal leading-tight text-white">
                {marque} {modele} <span className="text-sm font-sans text-emerald-300/80">{annee}</span>
              </h2>
              {vehicle.immatriculation && (
                <span className="mt-1 inline-block font-mono text-xs font-semibold text-[#4ADE80] bg-[#041912]/80 px-2 py-0.5 rounded border border-[#4ADE80]/30">
                  {vehicle.immatriculation}
                </span>
              )}
            </div>

            {displayPhotos.length > 1 && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-[#041912]/80 border border-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                <Camera className="h-3.5 w-3.5 text-[#4ADE80]" />
                <span>{displayPhotos.length} photos</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop View: Bento Grid Luxe */}
        <div className="hidden sm:block">
          <div className="relative grid grid-cols-3 gap-2 p-3 lg:gap-3 lg:p-4 h-[380px] lg:h-[440px]">
            {/* Photo Principale Grand Format (2 colonnes) */}
            <div
              className="relative col-span-2 h-full overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => {
                setActivePhotoIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <Image
                src={displayPhotos[0]}
                alt={`${marque} ${modele}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041912]/80 via-transparent to-black/20" />

              {/* Status Badge Desktop Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${badge.bg}`}
                >
                  <BadgeIcon className="h-4 w-4 shrink-0" />
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Bottom Title Desktop Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="space-y-1">
                  <h1 className="font-fraunces text-3xl lg:text-4xl font-normal leading-tight text-white">
                    {marque} <span className="text-[#4ADE80] font-normal">{modele}</span>{' '}
                    <span className="text-lg font-sans text-slate-300 font-light">{annee}</span>
                  </h1>
                  <div className="flex items-center gap-3">
                    {vehicle.immatriculation && (
                      <span className="font-mono text-xs font-bold text-[#4ADE80] bg-[#0A3D2E]/90 px-2.5 py-0.5 rounded-md border border-[#059669]/50 tracking-wider">
                        {vehicle.immatriculation}
                      </span>
                    )}
                    {vehicle.ville && (
                      <span className="text-xs font-medium text-slate-300">📍 {vehicle.ville}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors"
                >
                  <Eye className="h-4 w-4 text-[#4ADE80]" />
                  <span>Agrandir la galerie</span>
                </button>
              </div>
            </div>

            {/* Galerie Secondaire (1 colonne avec 2 sous-photos) */}
            <div className="col-span-1 grid grid-rows-2 gap-2 lg:gap-3 h-full">
              {displayPhotos.slice(1, 3).map((imgUrl: string, idx: number) => (
                <div
                  key={idx}
                  className="relative h-full overflow-hidden rounded-2xl cursor-pointer group"
                  onClick={() => {
                    setActivePhotoIndex(idx + 1);
                    setIsLightboxOpen(true);
                  }}
                >
                  <Image
                    src={imgUrl}
                    alt={`${marque} ${modele} preview ${idx + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                  {/* Icon view overlay */}
                  {idx === 1 && displayPhotos.length > 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#041912]/60 backdrop-blur-xs font-fraunces text-lg font-normal text-[#F1DFB6]">
                      +{displayPhotos.length - 3} photos
                    </div>
                  )}
                </div>
              ))}

              {/* Si une seule photo principale existe, remplir le slot secondaire proprement */}
              {displayPhotos.length < 2 && (
                <div className="relative row-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#059669]/30 bg-[#0A3D2E]/20 p-6 text-center text-slate-400">
                  <Camera className="h-8 w-8 text-[#059669]/60 mb-2" />
                  <span className="text-xs font-medium text-slate-300">Aucune photo secondaire</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative max-h-[85vh] max-w-[90vw] w-full h-full flex flex-col items-center justify-center">
              <div className="relative h-[70vh] w-full">
                <Image
                  src={displayPhotos[activePhotoIndex]}
                  alt="Agrandissement"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Contrôles de navigation */}
              {displayPhotos.length > 1 && (
                <div className="mt-4 flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev === 0 ? displayPhotos.length - 1 : prev - 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <span className="text-xs font-semibold tracking-wider text-slate-400">
                    {activePhotoIndex + 1} / {displayPhotos.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIndex((prev) => (prev === displayPhotos.length - 1 ? 0 : prev + 1))
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
