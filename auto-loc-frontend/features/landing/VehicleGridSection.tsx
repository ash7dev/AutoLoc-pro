'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, ArrowRight, Heart,
  Zap, Car, TrendingUp, TrendingDown,
  Rocket, PlusCircle, Tag, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchVehicles, type VehicleSearchResult, type VehicleType, type TarifTier, type VehicleStatus } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

/* ════════════════════════════════════════════════════════════════
   DISPLAY STRATEGY ENGINE
════════════════════════════════════════════════════════════════ */
type VehicleGridItem = VehicleSearchResult & {
  tarifsProgressifs?: TarifTier[];
  statut?: VehicleStatus;
  totalAvis?: number;
};

interface DisplayStrategy {
  name: string;
  featuredCount: number;
  gridColumns: { mobile: number; tablet: number; desktop: number };
  maxGridItems: number;
  showFilters: boolean;
  showViewAll: boolean;
  priorityRules: Array<{ field: keyof VehicleGridItem; direction: 'asc' | 'desc'; weight: number }>;
}

const STRATEGIES: Record<string, DisplayStrategy> = {
  sparse:   { name: 'sparse',   featuredCount: 1, gridColumns: { mobile: 1, tablet: 2, desktop: 2 }, maxGridItems: 2,  showFilters: false, showViewAll: false, priorityRules: [{ field: 'totalLocations', direction: 'desc', weight: 8 }, { field: 'note', direction: 'desc', weight: 7 }, { field: 'prixParJour', direction: 'asc', weight: 5 }] },
  limited:  { name: 'limited',  featuredCount: 1, gridColumns: { mobile: 1, tablet: 2, desktop: 3 }, maxGridItems: 5,  showFilters: true,  showViewAll: false, priorityRules: [{ field: 'totalLocations', direction: 'desc', weight: 8 }, { field: 'note', direction: 'desc', weight: 7 }, { field: 'prixParJour', direction: 'asc', weight: 5 }] },
  normal:   { name: 'normal',   featuredCount: 1, gridColumns: { mobile: 1, tablet: 2, desktop: 3 }, maxGridItems: 8,  showFilters: true,  showViewAll: true,  priorityRules: [{ field: 'note', direction: 'desc', weight: 7 }, { field: 'totalLocations', direction: 'desc', weight: 6 }, { field: 'prixParJour', direction: 'asc', weight: 4 }] },
  abundant: { name: 'abundant', featuredCount: 2, gridColumns: { mobile: 1, tablet: 2, desktop: 4 }, maxGridItems: 12, showFilters: true,  showViewAll: true,  priorityRules: [{ field: 'note', direction: 'desc', weight: 7 }, { field: 'totalLocations', direction: 'desc', weight: 6 }, { field: 'prixParJour', direction: 'asc', weight: 4 }] },
};

function pickStrategy(n: number) {
  if (n <= 3) return STRATEGIES.sparse;
  if (n <= 6) return STRATEGIES.limited;
  if (n <= 12) return STRATEGIES.normal;
  return STRATEGIES.abundant;
}

function calcScore(v: VehicleGridItem, rules: DisplayStrategy['priorityRules']) {
  return rules.reduce((acc, r) => {
    const raw: number = (v[r.field] as number) ?? 0;
    const norm = r.field === 'note' ? raw / 5 : r.field === 'totalLocations' ? Math.min(raw / 20, 1) : Math.max(0, 1 - raw / 100_000);
    return acc + (r.direction === 'desc' ? norm : 1 - norm) * r.weight;
  }, 0);
}

function distribute(vehicles: VehicleGridItem[], s: DisplayStrategy) {
  const sorted = [...vehicles].sort((a, b) => calcScore(b, s.priorityRules) - calcScore(a, s.priorityRules));
  return {
    featured: sorted.slice(0, s.featuredCount),
    grid: sorted.slice(s.featuredCount, s.featuredCount + s.maxGridItems),
    hidden: sorted.slice(s.featuredCount + s.maxGridItems),
    total: vehicles.length,
  };
}

function getHints(s: DisplayStrategy, n: number) {
  const map: Record<string, { title: string; subtitle: string; badge: string; Icon: React.ElementType }> = {
    sparse:   { title: 'Sélection premium',         subtitle: 'Véhicules vérifiés et disponibles dès maintenant',         badge: 'Sélection du moment', Icon: Star },
    limited:  { title: 'Véhicules disponibles',     subtitle: `${n} véhicules vérifiés disponibles maintenant`,            badge: 'Disponibles',         Icon: Zap },
    normal:   { title: 'Véhicules disponibles',     subtitle: `Découvrez notre sélection de ${n} véhicules vérifiés`,      badge: 'Sélection du moment', Icon: Zap },
    abundant: { title: 'Large sélection',           subtitle: `Plus de ${n} véhicules vérifiés partout au Sénégal`,        badge: 'Large sélection',     Icon: TrendingUp },
  };
  return map[s.name] ?? { title: 'Véhicules disponibles', subtitle: '', badge: '', Icon: Car };
}

/* ════════════════════════════════════════════════════════════════
   FILTER TABS
════════════════════════════════════════════════════════════════ */
const FILTERS = [
  { value: '',           label: 'Tous'        },
  { value: 'BERLINE',    label: 'Berlines'    },
  { value: 'SUV',        label: 'SUV'         },
  { value: 'PICKUP',     label: 'Pick-up'     },
  { value: 'UTILITAIRE', label: 'Utilitaires' },
  { value: 'MINIBUS',    label: 'Minibus'     },
];

/* ════════════════════════════════════════════════════════════════
   PRICING MINI-STRIP — tarifs dégressifs sur la card
   Visible directement, pas derrière un hover
════════════════════════════════════════════════════════════════ */
function PricingStrip({ vehicle }: { vehicle: VehicleGridItem }) {
  const tiers = vehicle.tarifsProgressifs ?? [];
  const base = Number(vehicle.prixParJour);
  if (tiers.length === 0) return null;

  const best = tiers.reduce((m: TarifTier, t: TarifTier) => (
    Number(t.prix) < Number(m.prix) ? t : m
  ), tiers[0]);
  const savings = Math.round(((base - Number(best.prix)) / base) * 100);
  const minDays = Number((best as TarifTier).joursMin);
  if (savings <= 0 || !Number.isFinite(minDays)) return null;

  return (
    <div className="flex items-center gap-2">
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
   PRICING STRIP — version dark pour FeaturedCard
════════════════════════════════════════════════════════════════ */
function PricingStripDark({ vehicle }: { vehicle: VehicleGridItem }) {
  const tiers = vehicle.tarifsProgressifs ?? [];
  const base = Number(vehicle.prixParJour);
  if (tiers.length === 0) return null;

  const best = tiers.reduce((m: TarifTier, t: TarifTier) => (
    Number(t.prix) < Number(m.prix) ? t : m
  ), tiers[0]);
  const savings = Math.round(((base - Number(best.prix)) / base) * 100);
  const minDays = Number((best as TarifTier).joursMin);
  if (savings <= 0 || !Number.isFinite(minDays)) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
      <TrendingDown className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
      <span className="text-[12px] font-semibold text-emerald-400">
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
   SKELETON CARDS
════════════════════════════════════════════════════════════════ */
function SkeletonFeatured() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden bg-slate-900 border border-white/5" aria-hidden>
      <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[400px] bg-slate-800 animate-pulse" />
      <div className="p-8 lg:p-10 flex flex-col gap-5">
        <div className="h-3 w-20 rounded-full bg-white/5 animate-pulse" />
        <div className="h-9 w-56 rounded-xl bg-white/5 animate-pulse" />
        <div className="flex gap-2 mt-2">
          {[0, 1].map((i: number) => (
            <div key={i} className="h-8 w-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-24 rounded-2xl bg-white/5 animate-pulse mt-2" />
        <div className="flex gap-4 mt-2">
          <div className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-12 w-40 rounded-xl bg-emerald-400/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white" style={{ animationDelay: `${delay}ms` }} aria-hidden>
      <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-5 w-40 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-8 w-full rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-px bg-slate-100" />
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FEATURED HERO CARD
════════════════════════════════════════════════════════════════ */
function FeaturedCard({ vehicle, visible }: { vehicle: VehicleGridItem; visible: boolean }) {
  const [liked, setLiked] = useState(false);
  const hasTiers = (vehicle.tarifsProgressifs?.length ?? 0) > 0;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden',
        'bg-slate-950 border border-white/8',
        'hover:border-emerald-400/25 hover:shadow-2xl hover:shadow-emerald-500/10',
        'transition-all duration-700 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
      )}
    >
      {/* ── Photo ── */}
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
        {vehicle.photoUrl ? (
          <Image src={vehicle.photoUrl} alt={`${vehicle.marque} ${vehicle.modele}`}
            fill sizes="(max-width: 1024px) 100vw, 50vw" priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <Car className="h-16 w-16 text-white/10" strokeWidth={1} />
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/70 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:hidden" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 shadow-lg shadow-emerald-500/30">
            <TrendingUp className="h-3 w-3 text-black" strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Coup de cœur</span>
          </span>
          {vehicle.statut === 'VERIFIE' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm border border-emerald-400/30 px-2.5 py-1.5">
              <Shield className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
            </span>
          )}
        </div>

        {/* Fav */}
        <button type="button" onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:border-red-400/30 hover:bg-red-400/10 transition-all z-10">
          <Heart className={cn('h-4 w-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-white/60')} strokeWidth={2} />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="relative flex flex-col justify-center p-6 lg:p-10">
        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />

        <div className="relative z-10 space-y-4">
          {/* Type */}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>

          {/* Name */}
          <div>
            <h3 className="text-[30px] lg:text-[36px] font-black tracking-tight text-white leading-none">
              {vehicle.marque}
            </h3>
            <h3 className="text-[30px] lg:text-[36px] font-black tracking-tight text-emerald-400 leading-none">
              {vehicle.modele}
            </h3>
            <p className="text-[13px] text-white/30 font-medium mt-1.5">{vehicle.annee}</p>
          </div>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2">
            {vehicle.note > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/6 border border-white/8 px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                <span className="text-[12px] font-bold text-white">{Number(vehicle.note).toFixed(1)}</span>
                <span className="text-[11px] text-white/35">({vehicle.totalAvis ?? 0})</span>
              </span>
            )}
            {vehicle.totalLocations > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/6 border border-white/8 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
                <span className="text-[12px] font-semibold text-white/60">{vehicle.totalLocations} locations</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-xl bg-white/6 border border-white/8 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-white/30" strokeWidth={1.75} />
              <span className="text-[12px] font-medium text-white/40">{vehicle.ville}</span>
            </span>
          </div>

          {/* ── Price ── */}
          <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/8 inline-flex items-center gap-3">
            <Tag className="w-4 h-4 text-emerald-400/60" strokeWidth={2} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tarif / jour</p>
              <p className="text-[22px] font-black text-emerald-400 tabular-nums leading-tight">
                {formatPrice(Number(vehicle.prixParJour))}
                <span className="text-[12px] font-semibold text-emerald-400/50 ml-1">FCFA</span>
              </p>
            </div>
          </div>

          {/* ── Savings strip (only when tiers exist) ── */}
          {hasTiers && <PricingStripDark vehicle={vehicle} />}

          {/* CTA row */}
          <div className="flex items-center gap-4 pt-2">
            <span className={cn(
              'inline-flex items-center gap-2 rounded-2xl px-6 py-3.5',
              'bg-emerald-400 text-black text-[13px] font-black',
              'shadow-xl shadow-emerald-500/25',
              'group-hover:bg-emerald-300 group-hover:shadow-2xl group-hover:shadow-emerald-400/30',
              'transition-all duration-200',
            )}>
              Réserver maintenant
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   STANDARD VEHICLE CARD  — pricing tiers toujours visibles
════════════════════════════════════════════════════════════════ */
function VehicleCard({ vehicle, index, visible }: { vehicle: VehicleGridItem; index: number; visible: boolean }) {
  const [liked, setLiked] = useState(false);
  const tiers = vehicle.tarifsProgressifs ?? [];
  const hasTiers = tiers.length > 0;
  const base = Number(vehicle.prixParJour);
  const tierSavings = hasTiers
    ? Math.round(((base - Number(tiers.reduce((m: TarifTier, t: TarifTier) => Number(t.prix) < Number(m.prix) ? t : m, tiers[0]).prix)) / base) * 100)
    : 0;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden',
        'shadow-sm shadow-slate-200/50',
        'hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1.5 hover:border-slate-200',
        'transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* ── Photo ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {vehicle.photoUrl ? (
          <Image src={vehicle.photoUrl} alt={`${vehicle.marque} ${vehicle.modele}`}
            fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {vehicle.statut === 'VERIFIE' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-sm border border-emerald-400/25 px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9.5px] font-black uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
          {vehicle.totalLocations >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1">
              <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2.5} />
              <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* Fav */}
        <button type="button" onClick={e => { e.preventDefault(); setLiked(l => !l); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10">
          <Heart className={cn('h-3.5 w-3.5 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-slate-500')} strokeWidth={2} />
        </button>

        {/* Price badge — bottom right */}
        <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-black/80 backdrop-blur-md px-3 py-2 text-right">
          <p className="text-[18px] font-black text-emerald-400 leading-none tabular-nums">
            {formatPrice(Number(vehicle.prixParJour))}
          </p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-0.5">FCFA / jour</p>
        </div>
      </div>

      {/* ── Body ── */}
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
          <h3 className="text-[16px] font-black tracking-tight text-slate-900 leading-tight">
            {vehicle.marque} <span className="text-emerald-500">{vehicle.modele}</span>
          </h3>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">{vehicle.annee}</p>
        </div>

        {/* ── Savings strip — only when tiers exist and there are savings ── */}
        {tierSavings > 0 && (
          <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
            <PricingStrip vehicle={vehicle} />
          </div>
        )}

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
            {vehicle.totalLocations > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Zap className="h-3 w-3" strokeWidth={2} />
                {vehicle.totalLocations} loc.
              </span>
            )}
          </div>

          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-xl',
            'bg-slate-900 px-3.5 py-2 text-[12px] font-bold text-emerald-400',
            'group-hover:bg-emerald-500 group-hover:text-white',
            'transition-all duration-200 shadow-sm',
          )}>
            Réserver
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATES
════════════════════════════════════════════════════════════════ */
function EmptyFilter({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Car className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-slate-600">Aucun {label.toLowerCase()} disponible</p>
        <p className="mt-1 text-[13px] text-slate-400">D'autres catégories sont disponibles.</p>
      </div>
      <button type="button" onClick={onReset}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
        Voir tous les véhicules
      </button>
    </div>
  );
}

function EmptyGlobal() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 py-16 px-8 lg:py-20 lg:px-16 text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <div className="w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, #34d399, transparent 60%)' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
          <Rocket className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Bientôt <span className="text-emerald-400">disponible</span></h3>
          <p className="mt-3 text-[14px] text-white/50 leading-relaxed">Notre flotte de véhicules vérifiés sera affichée ici très prochainement.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/explorer" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-emerald-400 text-black text-[13px] font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-300 transition-all">
            Explorer <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <Link href="/dashboard/owner" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 border border-white/15 text-white/60 text-[13px] font-semibold hover:border-emerald-400/30 hover:text-emerald-400 transition-all">
            <PlusCircle className="h-4 w-4" strokeWidth={2} /> Proposer un véhicule
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN SECTION
════════════════════════════════════════════════════════════════ */
interface VehicleGridSectionProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  viewAllHref?: string;
  initialVehicles?: VehicleGridItem[];
}

export function VehicleGridSection({
  title,
  subtitle,
  showFilters = true,
  viewAllHref = '/explorer',
  initialVehicles,
}: VehicleGridSectionProps): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState('');
  const [vehicles, setVehicles] = useState<VehicleGridItem[]>(() => initialVehicles ?? []);
  const [loading, setLoading] = useState(() => !(initialVehicles && initialVehicles.length > 0));
  const [error, setError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const initialLoaded = useRef(false);

  const strategy = pickStrategy(vehicles.length);
  const dist = distribute(vehicles, strategy);
  const hints = getHints(strategy, vehicles.length);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const fetchVehicles = useCallback(async (type?: string) => {
    setLoading(true); setError(false);
    try {
      const r = await searchVehicles({ type: (type || undefined) as VehicleType | undefined });
      setVehicles(r.data ?? []);
    } catch {
      setError(true); setVehicles([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!initialLoaded.current && !activeFilter && initialVehicles && initialVehicles.length > 0) {
      initialLoaded.current = true;
      return;
    }
    initialLoaded.current = true;
    fetchVehicles(activeFilter || undefined);
  }, [activeFilter, fetchVehicles, initialVehicles]);

  const activeLabel = FILTERS.find(f => f.value === activeFilter)?.label ?? '';
  const showFilterBar = showFilters && strategy.showFilters;
  const showViewAll = strategy.showViewAll && dist.hidden.length > 0;

  return (
    <section ref={sectionRef} className="px-4 py-12 lg:px-8 lg:py-16" aria-labelledby="vehicles-heading">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/5 px-4 py-1.5">
              <hints.Icon className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[10.5px] font-black uppercase tracking-[0.15em] text-emerald-600">{hints.badge}</span>
            </div>

            <h2 id="vehicles-heading" className="text-[36px] lg:text-[48px] font-black tracking-tight text-slate-900 leading-[1.05]">
              {(title || hints.title).split(' ').map((w: string, i: number, arr: string[]) =>
                i === arr.length - 1
                  ? <span key={i} className="text-emerald-500"> {w}</span>
                  : <span key={i}>{i > 0 ? ' ' : ''}{w}</span>
              )}
            </h2>

            <p className="max-w-xl text-[14.5px] font-medium text-slate-500 leading-relaxed">
              {subtitle || hints.subtitle}
            </p>
          </div>

          {showViewAll && (
            <Link href={viewAllHref}
              className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:shadow-md transition-all lg:self-auto">
              Voir tout <ArrowRight className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {/* ── Filter bar ─────────────────────────────────────────── */}
        {showFilterBar && (
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.value} type="button" onClick={() => setActiveFilter(f.value)}
                className={cn(
                  'rounded-xl px-4 py-2 text-[13px] font-semibold tracking-tight transition-all duration-200',
                  activeFilter === f.value
                    ? 'bg-slate-900 text-emerald-400 shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
                )}>
                {f.label}
              </button>
            ))}
            {!loading && (
              <span className="ml-auto text-[12px] font-medium text-slate-400">
                {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-6">
            <SkeletonFeatured />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map(i => <SkeletonCard key={i} delay={i * 100} />)}
            </div>
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-[14px] font-bold text-slate-500">Impossible de charger les véhicules</p>
            <button type="button" onClick={() => fetchVehicles(activeFilter || undefined)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
              Réessayer
            </button>
          </div>
        )}

        {/* ── Empty ──────────────────────────────────────────────── */}
        {!loading && !error && vehicles.length === 0 && (
          activeFilter ? <EmptyFilter label={activeLabel} onReset={() => setActiveFilter('')} /> : <EmptyGlobal />
        )}

        {/* ── Content ────────────────────────────────────────────── */}
        {!loading && !error && vehicles.length > 0 && (
          <div className="space-y-8">

            {/* Featured */}
            {dist.featured.length > 0 && (
              <div className={cn(strategy.featuredCount > 1 ? 'grid gap-6 lg:grid-cols-2' : '')}>
                {dist.featured.map(v => (
                  <FeaturedCard key={v.id} vehicle={v} visible={visible} />
                ))}
              </div>
            )}

            {/* Divider */}
            {dist.featured.length > 0 && dist.grid.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
                  Autres disponibilités
                </span>
                <div className="h-px bg-slate-100 flex-1" />
              </div>
            )}

            {/* Grid */}
            {dist.grid.length > 0 && (
              <div className={cn(
                'grid gap-5',
                strategy.gridColumns.mobile === 1 && 'grid-cols-1',
                strategy.gridColumns.tablet === 2 && 'sm:grid-cols-2',
                strategy.gridColumns.desktop === 2 && 'lg:grid-cols-2',
                strategy.gridColumns.desktop === 3 && 'lg:grid-cols-3',
                strategy.gridColumns.desktop === 4 && 'lg:grid-cols-4',
              )}>
                {dist.grid.map((v, i) => (
                  <VehicleCard key={v.id} vehicle={v} index={i} visible={visible} />
                ))}
              </div>
            )}

            {/* More vehicles nudge */}
            {dist.hidden.length > 0 && (
              <div className="flex justify-center">
                <Link href={viewAllHref}
                  className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <PlusCircle className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-800">
                      {dist.hidden.length} autre{dist.hidden.length > 1 ? 's' : ''} véhicule{dist.hidden.length > 1 ? 's' : ''} disponible{dist.hidden.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-slate-400">Voir toute la sélection</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all ml-2" strokeWidth={2} />
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
