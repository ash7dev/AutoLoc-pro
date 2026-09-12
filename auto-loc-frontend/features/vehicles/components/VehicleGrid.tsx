'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Car, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { VehicleCard } from './VehicleCard';

export interface VehicleGridProps {
  vehicles: VehicleSearchResult[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
  onEndReached?: () => void;
  /** Titre d'état vide sur-mesure */
  emptyTitle?: string;
  /** Message d'état vide sur-mesure */
  emptyMessage?: string;
  className?: string;
}

/* ════════════════════════════════════════════════════════════════
   SKELETON GRID
 ════════════════════════════════════════════════════════════════ */
function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-100 bg-white overflow-hidden animate-pulse flex flex-col gap-3 p-4"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="aspect-[16/10] w-full bg-slate-100 rounded-2xl" />
          <div className="h-5 w-40 bg-slate-100 rounded-lg" />
          <div className="h-3 w-28 bg-slate-100 rounded-md" />
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="h-7 bg-slate-50 rounded-xl" />
            <div className="h-7 bg-slate-50 rounded-xl" />
          </div>
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex justify-between items-center mt-auto">
            <div className="h-8 w-28 bg-slate-100 rounded-xl" />
            <div className="h-9 w-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
 ════════════════════════════════════════════════════════════════ */
function EmptyState({
  hasFilters,
  onReset,
  title = 'Aucun véhicule trouvé',
  message = 'Aucun véhicule ne correspond à votre recherche actuellement.',
}: {
  hasFilters?: boolean;
  onReset?: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 px-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 text-center my-4">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <Car className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="max-w-md">
        <h4 className="text-[17px] font-bold text-slate-800 font-editorial mb-1">
          {title}
        </h4>
        <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
          {hasFilters
            ? 'Vos filtres actuels restreignent la recherche. Essayez d\'en supprimer quelques-uns.'
            : message}
        </p>
      </div>
      {hasFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-95"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Effacer tous les filtres
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ERROR STATE
 ════════════════════════════════════════════════════════════════ */
function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-16 px-4 rounded-3xl border border-dashed border-red-200/80 bg-red-50/20 text-center my-4">
      <p className="text-[14px] font-bold text-slate-700 font-editorial">
        Impossible d'charger les véhicules
      </p>
      <p className="text-[12px] text-slate-400">
        Un problème réseau est survenu. Veuillez réessayer.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[12px] font-bold text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Réessayer
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN VEHICLE GRID (Vertical Infinite Feed like Instagram)
 ════════════════════════════════════════════════════════════════ */
export function VehicleGrid({
  vehicles,
  loading = false,
  error = false,
  onRetry,
  onResetFilters,
  hasActiveFilters = false,
  onEndReached,
  emptyTitle,
  emptyMessage,
  className,
}: VehicleGridProps): React.ReactElement {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);
  const onEndReachedRef = useRef(onEndReached);

  useEffect(() => {
    onEndReachedRef.current = onEndReached;
  }, [onEndReached]);

  // Observer pour défiler verticalement style Feed Instagram sans saccades
  useEffect(() => {
    if (loading || !sentinelRef.current || !onEndReached) return;
    triggeredRef.current = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true;
          onEndReachedRef.current?.();
        }
      },
      { rootMargin: '0px 0px 800px 0px', threshold: 0 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, vehicles.length, onEndReached]);

  if (loading) return <GridSkeleton count={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (!vehicles || vehicles.length === 0) {
    return (
      <EmptyState
        hasFilters={hasActiveFilters}
        onReset={onResetFilters}
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* ── Vertical Intelligent Feed Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {vehicles.map((v, i) => (
          <div
            key={v.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards"
            style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
          >
            <VehicleCard vehicle={v} variant="standard" priorityImage={i < 4} />
          </div>
        ))}
      </div>

      {/* Invisible sentinel for continuous vertical scroll */}
      <div ref={sentinelRef} className="h-px w-full pointer-events-none opacity-0" />
    </div>
  );
}
