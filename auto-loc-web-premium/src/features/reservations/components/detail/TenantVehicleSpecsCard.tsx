'use client';

import React from 'react';
import Image from 'next/image';
import { Car, Cog, Compass, Fuel, Hash, Lock, MapPin, Navigation, Star, Users, Wind } from 'lucide-react';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantVehicleSpecsCardProps {
  booking: TenantReservationDetailData;
}

const FALLBACK_CAR = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

const FUEL_LABELS: Record<string, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  HYBRIDE: 'Hybride',
};

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main';

/* Une caractéristique : libellé discret, valeur en serif */
const Spec: React.FC<{
  icon: React.ReactNode;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ icon, label, className = '', children }) => (
  <div className={`border-t border-slate-100 pt-3 ${className}`}>
    <dt className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="text-brand-main/55">{icon}</span>
      {label}
    </dt>
    <dd className="mt-1.5 font-fraunces text-[17px] font-normal leading-snug text-slate-900">
      {children}
    </dd>
  </div>
);

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
  const displayLocationText = canShowAddress ? rawAddress : v?.ville || 'Dakar';

  const mapsQuery = encodeURIComponent(canShowAddress ? rawAddress : `${v?.ville || 'Dakar'}, Sénégal`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${mapsQuery}`;

  const transmissionLabel = v?.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle';
  const fuelLabel = FUEL_LABELS[String(v?.carburant)] ?? v?.carburant ?? 'Essence';
  const seats = v?.nbPlaces ?? v?.nombrePlaces ?? 5;
  const hasNote = v?.noteVehicule != null;

  const linkBase =
    'inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors duration-200 motion-reduce:transition-none sm:flex-none';

  return (
    <div className="space-y-6 rounded-3xl bg-white p-5 text-slate-900 shadow-[0_1px_2px_rgba(10,61,46,0.06),0_12px_28px_-16px_rgba(10,61,46,0.28)] ring-1 ring-slate-900/[0.06] sm:p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-main text-champagne">
          <Car className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </div>
        <div>
          <h3 className="font-fraunces text-xl font-normal leading-tight tracking-tight text-slate-900">
            Fiche technique
          </h3>
          <p className="text-xs text-slate-500">Caractéristiques et lieu de prise en charge</p>
        </div>
      </div>

      {/* Véhicule + caractéristiques */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Photo et titre */}
        <div className="md:col-span-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-900/[0.06]">
            <Image
              src={resolvePhoto(v)}
              alt={`${v?.marque || ''} ${v?.modele || ''}`.trim() || 'Véhicule'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>

          <div className="mt-4">
            <p className="font-fraunces text-2xl font-normal leading-tight tracking-tight text-slate-900">
              {v?.marque} <span className="text-brand-main">{v?.modele}</span>
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              {v?.annee && <span>{v.annee}</span>}
              {v?.annee && v?.type && <span className="h-3 w-px bg-slate-200" aria-hidden />}
              {v?.type && <span>{v.type}</span>}
              {hasNote && (
                <>
                  {(v?.annee || v?.type) && <span className="h-3 w-px bg-slate-200" aria-hidden />}
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    <Star className="h-3.5 w-3.5 fill-[#C9A24B] text-[#C9A24B]" aria-hidden />
                    {Number(v.noteVehicule).toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Caractéristiques */}
        <dl className="grid grid-cols-2 content-start gap-x-5 gap-y-4 sm:grid-cols-3 md:col-span-3">
          <Spec icon={<Cog className="h-3.5 w-3.5" aria-hidden />} label="Boîte de vitesse">
            {transmissionLabel}
          </Spec>
          <Spec icon={<Fuel className="h-3.5 w-3.5" aria-hidden />} label="Carburant">
            {fuelLabel}
          </Spec>
          <Spec icon={<Users className="h-3.5 w-3.5" aria-hidden />} label="Capacité">
            {seats} places
          </Spec>
          <Spec icon={<Wind className="h-3.5 w-3.5" aria-hidden />} label="Climatisation">
            {v?.climatisation !== false ? 'Oui' : 'Non'}
          </Spec>
          <Spec
            icon={<Hash className="h-3.5 w-3.5" aria-hidden />}
            label="Immatriculation"
            className="col-span-2"
          >
            {v?.immatriculation ? (
              <span className="inline-flex items-stretch overflow-hidden rounded-md bg-white ring-1 ring-slate-300">
                <span className="flex items-center bg-brand-main px-1.5 font-sans text-[10px] font-semibold text-champagne">
                  SN
                </span>
                <span className="px-2.5 py-0.5 font-mono text-sm font-semibold tracking-wider text-slate-900">
                  {v.immatriculation}
                </span>
              </span>
            ) : (
              <span className="text-sm italic text-slate-500">Communiquée au check-in</span>
            )}
          </Spec>
        </dl>
      </div>

      {/* Lieu et itinéraire */}
      <div className="rounded-2xl bg-champagne/25 p-4 ring-1 ring-[#E4CB8E]/60 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-main text-champagne">
            <MapPin className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">
              {booking.adresseLivraison ? 'Adresse de livraison' : 'Lieu de prise en charge'}
            </p>
            <p className="mt-0.5 font-fraunces text-lg font-normal leading-snug text-slate-900">
              {displayLocationText}
            </p>
            {!canShowAddress && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-main/75">
                <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Adresse exacte débloquée 24h avant la prise en charge
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} bg-brand-main text-champagne hover:bg-forest-700 ${focusRing}`}
          >
            <Compass className="h-4 w-4" aria-hidden />
            Google Maps
          </a>
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} bg-white text-brand-main ring-1 ring-brand-main/20 hover:bg-brand-main/5 ${focusRing}`}
          >
            <Navigation className="h-4 w-4" aria-hidden />
            Waze
          </a>
        </div>
      </div>
    </div>
  );
};