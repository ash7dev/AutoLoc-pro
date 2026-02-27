'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, Users, ArrowRight,
  Fuel, Settings2, Zap, Car,
  TrendingDown, Tag, Heart, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleSearchResult, VehicleStatus, FuelType, Transmission } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
type TarifTier = { id?: string; joursMin: number; joursMax?: number | null; prix: number };

type VehicleCardItem = VehicleSearchResult & {
  carburant?: FuelType | null;
  transmission?: Transmission | null;
  nombrePlaces?: number | null;
  joursMinimum?: number | null;
  photoUrl?: string | null;
  photos?: Array<{ url: string; estPrincipale?: boolean }>;
  tarifsProgressifs?: TarifTier[];
  statut?: VehicleStatus;
  totalAvis?: number;
};

interface Props {
  vehicle: VehicleCardItem;
  featured?: boolean;
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function mainPhoto(v: VehicleCardItem): string | null {
  if (v.photoUrl) return v.photoUrl;
  return v.photos?.find(p => p.estPrincipale)?.url ?? v.photos?.[0]?.url ?? null;
}

function bestTierPrice(tiers: TarifTier[]): number {
  return Math.min(...tiers.map(t => Number(t.prix)));
}

function maxSavings(base: number, tiers: TarifTier[]): number {
  const best = bestTierPrice(tiers);
  return Math.round(((base - best) / base) * 100);
}

function bestTier(tiers: TarifTier[]): TarifTier | null {
  if (tiers.length === 0) return null;
  return tiers.reduce((m, t) => (Number(t.prix) < Number(m.prix) ? t : m), tiers[0]);
}

function bestTierMinDays(tiers: TarifTier[]): number | null {
  const best = bestTier(tiers);
  if (!best) return null;
  const minDays = Number(best.joursMin);
  return Number.isFinite(minDays) ? minDays : null;
}

/* ════════════════════════════════════════════════════════════════
   PRICING STRIP  — tarifs dégressifs toujours visibles
════════════════════════════════════════════════════════════════ */
function PricingStrip({ vehicle }: { vehicle: VehicleCardItem }) {
  const tiers = vehicle.tarifsProgressifs ?? [];
  const base = Number(vehicle.prixParJour);
  const savings = tiers.length > 0 ? maxSavings(base, tiers) : 0;
  const minDays = bestTierMinDays(tiers);

  if (savings <= 0 || minDays == null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
      <TrendingDown className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
      <span className="text-[11.5px] font-semibold text-emerald-700">
        Économisez jusqu'à{' '}
        <span className="font-black">{savings}%</span>
        {' '}à partir de{' '}
        <span className="font-black">{minDays}</span>
        {minDays > 1 ? ' jours' : ' jour'}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FEATURED CARD  — large horizontal layout
════════════════════════════════════════════════════════════════ */
function FeaturedCard({ vehicle }: { vehicle: VehicleCardItem }) {
  const [liked, setLiked] = useState(false);
  const photo = mainPhoto(vehicle);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const base = Number(vehicle.prixParJour);
  const hasTiers = tiers.length > 0;
  const minDays = bestTierMinDays(tiers);
  const reservations = vehicle.totalLocations ?? 0;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] rounded-2xl overflow-hidden',
        'bg-slate-950 border border-white/8',
        'hover:border-emerald-400/20 hover:shadow-2xl hover:shadow-emerald-500/8',
        'transition-all duration-500',
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[340px] overflow-hidden bg-slate-900">
        {photo ? (
          <Image src={photo} alt={`${vehicle.marque} ${vehicle.modele}`}
            fill priority sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-600 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-14 w-14 text-white/10" strokeWidth={1} />
          </div>
        )}
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/50 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent lg:hidden" />

        {/* badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {vehicle.statut === 'VERIFIE' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm border border-emerald-400/25 px-2.5 py-1">
              <Shield className="h-3 h-3 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
          {reservations >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm px-2.5 py-1">
              <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* fav */}
        <button type="button" onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:border-red-400/30 hover:bg-red-400/10 transition-all z-10">
          <Heart className={cn('h-4 w-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-white/60')} strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div className="relative flex flex-col justify-center p-5 lg:p-8">
        {/* ambient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />

        <div className="relative z-10 space-y-3.5">
          <span className="text-[9.5px] font-black uppercase tracking-[0.18em] text-emerald-400/60">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>

          <div>
            <h3 className="text-[24px] lg:text-[28px] font-black tracking-tight text-white leading-none">
              {vehicle.marque} <span className="text-emerald-400">{vehicle.modele}</span>
            </h3>
            <p className="text-[12px] text-white/30 font-medium mt-1">{vehicle.annee}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            {vehicle.note > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/6 border border-white/8 px-2.5 py-1.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                <span className="text-[12px] font-bold text-white">{Number(vehicle.note).toFixed(1)}</span>
                {(vehicle.totalAvis ?? 0) > 0 && (
                  <span className="text-[11px] text-white/30">({vehicle.totalAvis})</span>
                )}
              </span>
            )}
            {reservations > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/6 border border-white/8 px-2.5 py-1.5">
                <Zap className="h-3 w-3 text-amber-400" strokeWidth={2} />
                <span className="text-[11px] font-semibold text-white/50">{reservations} locations</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-xl bg-white/6 border border-white/8 px-2.5 py-1.5">
              <MapPin className="h-3 w-3 text-white/30" strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-white/40">{vehicle.ville}</span>
            </span>
          </div>

          {/* Pricing — prix de base + message économies */}
          <div className="flex items-center gap-3 rounded-xl bg-white/4 border border-white/8 px-4 py-3">
            <Tag className="w-4 h-4 text-emerald-400/60 flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/25">
                Tarif par jour
              </p>
              <p className="text-[20px] font-black text-emerald-400 tabular-nums leading-tight">
                {formatPrice(base)}{' '}
                <span className="text-[11px] font-semibold text-emerald-400/50">FCFA/j</span>
              </p>
            </div>
            {hasTiers && maxSavings(base, tiers) > 0 && (
              <span className="flex-shrink-0 text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg tabular-nums">
                −{maxSavings(base, tiers)}%
              </span>
            )}
          </div>
          {hasTiers && maxSavings(base, tiers) > 0 && minDays != null && (
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-400/70">
              <TrendingDown className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
              Économisez jusqu'à {maxSavings(base, tiers)}% à partir de {minDays}
              {minDays > 1 ? ' jours' : ' jour'}
            </div>
          )}

          {/* CTA */}
          <span className={cn(
            'inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 mt-1',
            'bg-emerald-400 text-black text-[13px] font-black',
            'shadow-lg shadow-emerald-500/20',
            'group-hover:bg-emerald-300 group-hover:shadow-xl group-hover:shadow-emerald-400/25',
            'transition-all duration-200',
          )}>
            Réserver maintenant
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   STANDARD CARD
════════════════════════════════════════════════════════════════ */
function StandardCard({ vehicle }: { vehicle: VehicleCardItem }) {
  const [liked, setLiked] = useState(false);
  const photo = mainPhoto(vehicle);
  const base = Number(vehicle.prixParJour);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const reservations = vehicle.totalLocations ?? 0;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden',
        'shadow-sm shadow-slate-100',
        'hover:shadow-lg hover:shadow-slate-200/70 hover:-translate-y-1 hover:border-slate-200',
        'transition-all duration-300',
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {photo ? (
          <Image src={photo} alt={`${vehicle.marque} ${vehicle.modele}`}
            fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {vehicle.statut === 'VERIFIE' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/72 backdrop-blur-sm border border-emerald-400/25 px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
          {reservations >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm px-2.5 py-1">
              <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* Fav */}
        <button type="button" onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110">
          <Heart className={cn('h-3.5 w-3.5 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-slate-500')} strokeWidth={2} />
        </button>

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-black/78 backdrop-blur-md px-3 py-2 text-right">
          <p className="text-[8.5px] font-bold text-white/35 uppercase tracking-wide mb-0.5">Tarif par jour</p>
          <p className="text-[16px] font-black text-emerald-400 leading-none tabular-nums">
            {formatPrice(base)}
          </p>
          <p className="text-[8.5px] font-bold text-white/35 uppercase tracking-wide mt-0.5">FCFA/j</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Type + city */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <MapPin className="h-3 w-3" strokeWidth={2} />
            {vehicle.ville}
          </span>
        </div>

        {/* Name */}
        <div>
          <h3 className="text-[15px] font-black tracking-tight text-slate-900 leading-tight">
            {vehicle.marque} <span className="text-emerald-500">{vehicle.modele}</span>
          </h3>
          <p className="text-[11.5px] font-medium text-slate-400 mt-0.5">
            {vehicle.annee}
            {vehicle.transmission && ` · ${vehicle.transmission}`}
          </p>
        </div>

        {/* Specs row */}
        {(vehicle.carburant || vehicle.nombrePlaces) && (
          <div className="flex items-center gap-3 flex-wrap">
            {vehicle.carburant && (
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
                <Fuel className="h-3 w-3 text-slate-300" strokeWidth={1.75} />
                {vehicle.carburant}
              </span>
            )}
            {vehicle.nombrePlaces && (
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
                <Users className="h-3 w-3 text-slate-300" strokeWidth={1.75} />
                {vehicle.nombrePlaces} places
              </span>
            )}
            {vehicle.transmission && (
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-500">
                <Settings2 className="h-3 w-3 text-slate-300" strokeWidth={1.75} />
                {vehicle.transmission}
              </span>
            )}
          </div>
        )}

        {/* ── Pricing strip ── toujours visible */}
        <PricingStrip vehicle={vehicle} />

        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {vehicle.note > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-slate-700">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                {Number(vehicle.note).toFixed(1)}
              </span>
            )}
            {reservations > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Zap className="h-3 w-3" strokeWidth={2} />
                {reservations} loc.
              </span>
            )}
          </div>

          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2',
            'bg-slate-900 text-[12px] font-bold text-emerald-400',
            'group-hover:bg-emerald-500 group-hover:text-white',
            'transition-all duration-200 shadow-sm',
          )}>
            Réserver
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   EXPORT
════════════════════════════════════════════════════════════════ */
export function ExplorerVehicleCard({ vehicle, featured = false }: Props): React.ReactElement {
  return featured ? <FeaturedCard vehicle={vehicle} /> : <StandardCard vehicle={vehicle} />;
}
