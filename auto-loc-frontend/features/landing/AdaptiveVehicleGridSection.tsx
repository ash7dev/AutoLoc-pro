/**
 * VehicleGridSection avec affichage adaptatif
 * S'adapte automatiquement au nombre de véhicules reçus
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Star, ArrowRight, Heart,
  Settings2, Clock, Zap, Car, TrendingUp, Loader2,
  Rocket, PlusCircle, Filter, Grid3x3, List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';
import { 
  useAdaptiveVehicleDisplay,
  getDisplayHints,
  type AdaptiveDisplayOptions,
  type VehicleDistribution,
} from './adaptive-display-strategies';
import { EnhancedVehicleCard, EnhancedFeaturedVehicleCard } from './EnhancedVehicleGridSection';

// ── Composants de layout adaptatif ─────────────────────────────────────────────

interface AdaptiveHeaderProps {
  title: string;
  subtitle: string;
  showViewAll: boolean;
  viewAllHref?: string;
  strategy: any;
  stats: any;
}

function AdaptiveHeader({ 
  title, 
  subtitle, 
  showViewAll, 
  viewAllHref = '/explorer',
  strategy,
  stats 
}: AdaptiveHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {/* Badge stratégique */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-4">
          {strategy.name === 'sparse' && (
            <>
              <Star className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Sélection premium
              </span>
            </>
          )}
          {strategy.name === 'limited' && (
            <>
              <Zap className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Disponibles maintenant
              </span>
            </>
          )}
          {strategy.name === 'normal' && (
            <>
              <Zap className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Sélection du moment
              </span>
            </>
          )}
          {strategy.name === 'abundant' && (
            <>
              <TrendingUp className="h-3 w-3 text-emerald-500" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Large sélection
              </span>
            </>
          )}
        </div>

        {/* Titre dynamique */}
        <h2 className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl">
          {title.split(' ').map((word, i, arr) =>
            i === arr.length - 1 ? (
              <span key={i} className="text-emerald-400"> {word}</span>
            ) : (
              <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
            )
          )}
        </h2>

        {/* Sous-titre avec statistiques */}
        <p className="mt-3 max-w-lg text-[14.5px] font-medium leading-relaxed text-black/40">
          {subtitle}
          {stats.hasFallbacks && (
            <span className="text-amber-600 ml-1">· Données de démonstration</span>
          )}
        </p>

        {/* Statistiques détaillées */}
        <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-black/50">
          <span className="flex items-center gap-1">
            <Car className="h-3 w-3" />
            {stats.total} véhicule{stats.total > 1 ? 's' : ''}
          </span>
          {stats.featured > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {stats.featured} en avant
            </span>
          )}
          {stats.hidden > 0 && (
            <span className="flex items-center gap-1">
              <PlusCircle className="h-3 w-3" />
              {stats.hidden} supplémentaire{stats.hidden > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {showViewAll && (
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
        )}
      </div>
    </div>
  );
}

interface AdaptiveFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  vehicleCount: number;
  strategy: any;
}

function AdaptiveFilters({ 
  activeFilter, 
  onFilterChange, 
  vehicleCount, 
  strategy 
}: AdaptiveFiltersProps) {
  const FILTER_TABS = [
    { value: '', label: 'Tous', icon: Car },
    { value: 'BERLINE', label: 'Berlines', icon: Car },
    { value: 'SUV', label: 'SUV', icon: Car },
    { value: 'PICKUP', label: 'Pick-up', icon: Car },
    { value: 'UTILITAIRE', label: 'Utilitaires', icon: Settings2 },
  ];

  if (!strategy.showFilters) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {FILTER_TABS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange(value)}
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

      {/* Compteur adaptatif */}
      <span className="ml-auto text-[12px] font-medium text-black/30">
        {vehicleCount} résultat{vehicleCount > 1 ? 's' : ''}
        {strategy.name === 'abundant' && (
          <span className="text-emerald-600 ml-1">· Grande sélection</span>
        )}
      </span>
    </div>
  );
}

interface AdaptiveLayoutProps {
  distribution: VehicleDistribution;
  strategy: any;
  isVisible: boolean;
  gridClasses: string;
}

function AdaptiveLayout({ 
  distribution, 
  strategy, 
  isVisible, 
  gridClasses 
}: AdaptiveLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Featured vehicles */}
      {distribution.featured.length > 0 && (
        <div className={cn(
          'space-y-6',
          strategy.featuredCount > 1 && 'grid gap-6 lg:grid-cols-2'
        )}>
          {distribution.featured.map((vehicle, index) => (
            <EnhancedFeaturedVehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isVisible={isVisible}
            />
          ))}
        </div>
      )}

      {/* Grid vehicles */}
      {distribution.grid.length > 0 && (
        <>
          {distribution.featured.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">
                Autres disponibilités
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
          )}
          
          <div className={gridClasses}>
            {distribution.grid.map((vehicle, index) => (
              <EnhancedVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        </>
      )}

      {/* Hidden vehicles indicator */}
      {distribution.hidden.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
            <PlusCircle className="h-5 w-5 text-slate-400" strokeWidth={2} />
            <div className="text-left">
              <p className="text-[13px] font-semibold text-slate-700">
                {distribution.hidden.length} autre{distribution.hidden.length > 1 ? 's' : ''} véhicule{distribution.hidden.length > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-slate-500">
                Utilisez les filtres ou explorez la recherche complète
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Composant principal adaptatif ─────────────────────────────────────────────────

interface AdaptiveVehicleGridSectionProps {
  vehicles: any[];
  loading?: boolean;
  error?: boolean;
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  viewAllHref?: string;
  displayOptions?: AdaptiveDisplayOptions;
  onRetry?: () => void;
  onFilterChange?: (filter: string) => void;
}

export function AdaptiveVehicleGridSection({
  vehicles,
  loading = false,
  error = false,
  title,
  subtitle,
  showFilters = true,
  viewAllHref = '/explorer',
  displayOptions = {},
  onRetry,
  onFilterChange,
}: AdaptiveVehicleGridSectionProps) {
  const [activeFilter, setActiveFilter] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection observer pour les animations
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

  // Utiliser le hook adaptatif
  const {
    strategy,
    distribution,
    gridClasses,
    showFilters: shouldShowFilters,
    showViewAll,
    stats,
  } = useAdaptiveVehicleDisplay(vehicles, {
    enableAutoStrategy: true,
    ...displayOptions,
  });

  // Gestion des filtres
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  // Hints d'affichage
  const displayHints = getDisplayHints(strategy, vehicles.length);

  return (
    <section ref={sectionRef} className="px-4 py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        
        {/* Header adaptatif */}
        <AdaptiveHeader
          title={title || displayHints.title}
          subtitle={subtitle || displayHints.subtitle}
          showViewAll={showViewAll}
          viewAllHref={viewAllHref}
          strategy={strategy}
          stats={stats}
        />

        {/* Filtres adaptatifs */}
        {showFilters && shouldShowFilters && (
          <AdaptiveFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            vehicleCount={vehicles.length}
            strategy={strategy}
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-6">
            {/* Skeletons selon la stratégie */}
            <div className={cn(
              'space-y-6',
              strategy.featuredCount > 1 && 'grid gap-6 lg:grid-cols-2'
            )}>
              {Array.from({ length: strategy.featuredCount }).map((_, i) => (
                <div key={`featured-${i}`} className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden bg-black border border-white/10">
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
              ))}
            </div>
            
            {/* Grid skeletons */}
            <div className={gridClasses}>
              {Array.from({ length: Math.min(strategy.maxGridItems, 6) }).map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
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
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
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
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-black px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-400 hover:text-black transition-all"
              >
                Réessayer
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-black py-16 px-8 lg:py-20 lg:px-16 text-center">
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
                  Aucun véhicule disponible
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-white/50">
                  Revenez bientôt ou explorez d'autres options sur la plateforme.
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
        )}

        {/* Layout adaptatif */}
        {!loading && !error && vehicles.length > 0 && (
          <AdaptiveLayout
            distribution={distribution}
            strategy={strategy}
            isVisible={isVisible}
            gridClasses={gridClasses}
          />
        )}

      </div>
    </section>
  );
}
