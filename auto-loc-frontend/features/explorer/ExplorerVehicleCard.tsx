'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, Users, ArrowRight,
  Fuel, Zap, Car,
  TrendingDown, Tag, Heart, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleSearchResult, VehicleStatus, FuelType, Transmission } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS } from '@/features/vehicles/owner/vehicle-helpers';
import { useCurrency } from '@/providers/currency-provider';

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
   FEATURED CARD  — large horizontal layout
════════════════════════════════════════════════════════════════ */
function FeaturedCard({ vehicle }: { vehicle: VehicleCardItem }) {
  const [liked, setLiked] = useState(false);
  const { formatPrice } = useCurrency();
  const photo = mainPhoto(vehicle);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const ownerBase = Number(vehicle.prixParJour);
  const base = Math.round(ownerBase * 1.15); // tenant price with 15% commission
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
                {formatPrice(base)}
                <span className="text-[11px] font-semibold text-emerald-400/50">/jour</span>
              </p>
            </div>
            {hasTiers && maxSavings(ownerBase, tiers) > 0 && (
              <span className="flex-shrink-0 text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg tabular-nums">
                −{maxSavings(ownerBase, tiers)}%
              </span>
            )}
          </div>
          {hasTiers && maxSavings(ownerBase, tiers) > 0 && minDays != null && (
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-400/70">
              <TrendingDown className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
              Économisez jusqu'à {maxSavings(ownerBase, tiers)}% à partir de {minDays}
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
   STANDARD CARD  — premium SaaS redesign
════════════════════════════════════════════════════════════════ */
function StandardCard({ vehicle }: { vehicle: VehicleCardItem }) {
  const [liked, setLiked] = useState(false);
  const { formatPrice } = useCurrency();
  const photo = mainPhoto(vehicle);
  const base = Math.round(Number(vehicle.prixParJour) * 1.15);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const reservations = vehicle.totalLocations ?? 0;
  const savings = tiers.length > 0 ? maxSavings(Number(vehicle.prixParJour), tiers) : 0;
  const minDays = bestTierMinDays(tiers);
  const isVerified = vehicle.statut === 'VERIFIE';
  const isPopular = reservations >= 5;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-[22px] overflow-hidden',
        'border border-slate-100/80',
        'shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
        'hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(5,150,105,0.12)] hover:border-emerald-200/60',
        'transition-all duration-400 ease-out',
      )}
    >
      {/* ── Photo ── */}
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '16/10' }}>
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Car className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.15em]">Photo à venir</span>
          </div>
        )}

        {/* Bottom gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {/* ── Top-left badges ── */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md border border-emerald-400/30 px-2.5 py-1">
              <Shield className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
          {isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-1 shadow-sm">
              <Zap className="h-2.5 w-2.5 text-white" strokeWidth={2.5} fill="currentColor" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* ── Heart — always visible ── */}
        <button
          type="button"
          onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className={cn(
            'absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center',
            'backdrop-blur-md border transition-all duration-200',
            liked
              ? 'bg-red-500 border-red-400/50 shadow-lg shadow-red-500/30'
              : 'bg-black/35 border-white/15 hover:bg-black/50',
          )}
        >
          <Heart
            className={cn('h-3.5 w-3.5 transition-all duration-200', liked ? 'fill-white text-white scale-110' : 'text-white/80')}
            strokeWidth={2}
          />
        </button>

        {/* ── Price pill — bottom-left ── */}
        <div className="absolute bottom-3 left-3.5 z-10">
          <div className="rounded-xl px-3 py-1.5 backdrop-blur-md"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.92) 0%, rgba(16,185,129,0.88) 100%)', boxShadow: '0 4px 16px rgba(5,150,105,0.35)' }}>
            <p className="text-[18px] font-black text-white tabular-nums leading-none tracking-tight">
              {formatPrice(base)}
              <span className="text-[10px] font-bold text-white/65 ml-1">/ jour</span>
            </p>
          </div>
          {savings > 0 && minDays != null && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 shadow-sm">
              <TrendingDown className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
              <span className="text-[9px] font-black text-white">−{savings}% dès {minDays}j</span>
            </div>
          )}
        </div>

        {/* ── Vehicle name overlay — bottom-right ── */}
        <div className="absolute bottom-3 right-3.5 z-10 text-right">
          <p className="text-[15px] font-black text-white leading-tight drop-shadow-sm">
            {vehicle.marque}
          </p>
          <p className="text-[13px] font-black text-emerald-300 leading-tight drop-shadow-sm">
            {vehicle.modele}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-3">

        {/* Type + city */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-[0.14em] text-emerald-600">
            <Car className="h-2.5 w-2.5" strokeWidth={2.5} />
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>
          <span className="flex items-center gap-1 text-[10.5px] font-semibold text-slate-400">
            <MapPin className="h-2.5 w-2.5 text-slate-300" strokeWidth={2} />
            {vehicle.ville}
          </span>
        </div>

        {/* Year + transmission */}
        <p className="text-[11px] font-medium text-slate-400 -mt-1">
          {vehicle.annee}
          {vehicle.transmission && (
            <span className="ml-1.5 text-slate-300">· {vehicle.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle'}</span>
          )}
        </p>

        {/* Specs chips */}
        {(vehicle.carburant || vehicle.nombrePlaces) && (
          <div className="flex items-center gap-1.5 flex-wrap -mt-0.5">
            {vehicle.carburant && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                <Fuel className="h-2.5 w-2.5 text-slate-400" strokeWidth={2} />
                {vehicle.carburant === 'ESSENCE' ? 'Essence'
                  : vehicle.carburant === 'DIESEL' ? 'Diesel'
                  : vehicle.carburant === 'HYBRIDE' ? 'Hybride'
                  : 'Électrique'}
              </span>
            )}
            {vehicle.nombrePlaces && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                <Users className="h-2.5 w-2.5 text-slate-400" strokeWidth={2} />
                {vehicle.nombrePlaces} places
              </span>
            )}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

        {/* Rating + locations */}
        <div className="flex items-center gap-3">
          {vehicle.note > 0 ? (
            <span className="flex items-center gap-1 text-[12px] font-bold text-slate-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
              {Number(vehicle.note).toFixed(1)}
              {(vehicle.totalAvis ?? 0) > 0 && (
                <span className="text-[11px] font-normal text-slate-400 ml-0.5">({vehicle.totalAvis})</span>
              )}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-300">Nouveau</span>
          )}
          {reservations > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Zap className="h-3 w-3 text-amber-400" strokeWidth={2} fill="currentColor" />
              {reservations} location{reservations > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* CTA */}
        <span
          className={cn(
            'relative w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5',
            'text-[13px] font-black text-white overflow-hidden',
            'shadow-md shadow-emerald-500/20',
            'group-hover:shadow-lg group-hover:shadow-emerald-500/30',
            'transition-all duration-300',
          )}
          style={{ background: 'linear-gradient(135deg, #34D399 0%, #059669 60%, #047857 100%)' }}
        >
          {/* Shine sweep on hover */}
          <span
            className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
          />
          Réserver
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
        </span>
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
