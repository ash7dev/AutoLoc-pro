'use client';

import React from 'react';
import Image from 'next/image';
import {
  Car,
  Check,
  CheckCircle2,
  Cog,
  Compass,
  Fuel,
  Hash,
  MapPin,
  Navigation,
  Plane,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  Wind,
} from 'lucide-react';
import { ReservationVehicle } from '@/src/core/api/reservationsApi';

export interface OwnerVehicleDetailsCardProps {
  vehicule: ReservationVehicle;
  adresseLivraison?: string | null;
  statut?: string;
}

const FALLBACK_CAR = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

const FUEL_LABELS: Record<string, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Électrique',
};

/* Composant d'affichage d'une caractéristique technique */
const SpecItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ icon, label, className = '', children }) => (
  <div className={`border-t border-slate-100 pt-3.5 ${className}`}>
    <dt className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
      <span className="text-[#0A3D2E]">{icon}</span>
      {label}
    </dt>
    <dd className="mt-1 font-fraunces text-base sm:text-lg font-normal leading-snug text-slate-900">
      {children}
    </dd>
  </div>
);

export const OwnerVehicleDetailsCard: React.FC<OwnerVehicleDetailsCardProps> = ({
  vehicule,
  adresseLivraison,
}) => {
  const v = vehicule as any;

  const resolvePhoto = (vData: any): string => {
    if (!vData) return FALLBACK_CAR;
    const first = vData?.photos?.[0];
    if (typeof first === 'string' && first) return first;
    if (first && typeof first === 'object' && first?.url) return first.url;
    if (vData?.photoUrl) return vData.photoUrl;
    if (vData?.image) return vData.image;
    if (vData?.imageUrl) return vData.imageUrl;
    return FALLBACK_CAR;
  };

  const photoUrl = resolvePhoto(v);
  const brand = v?.marque || 'Véhicule';
  const model = v?.modele || '';
  const year = v?.annee || '';
  const category = v?.type || 'Véhicule Hôte';

  const transmissionLabel = v?.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle';
  const fuelLabel = FUEL_LABELS[String(v?.carburant)?.toUpperCase()] ?? v?.carburant ?? 'Essence';
  const seats = v?.nbPlaces ?? v?.nombrePlaces ?? 5;
  const immat = v?.immatriculation || 'Non renseignée';

  const rawAddress = adresseLivraison || v?.adresse || v?.ville || 'Dakar, Sénégal';
  const mapsQuery = encodeURIComponent(rawAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${mapsQuery}`;

  return (
    <div className="space-y-6 rounded-3xl bg-white p-5 text-slate-900 shadow-sm border border-slate-200/90 sm:p-6">
      {/* ── En-tête de la carte ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#F1DFB6]">
          <Car className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h3 className="font-fraunces text-xl font-normal leading-tight tracking-tight text-[#041912]">
            Détails du véhicule hôte
          </h3>
          <p className="text-xs text-slate-500 font-medium">Fiche technique et localisation du véhicule</p>
        </div>
      </div>

      {/* ── Contenu Photo & Spécifications ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Photo principale & Nom */}
        <div className="md:col-span-2 space-y-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80">
            <img
              src={photoUrl}
              alt={`${brand} ${model}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h4 className="font-fraunces text-2xl font-normal leading-tight tracking-tight text-[#041912]">
              {brand} <span className="text-[#0A3D2E] font-bold">{model}</span>
            </h4>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 font-medium">
              {year && <span>Année {year}</span>}
              {year && category && <span className="h-3 w-px bg-slate-200" aria-hidden />}
              {category && <span>{category}</span>}
            </div>
          </div>
        </div>

        {/* Grille des caractéristiques */}
        <dl className="grid grid-cols-2 content-start gap-x-5 gap-y-3.5 sm:grid-cols-3 md:col-span-3">
          <SpecItem icon={<Cog className="h-4 w-4" aria-hidden />} label="Boîte de vitesse">
            {transmissionLabel}
          </SpecItem>
          <SpecItem icon={<Fuel className="h-4 w-4" aria-hidden />} label="Carburant">
            {fuelLabel}
          </SpecItem>
          <SpecItem icon={<Users className="h-4 w-4" aria-hidden />} label="Capacité">
            {seats} places
          </SpecItem>
          <SpecItem icon={<Wind className="h-4 w-4" aria-hidden />} label="Climatisation">
            {v?.climatisation !== false ? 'Oui' : 'Non'}
          </SpecItem>

          <SpecItem
            icon={<Hash className="h-4 w-4" aria-hidden />}
            label="Plaque d'immatriculation"
            className="col-span-2 sm:col-span-2"
          >
            {immat !== 'Non renseignée' ? (
              <span className="inline-flex items-stretch overflow-hidden rounded-md bg-white ring-1 ring-slate-300 shadow-2xs">
                <span className="flex items-center bg-[#0A3D2E] px-2 font-sans text-[10px] font-bold text-[#F1DFB6]">
                  SN
                </span>
                <span className="px-3 py-1 font-mono text-sm font-bold tracking-wider text-slate-900">
                  {immat}
                </span>
              </span>
            ) : (
              <span className="text-sm italic text-slate-500">Non renseignée</span>
            )}
          </SpecItem>
        </dl>
      </div>

      {/* ── Options, Services & Modalités de Livraison ───────────────────── */}
      <div className="rounded-2xl border border-[#0A3D2E]/10 bg-[#0A3D2E]/[0.03] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#0A3D2E]" />
          <h4 className="font-fraunces text-base font-normal text-[#041912] tracking-tight">
            Options & Services souscrits
          </h4>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {/* Option Livraison */}
          {adresseLivraison?.toLowerCase().includes('aibd') ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] text-xs font-bold shadow-2xs">
              <Plane className="w-3.5 h-3.5 text-emerald-600" />
              <span>Livraison Aéroport AIBD</span>
            </span>
          ) : adresseLivraison ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] text-xs font-bold shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Livraison à Domicile / Dakar</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Retrait au parking hôte</span>
            </span>
          )}

          {/* Option Chauffeur */}
          {(v?.avecChauffeur || v?.chauffeurInclus) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Option Chauffeur Privé Inclus</span>
            </span>
          )}

          {/* Zone de Conduite */}
          {v?.horsDakar ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] text-xs font-bold shadow-2xs">
              <Navigation className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Autorisation Trajet Hors Dakar</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Périmètre Dakar Intramuros</span>
            </span>
          )}

          {/* Forfait Kilométrique */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kilométrage illimité inclus</span>
          </span>
        </div>
      </div>

      {/* ── Bloc Lieu & Itinéraire ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200/90 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#F1DFB6]">
            <MapPin className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium">
              {adresseLivraison ? 'Lieu de livraison convenu' : 'Adresse de stationnement / remise'}
            </p>
            <p className="mt-0.5 font-fraunces text-base sm:text-lg font-normal leading-snug text-[#041912]">
              {rawAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs hover:bg-[#0F4F3B] transition-colors cursor-pointer shadow-2xs"
          >
            <Compass className="h-4 w-4" aria-hidden />
            <span>Google Maps</span>
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 text-[#0A3D2E] font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Navigation className="h-4 w-4" aria-hidden />
            <span>Waze</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Export alternatif pour compatibilité
export { OwnerVehicleDetailsCard as VehicleDetailsCard };
