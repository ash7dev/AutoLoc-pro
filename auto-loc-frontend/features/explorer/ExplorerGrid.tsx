'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  searchVehicles,
  type VehicleSearchResult,
  type VehicleType,
  type FuelType,
  type Transmission,
} from '@/lib/nestjs/vehicles';
import { apiFetch } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { KycNudgeModal } from '@/features/onboarding/KycNudgeModal';
import { ExplorerHero } from './ExplorerHero';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerActiveFilters, getFilterPills } from './ExplorerActiveFilters';
import { ExplorerResultsHeader } from './ExplorerResultsHeader';
import { ExplorerVehicleCard } from './ExplorerVehicleCard';
import { VehicleGridSkeleton } from './ExplorerSkeleton';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
export type VehicleGridItem = VehicleSearchResult & {
  carburant?: FuelType | null;
  transmission?: Transmission | null;
  nombrePlaces?: number | null;
  proprietaireId?: string;
  photos?: { id: string; url: string; estPrincipale?: boolean }[];
  tarifsProgressifs?: { id?: string; joursMin: number; joursMax?: number | null; prix: number }[];
  statut?: string;
  totalAvis?: number;
  adresse?: string;
  immatriculation?: string;
  joursMinimum?: number;
  ageMinimum?: number;
};

export interface ExplorerFiltersState {
  zone: string;
  type: string;
  budgetMin: number | null;
  budgetMax: number | null;
  fuel: string;
  transmission: string;
  sort: string;
  places: number | null;
  noteMin: number | null;
  equipements: string[];
  nearMe: boolean;
}

export const DEFAULT_FILTERS: ExplorerFiltersState = {
  zone: '',
  type: '',
  budgetMin: null,
  budgetMax: null,
  fuel: '',
  transmission: '',
  sort: 'popular',
  places: null,
  noteMin: null,
  equipements: [],
  nearMe: false,
};

/* ════════════════════════════════════════════════════════════════
   DISPLAY STRATEGY ENGINE
════════════════════════════════════════════════════════════════ */
interface DisplayStrategy {
  name: 'sparse' | 'limited' | 'normal' | 'abundant';
  featuredCount: number;
  gridCols: { sm: number; lg: number };
  priorityRules: Array<{
    field: keyof VehicleGridItem;
    direction: 'asc' | 'desc';
    weight: number;
  }>;
}

const STRATEGIES: Record<string, DisplayStrategy> = {
  sparse: { name: 'sparse', featuredCount: 1, gridCols: { sm: 1, lg: 2 }, priorityRules: [{ field: 'totalLocations', direction: 'desc', weight: 8 }, { field: 'note', direction: 'desc', weight: 7 }, { field: 'prixParJour', direction: 'asc', weight: 5 }] },
  limited: { name: 'limited', featuredCount: 1, gridCols: { sm: 2, lg: 2 }, priorityRules: [{ field: 'totalLocations', direction: 'desc', weight: 8 }, { field: 'note', direction: 'desc', weight: 7 }, { field: 'prixParJour', direction: 'asc', weight: 5 }] },
  normal: { name: 'normal', featuredCount: 1, gridCols: { sm: 2, lg: 3 }, priorityRules: [{ field: 'note', direction: 'desc', weight: 7 }, { field: 'totalLocations', direction: 'desc', weight: 6 }, { field: 'prixParJour', direction: 'asc', weight: 4 }] },
  abundant: { name: 'abundant', featuredCount: 2, gridCols: { sm: 2, lg: 3 }, priorityRules: [{ field: 'note', direction: 'desc', weight: 7 }, { field: 'totalLocations', direction: 'desc', weight: 6 }, { field: 'prixParJour', direction: 'asc', weight: 4 }] },
};

function pickStrategy(n: number): DisplayStrategy {
  if (n <= 3) return STRATEGIES.sparse;
  if (n <= 6) return STRATEGIES.limited;
  if (n <= 12) return STRATEGIES.normal;
  return STRATEGIES.abundant;
}

function calcScore(v: VehicleGridItem, rules: DisplayStrategy['priorityRules']): number {
  return rules.reduce((acc, r) => {
    const raw = (v[r.field] as number) ?? 0;
    const norm =
      r.field === 'note' ? raw / 5
        : r.field === 'totalLocations' ? Math.min(raw / 20, 1)
          : Math.max(0, 1 - raw / 100_000);
    return acc + (r.direction === 'desc' ? norm : 1 - norm) * r.weight;
  }, 0);
}

function distribute(vehicles: VehicleGridItem[], s: DisplayStrategy, scoreSort: boolean) {
  const ordered = scoreSort
    ? [...vehicles].sort((a, b) => calcScore(b, s.priorityRules) - calcScore(a, s.priorityRules))
    : vehicles;
  return {
    featured: ordered.slice(0, s.featuredCount),
    grid: ordered.slice(s.featuredCount),
    total: vehicles.length,
  };
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Car className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center max-w-xs">
        <p className="text-[15px] font-bold text-slate-700">Aucun véhicule trouvé</p>
        <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">
          {hasFilters
            ? 'Vos filtres actifs ne correspondent à aucun résultat. Essayez de les élargir.'
            : 'Aucun véhicule disponible pour le moment.'}
        </p>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ERROR STATE
════════════════════════════════════════════════════════════════ */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 rounded-2xl border border-dashed border-red-100 bg-red-50/30">
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
        <Car className="h-6 w-6 text-red-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-bold text-slate-600">Impossible de charger les véhicules</p>
        <p className="mt-1 text-[12px] text-slate-400">Vérifiez votre connexion et réessayez.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
      >
        Réessayer
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   RESULTS AREA — grid + featured + divider + counters
════════════════════════════════════════════════════════════════ */
function ResultsArea({
  loading,
  error,
  filteredVehicles,
  strategy,
  dist,
  hasActiveFilters,
  onReset,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  filteredVehicles: VehicleGridItem[];
  strategy: DisplayStrategy;
  dist: ReturnType<typeof distribute>;
  hasActiveFilters: boolean;
  onReset: () => void;
  onRetry: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Re-attach observer when loading finishes (sectionRef.current is null during skeleton)
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.03 },
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return <VehicleGridSkeleton count={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (filteredVehicles.length === 0) return <EmptyState hasFilters={hasActiveFilters} onReset={onReset} />;

  const gridColsCls = cn(
    'grid gap-4 lg:gap-5',
    strategy.gridCols.sm === 1 && 'grid-cols-1',
    strategy.gridCols.sm === 2 && 'sm:grid-cols-2',
    strategy.gridCols.lg === 2 && 'lg:grid-cols-2',
    strategy.gridCols.lg === 3 && 'lg:grid-cols-3',
    'grid-cols-1',
  );

  return (
    <div ref={sectionRef} className="space-y-7">

      {/* ── Featured ─────────────────────────────────────────── */}
      {dist.featured.length > 0 && (
        <div
          className={cn(
            strategy.featuredCount > 1 ? 'grid gap-5 lg:grid-cols-2' : '',
            'transition-all duration-700',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          )}
        >
          {dist.featured.map((vehicle) => {
            const qualifies = Number(vehicle.note) >= 4 && (vehicle.totalAvis ?? 0) >= 3;
            return (
              <div key={vehicle.id} className="relative">
                {qualifies && (
                  <div className="absolute -top-2.5 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 shadow-lg shadow-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        Coup de cœur
                      </span>
                    </span>
                  </div>
                )}
                <ExplorerVehicleCard vehicle={vehicle} featured />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Divider ──────────────────────────────────────────── */}
      {dist.featured.length > 0 && dist.grid.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-100 flex-1" />
          <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap px-1">
            {dist.grid.length} autre{dist.grid.length > 1 ? 's' : ''} disponible{dist.grid.length > 1 ? 's' : ''}
          </span>
          <div className="h-px bg-slate-100 flex-1" />
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      {dist.grid.length > 0 && (
        <div className={gridColsCls}>
          {dist.grid.map((vehicle, i) => (
            <div
              key={vehicle.id}
              className={cn(
                'transition-all duration-500',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: `${Math.min(i * 60, 400)}ms` }}
            >
              <ExplorerVehicleCard vehicle={vehicle} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   RESULTS HEADER — count + title + sort
════════════════════════════════════════════════════════════════ */
function ResultsHeader({
  count,
  loading,
  sort,
  onSortChange,
}: {
  count: number;
  loading: boolean;
  sort: string;
  onSortChange: (s: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-black tracking-tight text-slate-900">
            {loading ? (
              <span className="inline-block h-6 w-48 rounded-lg bg-slate-100 animate-pulse" />
            ) : count === 0 ? 'Aucun résultat' : (
              <>
                <span className="text-emerald-500">{count}</span>{' '}
                véhicule{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
              </>
            )}
          </h2>
        </div>
        {!loading && count > 0 && (
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">
            Vérifiés et prêts à louer
          </p>
        )}
      </div>

      <ExplorerResultsHeader
        totalResults={count}
        sort={sort}
        onSortChange={onSortChange}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR
════════════════════════════════════════════════════════════════ */
export function ExplorerGrid(): React.ReactElement {
  const [filters, setFilters] = useState<ExplorerFiltersState>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleGridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [kycStatus, setKycStatus] = useState<ProfileResponse['kycStatus']>(undefined);

  useEffect(() => {
    let signupAt: number | null = null;
    try {
      const raw = localStorage.getItem('autoloc_signup_at');
      signupAt = raw ? Number(raw) : null;
    } catch {
      signupAt = null;
    }
    if (!signupAt || !Number.isFinite(signupAt)) return;

    let active = true;
    apiFetch<ProfileResponse>('/auth/me')
      .then((profile) => {
        if (active) setKycStatus(profile.kycStatus);
      })
      .catch(() => {
        // not logged in or unreachable
      });
    return () => { active = false; };
  }, []);

  /* API fetch */
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const sortMap: Record<string, { by: string; order: 'asc' | 'desc' }> = {
        popular: { by: 'totalLocations', order: 'desc' },
        rating: { by: 'note', order: 'desc' },
        'price-asc': { by: 'prixParJour', order: 'asc' },
        'price-desc': { by: 'prixParJour', order: 'desc' },
        newest: { by: 'annee', order: 'desc' },
      };
      const { by, order } = sortMap[filters.sort] ?? { by: 'totalLocations', order: 'desc' };

      // Geolocation: auto-detect if "nearMe" is active
      let geoParams: { latitude?: number; longitude?: number; rayon?: number } = {};
      if (filters.nearMe && typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }),
          );
          geoParams = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            rayon: 30,
          };
        } catch {
          // Geolocation refused or unavailable — search without it
        }
      }

      const result = await searchVehicles({
        type: (filters.type as VehicleType) || undefined,
        ville: filters.zone || undefined,
        prixMin: filters.budgetMin || undefined,
        prixMax: filters.budgetMax || undefined,
        carburant: (filters.fuel as FuelType) || undefined,
        transmission: (filters.transmission as Transmission) || undefined,
        placesMin: filters.places || undefined,
        noteMin: filters.noteMin || undefined,
        equipements: filters.equipements.length ? filters.equipements : undefined,
        sortBy: by as any,
        sortOrder: order,
        ...geoParams,
      });
      setVehicles(result.data ?? []);
    } catch {
      setError(true);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  /* Client-side text search */
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const q = searchQuery.toLowerCase();
    return vehicles.filter(
      v => v.marque.toLowerCase().includes(q) || v.modele.toLowerCase().includes(q) || v.ville.toLowerCase().includes(q),
    );
  }, [vehicles, searchQuery]);

  /* Strategy */
  const strategy = pickStrategy(filteredVehicles.length);
  const scoreSort = filters.sort === 'popular' || filters.sort === 'rating';
  const dist = distribute(filteredVehicles, strategy, scoreSort);

  /* Handlers */
  const handleFiltersChange = (f: ExplorerFiltersState) => setFilters(f);
  const handleReset = () => { setFilters(DEFAULT_FILTERS); setSearchQuery(''); };

  const activeFilterCount = getFilterPills(filters).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim().length > 0;

  return (
    <>
      <KycNudgeModal kycStatus={kycStatus} />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <ExplorerHero
        totalResults={filteredVehicles.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilterCount={activeFilterCount}
        onToggleMobileFilters={() => setMobileFiltersOpen(true)}
      />

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mb-5">
            <ExplorerActiveFilters
              filters={filters}
              onChange={handleFiltersChange}
              onClearAll={handleReset}
            />
          </div>
        )}

        {/* Layout: sidebar + results */}
        <div className="flex gap-7 lg:gap-10 items-start">

          {/* ── Sidebar (desktop) ─────────────────────────────── */}
          <ExplorerFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
            isMobileOpen={mobileFiltersOpen}
            onCloseMobile={() => setMobileFiltersOpen(false)}
            filteredCount={filteredVehicles.length}
          />

          {/* ── Results ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            <ResultsHeader
              count={filteredVehicles.length}
              loading={loading}
              sort={filters.sort}
              onSortChange={sort => handleFiltersChange({ ...filters, sort })}
            />

            <ResultsArea
              loading={loading}
              error={error}
              filteredVehicles={filteredVehicles}
              strategy={strategy}
              dist={dist}
              hasActiveFilters={hasActiveFilters}
              onReset={handleReset}
              onRetry={fetchVehicles}
            />

          </div>
        </div>
      </div>
    </>
  );
}
