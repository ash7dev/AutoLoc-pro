'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Camera,
  ShieldCheck,
  Eye,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Fuel,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { PhotoEtatLieu } from '../../hooks/useTenantReservationDetail';

interface TenantInspectionPhotosCardProps {
  photos?: PhotoEtatLieu[];
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

export const TenantInspectionPhotosCard: React.FC<TenantInspectionPhotosCardProps> = ({
  photos = [],
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHECKIN' | 'CHECKOUT'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const checkinPhotos = useMemo(() => photos.filter((p) => p.type === 'CHECKIN'), [photos]);
  const checkoutPhotos = useMemo(() => photos.filter((p) => p.type === 'CHECKOUT'), [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeTab === 'CHECKIN') return checkinPhotos;
    if (activeTab === 'CHECKOUT') return checkoutPhotos;
    return photos;
  }, [activeTab, checkinPhotos, checkoutPhotos, photos]);

  const openLightbox = (photoId: string) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photoId);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5 text-[#041912]">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#0A3D2E] flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-5 h-5 text-[#0A3D2E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-fraunces text-xl text-[#041912] font-normal tracking-tight">
                  État des lieux & Inspection HD
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] font-extrabold text-[10px] uppercase tracking-wide">
                  Certifié Horodaté
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Photos d’inspection prises lors de la prise en charge et de la restitution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">
              {photos.length} photo{photos.length > 1 ? 's' : ''} HD
            </span>
          </div>
        </div>

        {/* Filtrage Tabs */}
        {photos.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#0A3D2E] text-[#F1DFB6] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              Toutes ({photos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CHECKIN')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                activeTab === 'CHECKIN'
                  ? 'bg-[#0A3D2E] text-[#F1DFB6] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              Prise en charge ({checkinPhotos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CHECKOUT')}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                activeTab === 'CHECKOUT'
                  ? 'bg-[#0A3D2E] text-[#F1DFB6] shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              Restitution ({checkoutPhotos.length})
            </button>
          </div>
        )}

        {/* Grid Photos */}
        {filteredPhotos.length === 0 ? (
          <div className="py-10 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200/90 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#0A3D2E] flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6 text-[#0A3D2E]" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucune photo d’état des lieux</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
              {activeTab === 'CHECKIN'
                ? 'Aucune photo prise lors de la prise en charge du véhicule.'
                : activeTab === 'CHECKOUT'
                ? 'Aucune photo prise lors de la restitution.'
                : 'Les photos d’état des lieux ajoutées par l’hôte ou vous-même apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => openLightbox(photo.id)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 shadow-2xs hover:shadow-md transition-all cursor-pointer"
              >
                <Image
                  src={photo.url}
                  alt={photo.categorie || 'Photo état des lieux'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />

                {/* Badge Type (CHECKIN / CHECKOUT) */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white shadow-xs border ${
                      photo.type === 'CHECKIN'
                        ? 'bg-emerald-600/90 border-emerald-400'
                        : 'bg-amber-600/90 border-amber-400'
                    }`}
                  >
                    {photo.type === 'CHECKIN' ? 'DÉPART' : 'RETOUR'}
                  </span>
                </div>

                {/* Bouton Agrandir / Zoom sur survol */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Légende Catégorie en bas */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6 text-white">
                  <p className="text-[11px] font-bold truncate capitalize leading-tight">
                    {CATEGORY_LABELS[photo.categorie || ''] || photo.categorie?.replace('_', ' ') || 'Photo d’inspection'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modale Plein Écran HD */}
      {selectedIndex !== null && filteredPhotos[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Top Bar Lightbox */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  filteredPhotos[selectedIndex].type === 'CHECKIN'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                }`}
              >
                {filteredPhotos[selectedIndex].type === 'CHECKIN' ? 'CHECK-IN (DÉPART)' : 'CHECK-OUT (RETOUR)'}
              </span>
              <div>
                <h4 className="font-bold text-sm text-white capitalize">
                  {CATEGORY_LABELS[filteredPhotos[selectedIndex].categorie || ''] ||
                    filteredPhotos[selectedIndex].categorie?.replace('_', ' ') ||
                    'Photo état des lieux HD'}
                </h4>
                <p className="text-xs text-white/60 font-medium">
                  Image {selectedIndex + 1} sur {filteredPhotos.length}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scène Principale Lightbox */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            {/* Bouton Nav Gauche */}
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image HD */}
            <div className="relative w-full h-full max-w-5xl max-h-[75vh]">
              <Image
                src={filteredPhotos[selectedIndex].url}
                alt="Inspection HD"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Bouton Nav Droite */}
            {filteredPhotos.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 z-10 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bande de Vignettes en Bas */}
          {filteredPhotos.length > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar max-w-4xl mx-auto w-full">
              {filteredPhotos.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all shrink-0 ${
                    idx === selectedIndex ? 'border-[#4ADE80] scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={p.url} alt="thumbnail" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
