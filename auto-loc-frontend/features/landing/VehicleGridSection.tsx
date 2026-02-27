'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, ArrowRight, Heart,
  Settings2, Clock, Zap, Car, TrendingUp, Loader2,
  Rocket, PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchVehicles, type VehicleSearchResult, type VehicleType } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { value: '', label: 'Tous', icon: Car },
  { value: 'BERLINE', label: 'Berlines', icon: Car },
  { value: 'SUV', label: 'SUV', icon: Car },
  { value: 'PICKUP', label: 'Pick-up', icon: Car },
  { value: 'UTILITAIRE', label: 'Utilitaires', icon: Settings2 },
];

// ─── Skeleton card (loading placeholder) ──────────────────────────────────────
function SkeletonFeaturedCard(): React.ReactElement {
  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden',
        'bg-black border border-white/10',
      )}
      aria-hidden="true"
    >
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] bg-slate-800 animate-pulse" />
      <div className="flex flex-col justify-center p-8 lg:p-10 gap-4">
        <div className="h-3 w-24 rounded-full bg-white/5 animate-pulse" />
        <div className="h-8 w-64 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-4 w-16 rounded-full bg-white/5 animate-pulse" />
        <div className="mt-4 flex gap-3">
          <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-8 w-28 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="mt-6 flex items-center gap-5">
          <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-12 w-44 rounded-xl bg-emerald-400/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ index }: { index: number }): React.ReactElement {
  return (
    <div
      className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
      aria-hidden="true"
    >
      <div className="aspect-[16/10] bg-slate-100 animate-pulse" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div>
          <div className="h-5 w-40 rounded-lg bg-slate-100 animate-pulse" />
          <div className="mt-2 h-3 w-12 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="border-t border-slate-100" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Featured hero card (first vehicle, large) ────────────────────────────────
function FeaturedVehicleCard({
  vehicle,
  isVisible,
}: {
  vehicle: VehicleSearchResult;
  isVisible: boolean;
}): React.ReactElement {
  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden',
        'bg-black border border-white/10',
        'hover:border-emerald-400/20 hover:shadow-2xl hover:shadow-emerald-400/5',
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
    >
      {/* Photo side */}
      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] overflow-hidden">
        {vehicle.photoUrl ? (
          <Image
            src={vehicle.photoUrl}
            alt={`Location ${vehicle.marque} ${vehicle.modele}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-900">
            <Car className="h-16 w-16 text-white/10" strokeWidth={1} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />

        {/* Featured badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-1.5 shadow-lg shadow-emerald-400/30">
            <TrendingUp className="h-3 w-3 text-black" strokeWidth={2.5} />
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-black">
              Coup de cœur
            </span>
          </span>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/60 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10 transition-all duration-200"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Content side */}
      <div className="relative flex flex-col justify-center p-5 lg:p-10">
        {/* Glow effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          {/* Type */}
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-emerald-400/60">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>

          {/* Name */}
          <h3 className="mt-2 text-[28px] lg:text-[32px] font-black tracking-tight text-white leading-tight">
            {vehicle.marque}{' '}
            <span className="text-emerald-400">{vehicle.modele}</span>
          </h3>

          <p className="mt-1 text-[13px] font-medium text-white/35">
            {vehicle.annee}
          </p>

          {/* Stats row */}
          <div className="mt-6 flex items-center gap-4 flex-wrap">
            {vehicle.note > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                <span className="text-[13px] font-bold text-white">{vehicle.note.toFixed(1)}</span>
              </span>
            )}
            {vehicle.totalLocations > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
                <span className="text-[12px] font-semibold text-white/60">{vehicle.totalLocations} locations</span>
              </span>
            )}
          </div>

          {/* Location */}
          <div className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-white/35">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {vehicle.ville}
          </div>

          {/* Price + CTA */}
          <div className="mt-8 flex items-center gap-5 flex-wrap">
            <div>
              <p className="text-[28px] font-black text-emerald-400 leading-none tabular-nums">
                {formatPrice(vehicle.prixParJour)}
                <span className="text-[14px] font-semibold text-emerald-400/50 ml-1">FCFA</span>
              </p>
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wide mt-1">
                par jour
              </p>
            </div>

            <span className={cn(
              'inline-flex items-center gap-2 rounded-xl px-6 py-3',
              'bg-emerald-400 text-black text-[13px] font-bold',
              'shadow-lg shadow-emerald-400/25',
              'group-hover:bg-emerald-300 group-hover:shadow-xl group-hover:shadow-emerald-400/30',
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

// ─── Standard vehicle card ────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  index,
  isVisible,
}: {
  vehicle: VehicleSearchResult;
  index: number;
  isVisible: boolean;
}): React.ReactElement {
  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-slate-100',
        'shadow-sm shadow-slate-200/60 hover:shadow-xl hover:shadow-slate-200/80',
        'hover:-translate-y-1.5 hover:border-slate-200',
        'transition-all duration-500 ease-out overflow-hidden',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {vehicle.photoUrl ? (
          <Image
            src={vehicle.photoUrl}
            alt={`Location ${vehicle.marque} ${vehicle.modele} à ${vehicle.ville}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black border border-emerald-400/30 px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Vérifié</span>
          </span>
          {vehicle.totalLocations >= 5 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1">
              <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Populaire</span>
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Favoris"
        >
          <Heart className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {/* Price bottom-right */}
        <div className="absolute bottom-3 right-3 rounded-xl bg-black/80 backdrop-blur-sm px-3 py-2 text-right">
          <p className="text-[17px] font-black text-emerald-400 leading-none tabular-nums">
            {formatPrice(vehicle.prixParJour)}
          </p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-0.5">FCFA / jour</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Type + city */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-black/30">
            {TYPE_LABELS[vehicle.type] ?? vehicle.type}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-black/35">
            <MapPin className="h-3 w-3" strokeWidth={2} />
            {vehicle.ville}
          </span>
        </div>

        {/* Name */}
        <div>
          <h3 className="text-[16px] font-black tracking-tight text-black leading-tight">
            {vehicle.marque}{' '}
            <span className="text-emerald-500">{vehicle.modele}</span>
          </h3>
          <p className="text-[12px] font-medium text-black/35 mt-0.5">
            {vehicle.annee}
          </p>
        </div>

        <div className="border-t border-slate-100" />

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {vehicle.note > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-black">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                {vehicle.note.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-medium text-black/30">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              {vehicle.totalLocations} loc.
            </span>
          </div>

          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-xl',
            'bg-black px-3.5 py-2 text-[12px] font-semibold text-emerald-400',
            'group-hover:bg-emerald-400 group-hover:text-black',
            'transition-all duration-200 shadow-sm shadow-black/10',
          )}>
            Réserver
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Empty state — filtered (a type filter returns 0) ─────────────────────────
function EmptyFilteredState({
  filterLabel,
  onReset,
}: {
  filterLabel: string;
  onReset: () => void;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Car className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-black/60">
          Aucun <span className="lowercase">{filterLabel}</span> disponible pour le moment
        </p>
        <p className="mt-1 text-[13px] font-medium text-black/35">
          D&apos;autres catégories de véhicules sont disponibles.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl bg-black px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
      >
        Voir tous les véhicules
      </button>
    </div>
  );
}

// ─── Empty state — global (0 vehicles in DB — MVP fallback) ──────────────────
function EmptyGlobalState(): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black py-16 px-8 lg:py-20 lg:px-16 text-center">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
          <Rocket className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
        </div>

        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Bientôt <span className="text-emerald-400">disponible</span>
          </h3>
          <p className="mt-3 text-[14px] font-medium leading-relaxed text-white/50">
            Notre flotte de véhicules vérifiés sera affichée ici très prochainement.
            Nous travaillons activement pour vous proposer les meilleures offres au Sénégal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/explorer"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-6 py-3',
              'bg-emerald-400 text-black text-[13px] font-bold',
              'shadow-lg shadow-emerald-400/25',
              'hover:bg-emerald-300 transition-all duration-200',
            )}
          >
            Explorer la plateforme
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/dashboard/owner"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-6 py-3',
              'border border-white/15 text-white/70 text-[13px] font-semibold',
              'hover:border-emerald-400/30 hover:text-emerald-400 transition-all duration-200',
            )}
          >
            <PlusCircle className="h-4 w-4" strokeWidth={2} />
            Proposer un véhicule
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
interface VehicleGridSectionProps {
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  viewAllHref?: string;
}

export function VehicleGridSection({
  title = 'Véhicules disponibles',
  subtitle = 'Découvrez notre sélection de véhicules vérifiés partout au Sénégal',
  showFilters = true,
  viewAllHref = '/explorer',
}: VehicleGridSectionProps): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState('');
  const [vehicles, setVehicles] = useState<VehicleSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch vehicles from API — no city constraint for landing page
  const fetchVehicles = useCallback(async (type?: string) => {
    setLoading(true);
    setError(false);
    try {
      const result = await searchVehicles({
        type: (type || undefined) as VehicleType | undefined,
      });
      setVehicles(result.data ?? []);
    } catch {
      setError(true);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles(activeFilter || undefined);
  }, [activeFilter, fetchVehicles]);

  // Get the label of the active filter tab
  const activeFilterLabel = FILTER_TABS.find((t) => t.value === activeFilter)?.label ?? '';

  // First vehicle = featured hero, rest = grid
  const [featured, ...rest] = vehicles;

  return (
    <section ref={sectionRef} className="px-4 py-10 lg:px-8 lg:py-14" aria-labelledby="vehicles-heading">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-4">
              <Zap className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Sélection du moment
              </span>
            </div>
            <h2
              id="vehicles-heading"
              className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
            >
              {title.split(' ').map((word, i, arr) =>
                i === arr.length - 1 ? (
                  <span key={i} className="text-emerald-400"> {word}</span>
                ) : (
                  <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
                )
              )}
            </h2>
            <p className="mt-3 max-w-lg text-[14.5px] font-medium leading-relaxed text-black/40">
              {subtitle}
            </p>
          </div>

          <Link
            href={viewAllHref}
            className={cn(
              'inline-flex flex-shrink-0 items-center gap-2 self-start rounded-xl',
              'border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-black',
              'shadow-sm transition-all duration-200',
              'hover:border-slate-300 hover:bg-slate-50 hover:shadow-md lg:self-auto',
            )}
          >
            Voir tous les véhicules
            <ArrowRight className="h-3.5 w-3.5 text-black/30" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {FILTER_TABS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={cn(
                  'rounded-xl px-4 py-2 text-[13px] font-semibold tracking-tight transition-all duration-200',
                  activeFilter === value
                    ? 'bg-black text-emerald-400 shadow-md shadow-black/15'
                    : 'bg-slate-100 text-black/60 hover:bg-slate-200 hover:text-black',
                )}
              >
                {label}
              </button>
            ))}

            {!loading && (
              <span className="ml-auto text-[12px] font-medium text-black/30">
                {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Loading state — skeleton cards */}
        {loading && (
          <div className="space-y-6">
            <SkeletonFeaturedCard />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-5 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Car className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-black/50">Impossible de charger les véhicules</p>
              <p className="mt-1 text-[13px] font-medium text-black/30">
                Vérifiez votre connexion et réessayez.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fetchVehicles(activeFilter || undefined)}
              className="rounded-xl bg-black px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty state — filter-specific or global MVP fallback */}
        {!loading && !error && vehicles.length === 0 && (
          activeFilter
            ? <EmptyFilteredState filterLabel={activeFilterLabel} onReset={() => setActiveFilter('')} />
            : <EmptyGlobalState />
        )}

        {/* Data loaded: Featured card + Grid */}
        {!loading && !error && vehicles.length > 0 && (
          <>
            {/* Featured card (first vehicle) */}
            {featured && (
              <div className="mb-6">
                <FeaturedVehicleCard vehicle={featured} isVisible={isVisible} />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((vehicle, i) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} isVisible={isVisible} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
