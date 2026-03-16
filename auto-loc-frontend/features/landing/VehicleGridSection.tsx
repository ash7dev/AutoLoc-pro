'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Star, ArrowRight, Heart,
  Fuel, Users, Settings2,
  Zap, Car, TrendingDown, TrendingUp,
  Rocket, PlusCircle, Shield,
  ChevronRight, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  searchVehicles,
  type VehicleSearchResult,
  type VehicleType,
  type TarifTier,
  type VehicleStatus,
} from '@/lib/nestjs/vehicles';
import { TYPE_LABELS } from '@/features/vehicles/owner/vehicle-helpers';
import { useCurrency } from '@/providers/currency-provider';

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

const FUEL_LABELS: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function bestTier(tiers: TarifTier[]) {
  return tiers.reduce((m, t) => Number(t.prix) < Number(m.prix) ? t : m, tiers[0]);
}

function maxSavings(base: number, tiers: TarifTier[]) {
  if (!tiers.length) return 0;
  return Math.round(((base - Number(bestTier(tiers).prix)) / base) * 100);
}

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
   VEHICLE CARD
════════════════════════════════════════════════════════════════ */
function VehicleCard({ vehicle, index, visible }: { vehicle: VehicleGridItem; index: number; visible: boolean }) {
  const [liked, setLiked] = useState(false);
  const { formatPrice } = useCurrency();
  const tiers = vehicle.tarifsProgressifs ?? [];
  const savings = maxSavings(Number(vehicle.prixParJour), tiers);
  const minDays = tiers.length > 0 ? Math.min(...tiers.map(t => Number(t.joursMin))) : null;
  const tenantPrice = Math.round(Number(vehicle.prixParJour) * 1.15);
  const delay = Math.min(index * 70, 420);
  const isVerified = vehicle.statut === 'VERIFIE';
  const isCoupDeCoeur = Number(vehicle.note) >= 4.5;
  const isPopular = !isCoupDeCoeur && vehicle.totalLocations >= 10;
  const transmLabel = vehicle.transmission === 'AUTOMATIQUE' ? 'Automatique'
    : vehicle.transmission === 'MANUELLE' ? 'Manuelle' : null;

  return (
    <Link
      href={`/vehicle/${vehicle.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden',
        'border border-slate-100',
        'shadow-[0_2px_10px_rgba(0,0,0,0.05)]',
        'hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(5,150,105,0.13)] hover:border-emerald-200',
        'transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Emerald top accent bar */}
      <div className="h-[3px] w-full flex-shrink-0"
        style={{ background: 'linear-gradient(90deg, #34D399, #059669, #34D399)' }} />

      {/* ── Photo ── */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {vehicle.photoUrl ? (
          <Image
            src={vehicle.photoUrl}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
            <Car className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10">
          {isCoupDeCoeur && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 shadow-md shadow-emerald-500/30">
              <Sparkles className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
              <span className="text-[8.5px] font-black uppercase tracking-widest text-white">Coup de cœur</span>
            </span>
          )}
          {isPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 shadow-sm">
              <Zap className="h-2.5 w-2.5 text-white" strokeWidth={2.5} fill="currentColor" />
              <span className="text-[8.5px] font-black text-white uppercase tracking-widest">Populaire</span>
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md border border-emerald-400/30 px-2 py-0.5">
              <Shield className="h-2.5 w-2.5 text-emerald-400" strokeWidth={2.5} />
              <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400">Vérifié</span>
            </span>
          )}
        </div>

        {/* Top-right: year + heart */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
          {vehicle.annee && (
            <span className="rounded-lg bg-black/50 backdrop-blur-md border border-white/15 px-2 py-0.5 text-[10px] font-black text-white">
              {vehicle.annee}
            </span>
          )}
          <button
            type="button"
            onClick={e => { e.preventDefault(); setLiked(l => !l); }}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center',
              'backdrop-blur-md border transition-all duration-200',
              liked ? 'bg-red-500 border-red-400/50 shadow-lg shadow-red-500/30' : 'bg-black/35 border-white/15 hover:bg-black/50',
            )}
          >
            <Heart
              className={cn('h-3 w-3 transition-all duration-200', liked ? 'fill-white text-white scale-110' : 'text-white/80')}
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Bottom-right: rating badge */}
        {vehicle.note > 0 && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 shadow-md">
              <Star className="h-2.5 w-2.5 fill-white text-white" strokeWidth={0} />
              <span className="text-[10px] font-black text-white">{Number(vehicle.note).toFixed(1)}</span>
              {(vehicle.totalAvis ?? 0) > 0 && (
                <span className="text-[9px] text-white/70">({vehicle.totalAvis})</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-4 pt-3 pb-4">

        {/* Name */}
        <h3 className="text-[19px] font-black tracking-tight text-slate-800 leading-tight mb-1">
          {vehicle.marque} <span className="text-emerald-600">{vehicle.modele}</span>
        </h3>

        {/* City + reservations */}
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin className="h-2.5 w-2.5 text-slate-300 flex-shrink-0" strokeWidth={2} />
          <span className="text-[11px] font-medium text-slate-400">{vehicle.ville}</span>
          {vehicle.totalLocations > 0 && (
            <>
              <span className="text-slate-200">·</span>
              <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2} fill="currentColor" />
              <span className="text-[11px] font-semibold text-slate-400">{vehicle.totalLocations} loc.</span>
            </>
          )}
        </div>

        {/* Specs 2×2 grid */}
        {(vehicle.carburant || vehicle.nombrePlaces || vehicle.transmission || vehicle.type) && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 mb-4">
            {vehicle.carburant && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Fuel className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 truncate">{FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant}</span>
              </div>
            )}
            {vehicle.nombrePlaces && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold text-slate-600">{vehicle.nombrePlaces} places</span>
              </div>
            )}
            {transmLabel && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Settings2 className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 truncate">{transmLabel}</span>
              </div>
            )}
            {vehicle.type && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Car className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 truncate">{TYPE_LABELS[vehicle.type] ?? vehicle.type}</span>
              </div>
            )}
          </div>
        )}

        {/* Savings strip */}
        {savings > 0 && minDays != null && Number.isFinite(minDays) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 mb-3">
            <TrendingDown className="w-3 h-3 text-emerald-600 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-[11px] font-semibold text-emerald-700">
              −<span className="font-black">{savings}%</span> dès {minDays}j
            </p>
          </div>
        )}

        <div className="h-px bg-slate-100 mb-3" />

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3 mt-auto">
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">À partir de</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-black text-slate-800 tabular-nums leading-none">{formatPrice(tenantPrice)}</span>
              <span className="text-[11px] font-semibold text-slate-400">/jour</span>
            </div>
          </div>

          <span
            className={cn(
              'relative inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 flex-shrink-0',
              'text-[12px] font-black text-white overflow-hidden',
              'shadow-md shadow-emerald-500/20',
              'group-hover:shadow-lg group-hover:shadow-emerald-500/30',
              'transition-all duration-300',
            )}
            style={{ background: 'linear-gradient(135deg, #34D399 0%, #059669 60%, #047857 100%)' }}
          >
            <span
              className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
            />
            Réserver
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
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
                <VehicleCard key={v.id} vehicle={v} index={i} visible={visible} />
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
