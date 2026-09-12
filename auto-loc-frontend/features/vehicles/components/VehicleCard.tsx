'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, Users, ArrowRight, Fuel, Settings2,
  Zap, Car, Heart, Shield, Sparkles, TrendingDown
} from 'lucide-react';
import { cn, getTenantPricePerDay } from '@/lib/utils';
import type { VehicleSearchResult, VehicleStatus, FuelType, Transmission } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS } from '@/features/vehicles/owner/vehicle-helpers';
import { PremiumPriceTag } from '@/components/ui/PremiumPriceTag';

export type TarifTier = { id?: string; joursMin: number; joursMax?: number | null; prix: number };

export type VehicleCardData = VehicleSearchResult & {
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

export interface VehicleCardProps {
  vehicle: VehicleCardData;
  variant?: 'standard' | 'compact' | 'featured';
  priorityImage?: boolean;
  className?: string;
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
 ════════════════════════════════════════════════════════════════ */
function getVehiclePhoto(v: VehicleCardData): string | null {
  if (v.photoUrl) return v.photoUrl;
  return v.photos?.find(p => p.estPrincipale)?.url ?? v.photos?.[0]?.url ?? null;
}

function getBestTier(tiers: TarifTier[]): TarifTier | null {
  if (!tiers || tiers.length === 0) return null;
  return tiers.reduce((best, current) => (Number(current.prix) < Number(best.prix) ? current : best), tiers[0]);
}

function getMaxSavings(base: number, tiers: TarifTier[]): number {
  const best = getBestTier(tiers);
  if (!best || base <= 0) return 0;
  return Math.round(((base - Number(best.prix)) / base) * 100);
}

const FUEL_TRANSLATIONS: Record<string, string> = {
  ESSENCE: 'Essence',
  DIESEL: 'Diesel',
  HYBRIDE: 'Hybride',
  ELECTRIQUE: 'Électrique',
};

/* ════════════════════════════════════════════════════════════════
   1. STANDARD CARD (Desktop & Tablet Default Grid Card)
 ════════════════════════════════════════════════════════════════ */
function StandardVehicleCard({ vehicle, priorityImage, className }: VehicleCardProps) {
  const [liked, setLiked] = useState(false);
  const photo = getVehiclePhoto(vehicle);
  const ownerBasePrice = Number(vehicle.prixParJour);
  const tenantPrice = getTenantPricePerDay(ownerBasePrice);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const savings = getMaxSavings(ownerBasePrice, tiers);
  const bestTier = getBestTier(tiers);
  const minDays = bestTier?.joursMin ?? null;
  const reservations = vehicle.totalLocations ?? 0;

  const isVerified = vehicle.statut === 'VERIFIE';
  const isCoupDeCoeur = Number(vehicle.note) >= 4.5;
  const isPopular = !isCoupDeCoeur && reservations >= 8;

  const transmLabel = vehicle.transmission === 'AUTOMATIQUE' ? 'Automatique'
    : vehicle.transmission === 'MANUELLE' ? 'Manuelle' : null;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-3xl overflow-hidden h-full',
        'border border-slate-200/70',
        'shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
        'hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(5,150,105,0.12)] hover:border-emerald-300/80',
        'transition-all duration-300 ease-out',
        className
      )}
    >
      {/* Visual Accent Top Bar */}
      <div className="h-[3px] w-full flex-shrink-0 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* ── Photo Container ── */}
      <div className="relative overflow-hidden bg-slate-900 aspect-[16/10] w-full">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            priority={priorityImage}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-800">
            <Car className="h-10 w-10 text-white/20" strokeWidth={1.25} />
            <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest">Photo à venir</span>
          </div>
        )}

        {/* Gradient Overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Floating Top-Left Badges (Glassmorphism) */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
          {isCoupDeCoeur && (
            <span className="inline-flex items-center gap-1.5 rounded-full badge-glass px-3 py-1 text-white shadow-md">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" strokeWidth={2.5} />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Coup de cœur</span>
            </span>
          )}
          {isPopular && (
            <span className="inline-flex items-center gap-1.5 rounded-full badge-glass px-3 py-1 text-white shadow-md">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" strokeWidth={2} />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Populaire</span>
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-white shadow-md border border-emerald-400/30">
              <Shield className="h-3 w-3 text-white" strokeWidth={2.5} />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">Vérifié</span>
            </span>
          )}
        </div>

        {/* Floating Top-Right: Year & Heart Favorite Toggle */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {vehicle.annee && (
            <span className="rounded-xl badge-glass px-2.5 py-1 text-[10px] font-extrabold text-white shadow">
              {vehicle.annee}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((l) => !l);
            }}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
              liked
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-110'
                : 'badge-glass text-white/80 hover:text-white hover:scale-105'
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-white')} strokeWidth={2} />
          </button>
        </div>

        {/* Floating Rating Tag Bottom-Right */}
        {vehicle.note > 0 && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 px-2.5 py-1 text-white shadow">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
              <span className="text-[11px] font-black">{Number(vehicle.note).toFixed(1)}</span>
              {(vehicle.totalAvis ?? 0) > 0 && (
                <span className="text-[9.5px] text-white/60">({vehicle.totalAvis})</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-5">
        
        {/* Vehicle Brand & Model — FRAUNCES EDITORIAL SERIF */}
        <div className="mb-2">
          <h3 className="text-[20px] font-bold text-slate-900 leading-snug tracking-tight font-editorial group-hover:text-emerald-700 transition-colors">
            {vehicle.marque} <span className="italic font-normal text-slate-700 group-hover:text-emerald-800">{vehicle.modele}</span>
          </h3>
        </div>

        {/* Location & Reservations Subtitle */}
        <div className="flex items-center gap-2 text-slate-500 mb-4 text-[12px] font-medium">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
            {vehicle.ville}
          </span>
          {reservations > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                <Zap className="h-3 w-3 text-amber-500" strokeWidth={2} />
                {reservations} loc.
              </span>
            </>
          )}
        </div>

        {/* Specifications Pills Row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {vehicle.carburant && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <Fuel className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-slate-700 truncate">
                {FUEL_TRANSLATIONS[vehicle.carburant] ?? vehicle.carburant}
              </span>
            </div>
          )}
          {vehicle.nombrePlaces && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-slate-700">{vehicle.nombrePlaces} places</span>
            </div>
          )}
          {transmLabel && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <Settings2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-slate-700 truncate">{transmLabel}</span>
            </div>
          )}
          {vehicle.type && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <Car className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-slate-700 truncate">
                {TYPE_LABELS[vehicle.type] ?? vehicle.type}
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100 mt-auto mb-4" />

        {/* Price & CTA Footer Row */}
        <div className="flex items-end justify-between gap-3">
          <PremiumPriceTag
            price={tenantPrice}
            savingsPercent={savings}
            minDays={minDays}
            size="md"
            variant="default"
          />

          <span
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl shrink-0',
              'bg-slate-900 text-white text-[12px] font-bold shadow-md',
              'group-hover:bg-emerald-600 group-hover:shadow-lg group-hover:shadow-emerald-600/25',
              'transition-all duration-200 active:scale-95'
            )}
          >
            <span>Voir</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   2. COMPACT CARD (Mobile 2-Column Grid Card)
 ════════════════════════════════════════════════════════════════ */
function CompactVehicleCardImpl({ vehicle, priorityImage, className }: VehicleCardProps) {
  const photo = getVehiclePhoto(vehicle);
  const ownerBasePrice = Number(vehicle.prixParJour);
  const tenantPrice = getTenantPricePerDay(ownerBasePrice);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const savings = getMaxSavings(ownerBasePrice, tiers);
  const bestTier = getBestTier(tiers);
  const minDays = bestTier?.joursMin ?? null;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden h-full',
        'shadow-sm hover:border-emerald-200 transition-all active:scale-[0.98]',
        className
      )}
    >
      {/* Photo Header */}
      <div className="relative aspect-[5/4] w-full bg-slate-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            priority={priorityImage}
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <span className="text-[10px] font-bold text-slate-300">AutoLoc</span>
          </div>
        )}

        {/* Rating Badge */}
        {vehicle.note > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-extrabold text-white">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {Number(vehicle.note).toFixed(1)}
            </span>
          </div>
        )}

        {/* Verification Pill */}
        {vehicle.statut === 'VERIFIE' && (
          <div className="absolute top-2 left-2 z-10">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow">
              <Shield className="h-3 w-3" strokeWidth={2.5} />
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title in Fraunces Editorial Serif */}
        <h4 className="text-[14px] font-bold text-slate-900 truncate leading-snug tracking-tight font-editorial">
          {vehicle.marque} <span className="italic font-normal text-slate-600">{vehicle.modele}</span>
        </h4>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
          {vehicle.ville}
        </p>

        <div className="mt-auto pt-2.5 border-t border-slate-100">
          <div className="flex items-end justify-between gap-1">
            <PremiumPriceTag
              price={tenantPrice}
              savingsPercent={savings}
              minDays={minDays}
              size="sm"
              variant="default"
            />

            <span className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0 active:scale-95 transition-transform">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   3. FEATURED CARD (Hero Split Banner Card)
 ════════════════════════════════════════════════════════════════ */
function FeaturedVehicleCard({ vehicle, priorityImage, className }: VehicleCardProps) {
  const [liked, setLiked] = useState(false);
  const photo = getVehiclePhoto(vehicle);
  const ownerBasePrice = Number(vehicle.prixParJour);
  const tenantPrice = getTenantPricePerDay(ownerBasePrice);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const savings = getMaxSavings(ownerBasePrice, tiers);
  const bestTier = getBestTier(tiers);
  const minDays = bestTier?.joursMin ?? null;
  const reservations = vehicle.totalLocations ?? 0;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] rounded-3xl overflow-hidden',
        'bg-slate-950 border border-white/10 text-white',
        'hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-500/10',
        'transition-all duration-500',
        className
      )}
    >
      {/* Photo Header */}
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden bg-slate-900">
        {photo ? (
          <Image
            src={photo}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            priority={priorityImage}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-14 w-14 text-white/10" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/60 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent lg:hidden" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {vehicle.statut === 'VERIFIE' && (
            <span className="inline-flex items-center gap-1.5 rounded-full badge-glass px-3 py-1">
              <Shield className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
          {reservations >= 5 && (
            <span className="inline-flex items-center gap-1.5 rounded-full badge-glass px-3 py-1">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" strokeWidth={2} />
              <span className="text-[9.5px] font-extrabold text-amber-400 uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* Heart Favorite Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setLiked((l) => !l);
          }}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className="absolute top-4 right-4 w-9 h-9 rounded-full badge-glass flex items-center justify-center hover:bg-red-500/20 transition-all z-10"
        >
          <Heart className={cn('h-4 w-4', liked ? 'fill-red-500 text-red-500' : 'text-white/70')} strokeWidth={2} />
        </button>
      </div>

      {/* Content Side */}
      <div className="relative flex flex-col justify-center p-6 lg:p-10 space-y-4">
        {/* Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }}
        />

        <div className="relative z-10 space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>

          <div>
            <h3 className="text-[26px] lg:text-[32px] font-bold tracking-tight text-white leading-tight font-editorial">
              {vehicle.marque} <span className="italic font-normal text-emerald-400">{vehicle.modele}</span>
            </h3>
            {vehicle.annee && <p className="text-[13px] text-white/40 font-medium mt-1">{vehicle.annee}</p>}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-2">
            {vehicle.note > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/8 border border-white/10 px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                <span className="text-[13px] font-bold text-white">{Number(vehicle.note).toFixed(1)}</span>
                {(vehicle.totalAvis ?? 0) > 0 && (
                  <span className="text-[11px] text-white/40">({vehicle.totalAvis})</span>
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/8 border border-white/10 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/40" strokeWidth={2} />
              <span className="text-[12px] font-medium text-white/70">{vehicle.ville}</span>
            </span>
          </div>

          {/* Price Tag */}
          <div className="pt-2">
            <PremiumPriceTag
              price={tenantPrice}
              savingsPercent={savings}
              minDays={minDays}
              size="lg"
              variant="dark"
            />
          </div>

          {/* CTA Button */}
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 mt-2 self-start',
              'bg-emerald-400 text-black text-[13px] font-black',
              'shadow-lg shadow-emerald-500/20',
              'group-hover:bg-emerald-300 group-hover:shadow-xl transition-all duration-200'
            )}
          >
            <span>Réserver maintenant</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN EXPORT — UNIFIED VEHICLE CARD
 ════════════════════════════════════════════════════════════════ */
export function VehicleCard(props: VehicleCardProps): React.ReactElement {
  switch (props.variant) {
    case 'compact':
      return <CompactVehicleCardImpl {...props} />;
    case 'featured':
      return <FeaturedVehicleCard {...props} />;
    case 'standard':
    default:
      return <StandardVehicleCard {...props} />;
  }
}
