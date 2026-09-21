'use client';

import React from 'react';
import Image from 'next/image';
import {
  Car,
  MapPin,
  ExternalLink,
  Lock,
  Gauge,
  Fuel,
  Users,
  Wind,
  Hash,
  Star,
  Compass,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantVehicleSpecsCardProps {
  booking: TenantReservationDetailData;
}

const FALLBACK_CAR = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

export const TenantVehicleSpecsCard: React.FC<TenantVehicleSpecsCardProps> = ({ booking }) => {
  const v = booking.vehicule as any;
  const statut = booking.statut?.toUpperCase() ?? '';

  const resolvePhoto = (vehicule: any): string => {
    if (!vehicule) return FALLBACK_CAR;
    const first = vehicule?.photos?.[0];
    if (typeof first === 'string' && first) return first;
    if (first && typeof first === 'object' && first?.url) return first.url;
    if (vehicule?.photoUrl) return vehicule.photoUrl;
    if (vehicule?.image) return vehicule.image;
    if (vehicule?.imageUrl) return vehicule.imageUrl;
    return FALLBACK_CAR;
  };

  /**
   * Règle de confidentialité de l'adresse précise (24h avant le début)
   */
  const canShowAddress = (() => {
    if (['ANNULEE', 'TERMINEE'].includes(statut)) return false;
    if (['EN_COURS', 'LITIGE'].includes(statut)) return true;
    if (statut === 'CONFIRMEE' && booking.dateDebut) {
      const debut = new Date(booking.dateDebut).getTime();
      const diffHours = (debut - Date.now()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }
    return false;
  })();

  const rawAddress = booking.adresseLivraison || v?.adresse || v?.ville || 'Dakar, Sénégal';
  const displayLocationText = canShowAddress
    ? rawAddress
    : `${v?.ville || 'Dakar'} (Quartier communiqué 24h avant)`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    canShowAddress ? rawAddress : `${v?.ville || 'Dakar'}, Sénégal`
  )}`;

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    canShowAddress ? rawAddress : `${v?.ville || 'Dakar'}, Sénégal`
  )}`;

  const transmissionLabel = v?.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle';
  const fuelLabel = v?.carburant === 'ESSENCE'
    ? 'Essence'
    : v?.carburant === 'DIESEL'
    ? 'Diesel'
    : v?.carburant === 'HYBRIDE'
    ? 'Hybride'
    : v?.carburant || 'Essence';

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5 text-[#041912]">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#0A3D2E] flex items-center justify-center shrink-0 shadow-xs">
            <Car className="w-5 h-5 text-[#0A3D2E]" />
          </div>
          <div>
            <h3
              className="font-fraunces text-xl text-[#041912] font-normal tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              Fiche technique du véhicule
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Spécifications, immatriculation & géolocalisation
            </p>
          </div>
        </div>

        {v?.annee && (
          <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs">
            Modèle {v.annee}
          </span>
        )}
      </div>

      {/* Grid Contenu : Visual & Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Photo & Titre Véhicule */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50 flex flex-col justify-between p-3.5 space-y-3">
          <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
            <Image
              src={resolvePhoto(v)}
              alt={`${v?.marque || ''} ${v?.modele || ''}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>

          <div>
            <p
              className="font-fraunces text-xl text-[#041912] font-normal tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
            >
              {v?.marque} <span className="text-[#0A3D2E] font-normal">{v?.modele}</span>
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {v?.type && (
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-200/70 px-2 py-0.5 rounded-md">
                  {v.type}
                </span>
              )}
              {v?.noteVehicule != null && (
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {Number(v.noteVehicule).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Spécifications du Véhicule */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Boîte */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#0A3D2E]" />
                <span
                  className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Boîte de vitesse
                </span>
              </div>
              <p
                className="font-fraunces text-base font-normal text-[#041912] tracking-tight"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                {transmissionLabel}
              </p>
            </div>

            {/* Carburant */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                <span
                  className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Carburant
                </span>
              </div>
              <p
                className="font-fraunces text-base font-normal text-[#041912] tracking-tight"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                {fuelLabel}
              </p>
            </div>

            {/* Places */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span
                  className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Capacité
                </span>
              </div>
              <p
                className="font-fraunces text-base font-normal text-[#041912] tracking-tight"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                {v?.nbPlaces || 5} places
              </p>
            </div>

            {/* Climatisation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-600" />
                <span
                  className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Climatisation
                </span>
              </div>
              <p
                className="font-fraunces text-base font-normal text-[#041912] tracking-tight"
                style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
              >
                {v?.climatisation !== false ? 'Oui (Climatisé)' : 'Non'}
              </p>
            </div>

            {/* Immatriculation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 col-span-2 sm:col-span-2">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-700" />
                <span
                  className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Plaque d’immatriculation
                </span>
              </div>
              {v?.immatriculation ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-300 font-mono font-black text-xs text-slate-900 tracking-wider shadow-2xs">
                  <span className="text-emerald-700 font-extrabold">SN</span>
                  <span className="text-slate-300">|</span>
                  <span>{v.immatriculation}</span>
                </div>
              ) : (
                <p
                  className="font-fraunces text-sm text-slate-500 font-normal italic tracking-tight"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                >
                  Communiquée au check-in
                </p>
              )}
            </div>
          </div>

          {/* Bloc Géolocalisation & Itinéraire */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <p
                    className="font-fraunces text-xs text-slate-500 font-normal tracking-tight"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    {booking.adresseLivraison ? 'Adresse de livraison' : 'Lieu de prise en charge'}
                  </p>
                  <p
                    className="font-fraunces text-base font-normal text-[#041912] tracking-tight leading-snug mt-0.5"
                    style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
                  >
                    {displayLocationText}
                  </p>
                  {!canShowAddress && (
                    <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/90 text-amber-900 text-[11px] font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Adresse exacte débloquée 24h avant la prise en charge</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'itinéraire Maps & Waze */}
            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-sans font-extrabold text-xs tracking-wide hover:bg-[#0F4F3B] transition-all cursor-pointer shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-[#F1DFB6]" />
                <span>Ouvrir Google Maps</span>
              </a>

              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-700 text-white font-sans font-extrabold text-xs tracking-wide hover:bg-cyan-800 transition-all cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Ouvrir dans Waze</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
