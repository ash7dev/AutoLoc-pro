'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Car, SlidersHorizontal, ArrowLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  searchVehicles,
  type VehicleSearchResult,
  type VehicleType,
  type FuelType,
  type Transmission,
} from '@/lib/nestjs/vehicles';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { useProfileStore } from '@/features/auth/stores/profile.store';
import { KycNudgeModal } from '@/features/onboarding/KycNudgeModal';
import { ExplorerHero } from './ExplorerHero';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerActiveFilters, getFilterPills } from './ExplorerActiveFilters';
import { useCurrency } from '@/providers/currency-provider';
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
  dateDebut?: string;
  dateFin?: string;
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
   DISPLAY STRATEGY — colonnes desktop uniquement.
   Le backend renvoie déjà les véhicules triés (sortBy/sortOrder) ;
   on n'effectue plus de re-tri côté client pour rester compatible
   avec la pagination invisible (sinon les cartes déjà affichées
   sauteraient à chaque page chargée).
════════════════════════════════════════════════════════════════ */
interface DisplayStrategy {
  name: 'sparse' | 'limited' | 'normal' | 'abundant';
  gridCols: { lg: number };
}

const STRATEGIES: Record<string, DisplayStrategy> = {
  sparse: { name: 'sparse', gridCols: { lg: 2 } },
  limited: { name: 'limited', gridCols: { lg: 2 } },
  normal: { name: 'normal', gridCols: { lg: 3 } },
  abundant: { name: 'abundant', gridCols: { lg: 3 } },
};

function pickStrategy(n: number): DisplayStrategy {
  if (n <= 3) return STRATEGIES.sparse;
  if (n <= 6) return STRATEGIES.limited;
  if (n <= 12) return STRATEGIES.normal;
  return STRATEGIES.abundant;
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
  vehicles,
  strategy,
  hasActiveFilters,
  onReset,
  onRetry,
  onEndReached,
}: {
  loading: boolean;
  error: boolean;
  vehicles: VehicleGridItem[];
  strategy: DisplayStrategy;
  hasActiveFilters: boolean;
  onReset: () => void;
  onRetry: () => void;
  onEndReached: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);
  const onEndReachedRef = useRef(onEndReached);

  useEffect(() => {
    onEndReachedRef.current = onEndReached;
  }, [onEndReached]);

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

  // Pagination invisible : sentinel observé par rapport à la fenêtre (scroll vertical de la page).
  // Re-armé à chaque ajout de véhicules pour pouvoir déclencher la page suivante.
  useEffect(() => {
    if (loading || !sentinelRef.current) return;
    triggeredRef.current = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggeredRef.current) {
          triggeredRef.current = true;
          onEndReachedRef.current();
        }
      },
      { rootMargin: '0px 0px 600px 0px' },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loading, vehicles.length]);

  if (loading) return <VehicleGridSkeleton count={6} />;
  if (error) return <ErrorState onRetry={onRetry} />;
  if (vehicles.length === 0) return <EmptyState hasFilters={hasActiveFilters} onReset={onReset} />;

  const gridColsCls = cn(
    'grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5',
    strategy.gridCols.lg === 2 && 'lg:grid-cols-2',
    strategy.gridCols.lg === 3 && 'lg:grid-cols-3',
  );

  return (
    <div ref={sectionRef} className="space-y-7">

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className={gridColsCls}>
        {vehicles.map((vehicle, i) => (
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

      {/* Sentinel pagination invisible */}
      <div ref={sentinelRef} className="h-px w-full" />
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
        sort={sort}
        onSortChange={onSortChange}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR
════════════════════════════════════════════════════════════════ */
export function ExplorerGrid({ initialZone }: { initialZone?: string } = {}): React.ReactElement {
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ExplorerFiltersState>(() => ({
    ...DEFAULT_FILTERS,
    zone: initialZone || (searchParams.get('zone') ?? ''),
    type: searchParams.get('type') ?? '',
    budgetMin: searchParams.has('budgetMin') ? Number(searchParams.get('budgetMin')) : null,
    budgetMax: searchParams.has('budget') ? Number(searchParams.get('budget')) : null,
    fuel: searchParams.get('fuel') ?? '',
    transmission: searchParams.get('transmission') ?? '',
    places: searchParams.has('places') ? Number(searchParams.get('places')) : null,
    noteMin: searchParams.has('noteMin') ? Number(searchParams.get('noteMin')) : null,
    equipements: searchParams.getAll('equipements'),
    nearMe: searchParams.get('nearMe') === '1',
    dateDebut: searchParams.get('debut') ?? undefined,
    dateFin: searchParams.get('fin') ?? undefined,
  }));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleGridItem[]>([]);
  const [total, setTotal] = useState(0);
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

    const cached = useProfileStore.getState().profile;
    if (cached) {
      setKycStatus(cached.kycStatus);
      return;
    }

    const unsub = useProfileStore.subscribe((state) => {
      if (state.profile) {
        setKycStatus(state.profile.kycStatus);
        unsub();
      }
    });
    return unsub;
  }, []);

  /* Debounced search to avoid too many API calls */
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* Pagination invisible */
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const geoParamsRef = useRef<{ latitude?: number; longitude?: number; rayon?: number }>({});

  /* Construit les paramètres de recherche communs (hors page/géoloc) */
  const buildBaseParams = useCallback(() => {
    const sortMap: Record<string, { by: string; order: 'asc' | 'desc' }> = {
      popular: { by: 'totalLocations', order: 'desc' },
      rating: { by: 'note', order: 'desc' },
      'price-asc': { by: 'prixParJour', order: 'asc' },
      'price-desc': { by: 'prixParJour', order: 'desc' },
      newest: { by: 'annee', order: 'desc' },
    };
    const { by, order } = sortMap[filters.sort] ?? { by: 'totalLocations', order: 'desc' };
    return {
      type: (filters.type as VehicleType) || undefined,
      ville: filters.zone || undefined,
      prixMin: filters.budgetMin || undefined,
      prixMax: filters.budgetMax || undefined,
      dateDebut: filters.dateDebut || undefined,
      dateFin: filters.dateFin || undefined,
      carburant: (filters.fuel as FuelType) || undefined,
      transmission: (filters.transmission as Transmission) || undefined,
      placesMin: filters.places || undefined,
      noteMin: filters.noteMin || undefined,
      equipements: filters.equipements.length ? filters.equipements : undefined,
      sortBy: by as any,
      sortOrder: order,
      q: debouncedSearch.trim() || undefined,
    };
  }, [filters, debouncedSearch]);

  /* API fetch — première page (reset complet) */
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(false);
    pageRef.current = 1;
    hasMoreRef.current = true;
    try {
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
      geoParamsRef.current = geoParams;

      const result = await searchVehicles({ ...buildBaseParams(), ...geoParams, page: 1 });
      const data = result.data ?? [];
      const resultTotal = result.total ?? data.length;
      setVehicles(data);
      setTotal(resultTotal);
      hasMoreRef.current = data.length > 0 && data.length < resultTotal;
    } catch {
      setError(true);
      setVehicles([]);
      hasMoreRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [filters, buildBaseParams]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  /* Pagination invisible — charge la page suivante et l'ajoute sans re-trier le reste */
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    try {
      const nextPage = pageRef.current + 1;
      const result = await searchVehicles({
        ...buildBaseParams(),
        ...geoParamsRef.current,
        page: nextPage,
      });
      const newData = result.data ?? [];
      if (newData.length === 0) {
        hasMoreRef.current = false;
        return;
      }
      setVehicles((prev) => {
        const next = [...prev, ...newData];
        if (next.length >= (result.total ?? next.length)) hasMoreRef.current = false;
        return next;
      });
      pageRef.current = nextPage;
    } catch (err) {
      console.error('Error loading more vehicles', err);
    } finally {
      loadingMoreRef.current = false;
    }
  }, [buildBaseParams]);

  /* Strategy — basée sur le total (stable), pas sur le nb d'éléments déjà chargés */
  const strategy = pickStrategy(total);

  /* Handlers */
  const handleFiltersChange = (f: ExplorerFiltersState) => setFilters(f);
  const handleReset = () => { setFilters(DEFAULT_FILTERS); setSearchQuery(''); };

  const activeFilterCount = getFilterPills(filters, formatPrice).length;
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.trim().length > 0;

  return (
    <>
      <KycNudgeModal kycStatus={kycStatus} />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <ExplorerHero
        totalResults={total}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilterCount={activeFilterCount}
        onToggleMobileFilters={() => setMobileFiltersOpen(true)}
      />

      {/* Mobile Sticky Search Bar Header */}
      <div className="md:hidden sticky top-[60px] z-40 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-600 active:scale-95 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
        </Link>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 text-left active:scale-[0.99] transition-all"
        >
          <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <Search className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-black text-slate-800 truncate leading-tight">
              {filters.zone ? (filters.zone.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) : 'Sénégal (Dakar)'}
            </p>
            <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 leading-none">
              {filters.dateDebut ? `${new Date(filters.dateDebut + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${filters.dateFin ? new Date(filters.dateFin + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}` : 'Ajouter des dates'}
            </p>
          </div>
        </button>
      </div>

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
            filteredCount={total}
          />

          {/* ── Results ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            <ResultsHeader
              count={total}
              loading={loading}
              sort={filters.sort}
              onSortChange={sort => handleFiltersChange({ ...filters, sort })}
            />

            <ResultsArea
              loading={loading}
              error={error}
              vehicles={vehicles}
              strategy={strategy}
              hasActiveFilters={hasActiveFilters}
              onReset={handleReset}
              onRetry={fetchVehicles}
              onEndReached={loadMore}
            />

          </div>
        </div>
      </div>

      {/* ── Mobile Floating Filter Button ────────────────────────── */}
      {!mobileFiltersOpen && (
        <div className="lg:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-6 py-3.5 rounded-full",
              "bg-slate-900 text-white shadow-2xl shadow-slate-900/40 border border-white/10",
              "active:scale-95 transition-all duration-200 animate-in fade-in slide-in-from-bottom-10"
            )}
          >
            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[13px] font-black uppercase tracking-wider">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black px-1.5">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-black tabular-nums">{total}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Auto{total > 1 ? 's' : ''}</span>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
