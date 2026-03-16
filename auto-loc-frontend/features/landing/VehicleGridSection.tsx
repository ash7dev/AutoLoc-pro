'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Car, TrendingUp,
  Rocket, PlusCircle, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  searchVehicles,
  type VehicleSearchResult,
  type VehicleType,
  type TarifTier,
  type VehicleStatus,
} from '@/lib/nestjs/vehicles';
import { ExplorerVehicleCard } from '@/features/explorer/ExplorerVehicleCard';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
type VehicleGridItem = VehicleSearchResult & {
  tarifsProgressifs?: TarifTier[];
  statut?: VehicleStatus;
  totalAvis?: number;
};

/* ════════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════════ */
const MAX_VISIBLE = 9;

const FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'BERLINE', label: 'Berlines' },
  { value: 'CITADINE', label: 'Citadines' },
  { value: 'SUV', label: 'SUV' },
  { value: 'PICKUP', label: 'Pick-up' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'MONOSPACE', label: 'Monospaces' },
  { value: 'MINIBUS', label: 'Minibus' },
  { value: 'UTILITAIRE', label: 'Utilitaires' },
  { value: 'LUXE', label: 'Luxe' },
  { value: 'FOUR_X_FOUR', label: '4×4' },
];

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function sortVehicles(vehicles: VehicleGridItem[]) {
  return [...vehicles].sort((a, b) => {
    const scoreA = Number(a.note) * 7 + Math.min(a.totalLocations / 20, 1) * 6;
    const scoreB = Number(b.note) * 7 + Math.min(b.totalLocations / 20, 1) * 6;
    return scoreB - scoreA;
  });
}

/* ════════════════════════════════════════════════════════════════
   SKELETON CARD
════════════════════════════════════════════════════════════════ */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-2xl border border-slate-100 overflow-hidden bg-white animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
      aria-hidden
    >
      <div className="h-[3px] bg-slate-100" />
      <div className="aspect-[16/10] bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-40 rounded-lg bg-slate-100" />
        <div className="h-3 w-28 rounded-full bg-slate-100" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-6 rounded-lg bg-slate-100" />)}
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex justify-between items-center">
          <div className="h-7 w-24 rounded-lg bg-slate-100" />
          <div className="h-9 w-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   VEHICLE CARD WRAPPER  — animation + ExplorerVehicleCard
════════════════════════════════════════════════════════════════ */
function AnimatedCard({ vehicle, index, visible }: { vehicle: VehicleGridItem; index: number; visible: boolean }) {
  const delay = Math.min(index * 70, 420);
  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <ExplorerVehicleCard vehicle={vehicle} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATES
════════════════════════════════════════════════════════════════ */
function EmptyFilter({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <Car className="h-6 w-6 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-slate-600">Aucun {label.toLowerCase()} disponible</p>
        <p className="mt-1 text-[13px] text-slate-400">D'autres catégories sont disponibles pour vous.</p>
      </div>
      <button type="button" onClick={onReset}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
        Voir tous les véhicules
      </button>
    </div>
  );
}

function EmptyGlobal() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 py-16 px-8 lg:py-24 lg:px-16 text-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #34d399, transparent 60%)' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-400/8 border border-emerald-400/15 flex items-center justify-center">
          <Rocket className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Bientôt <span className="text-emerald-400">disponible</span></h3>
          <p className="mt-3 text-[14px] text-white/40 leading-relaxed">Notre flotte de véhicules vérifiés sera affichée ici très prochainement.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/explorer"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-emerald-400 text-black text-[13px] font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 transition-all">
            Explorer <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <Link href="/dashboard/owner"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 border border-white/10 text-white/50 text-[13px] font-semibold hover:border-emerald-400/25 hover:text-emerald-400 transition-all">
            <PlusCircle className="h-4 w-4" strokeWidth={2} /> Proposer un véhicule
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SECTION HEADER
════════════════════════════════════════════════════════════════ */
function SectionHeader({
  totalCount, showViewAll, viewAllHref, loading,
}: {
  totalCount: number; showViewAll: boolean; viewAllHref: string; loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5">
          <TrendingUp className="h-3 w-3 text-emerald-500" strokeWidth={2} />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            {loading ? 'Chargement…' : `${totalCount} véhicule${totalCount > 1 ? 's' : ''} disponible${totalCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <h2 className="text-[34px] lg:text-[48px] font-black tracking-tight text-slate-900 leading-[1.02]">
          Trouvez votre <span className="text-emerald-500">véhicule</span>
        </h2>
        <p className="max-w-xl text-[14px] font-medium text-slate-500 leading-relaxed">
          Sélection de véhicules vérifiés, disponibles dès maintenant partout au Sénégal.
        </p>
      </div>

      {showViewAll && (
        <Link href={viewAllHref}
          className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-600 hover:shadow-md transition-all lg:self-auto">
          Voir tout
          <ChevronRight className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FILTER BAR
════════════════════════════════════════════════════════════════ */
function FilterBar({
  activeFilter, onFilter,
}: {
  activeFilter: string;
  onFilter: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <div className="flex gap-1.5 bg-slate-900 rounded-2xl p-1.5 flex-shrink-0">
        {FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold tracking-tight transition-all duration-200',
              activeFilter === f.value
                ? 'bg-emerald-400 text-black shadow-sm font-bold'
                : 'text-white/45 hover:text-white/80',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN SECTION
════════════════════════════════════════════════════════════════ */
interface VehicleGridSectionProps {
  viewAllHref?: string;
  initialVehicles?: VehicleGridItem[];
}

export function VehicleGridSection({
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

  const sorted = sortVehicles(vehicles);
  const visible9 = sorted.slice(0, MAX_VISIBLE);
  const hiddenCount = Math.max(0, sorted.length - MAX_VISIBLE);
  const activeLabel = FILTERS.find(f => f.value === activeFilter)?.label ?? '';

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.04 },
    );
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
      initialLoaded.current = true; return;
    }
    initialLoaded.current = true;
    fetchVehicles(activeFilter || undefined);
  }, [activeFilter, fetchVehicles, initialVehicles]);

  return (
    <section ref={sectionRef} className="px-4 py-12 lg:px-8 lg:py-20" aria-labelledby="vehicles-heading">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <SectionHeader
          totalCount={vehicles.length}
          showViewAll={hiddenCount > 0}
          viewAllHref={viewAllHref}
          loading={loading}
        />

        {/* Filter bar */}
        <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} />

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} delay={i * 80} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-16 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40">
            <p className="text-[14px] font-bold text-slate-500">Impossible de charger les véhicules</p>
            <button type="button" onClick={() => fetchVehicles(activeFilter || undefined)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
              Réessayer
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && vehicles.length === 0 && (
          activeFilter
            ? <EmptyFilter label={activeLabel} onReset={() => setActiveFilter('')} />
            : <EmptyGlobal />
        )}

        {/* Grid */}
        {!loading && !error && visible9.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible9.map((v, i) => (
                <AnimatedCard key={v.id} vehicle={v} index={i} visible={visible} />
              ))}
            </div>

            {/* View more */}
            {hiddenCount > 0 && (
              <div className="flex justify-center pt-2">
                <Link href={viewAllHref}
                  className="group inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:border-emerald-200 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <PlusCircle className="h-4 w-4 text-slate-500 group-hover:text-emerald-600 transition-colors" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-slate-800">
                      {hiddenCount} autre{hiddenCount > 1 ? 's' : ''} véhicule{hiddenCount > 1 ? 's' : ''} disponible{hiddenCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Voir toute la sélection</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all ml-1" strokeWidth={2} />
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
