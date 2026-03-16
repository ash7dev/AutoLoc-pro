'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Car, Search, SlidersHorizontal, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    searchVehicles,
    type VehicleSearchResult,
    type VehicleType,
} from '@/lib/nestjs/vehicles';
import { ExplorerVehicleCard } from '@/features/explorer/ExplorerVehicleCard';
import { SearchSummaryBar } from './SearchSummaryBar';
import { Footer } from '@/features/landing/Footer';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
type VehicleGridItem = VehicleSearchResult & {
    carburant?: string | null;
    transmission?: string | null;
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

/* ════════════════════════════════════════════════════════════════
   SKELETON
════════════════════════════════════════════════════════════════ */
function SearchSkeleton() {
    return (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
                    <div className="aspect-[16/10] bg-slate-100" />
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <div className="h-3 w-16 rounded bg-slate-100" />
                            <div className="h-3 w-20 rounded bg-slate-100" />
                        </div>
                        <div className="h-4 w-3/4 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between items-center">
                            <div className="h-4 w-12 rounded bg-slate-100" />
                            <div className="h-9 w-24 rounded-xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */
function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-6 py-24 rounded-3xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50/80 to-white">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-sm">
                <Car className="h-9 w-9 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="text-center max-w-sm">
                <p className="text-[17px] font-black text-slate-800 tracking-tight">
                    Aucun véhicule trouvé
                </p>
                <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                    Essayez de modifier vos critères de recherche ou explorez tous nos véhicules disponibles.
                </p>
            </div>
            <a
                href="/"
                className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-6 py-3',
                    'bg-slate-900 text-[13px] font-bold text-emerald-400',
                    'hover:bg-emerald-500 hover:text-white',
                    'shadow-lg shadow-slate-900/20 hover:shadow-emerald-500/25',
                    'transition-all duration-200',
                )}
            >
                <Search className="h-4 w-4" />
                Nouvelle recherche
            </a>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   SORT SELECTOR
════════════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
    { value: 'popular', label: 'Les plus populaires' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Meilleures notes' },
    { value: 'newest', label: 'Plus récents' },
];

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export function VehicleSearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    /* ── Parse URL params ──────────────────────────────────────── */
    const zone = searchParams.get('zone') ?? '';
    const type = searchParams.get('type') ?? '';
    const prixMax = searchParams.get('prixMax') ?? '';
    const debut = searchParams.get('debut') ?? '';
    const fin = searchParams.get('fin') ?? '';
    const q = searchParams.get('q') ?? '';

    /* ── State ─────────────────────────────────────────────────── */
    const [vehicles, setVehicles] = useState<VehicleGridItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [sort, setSort] = useState('popular');
    const gridRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    /* ── Entrance animation ────────────────────────────────────── */
    useEffect(() => {
        if (loading) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold: 0.02 },
        );
        if (gridRef.current) obs.observe(gridRef.current);
        return () => obs.disconnect();
    }, [loading]);

    /* ── Fetch vehicles ────────────────────────────────────────── */
    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError(false);
        setVisible(false);
        try {
            const sortMap: Record<string, { by: string; order: 'asc' | 'desc' }> = {
                popular: { by: 'totalLocations', order: 'desc' },
                rating: { by: 'note', order: 'desc' },
                'price-asc': { by: 'prixParJour', order: 'asc' },
                'price-desc': { by: 'prixParJour', order: 'desc' },
                newest: { by: 'annee', order: 'desc' },
            };
            const { by, order } = sortMap[sort] ?? { by: 'totalLocations', order: 'desc' };

            const result = await searchVehicles({
                ville: zone || undefined,
                type: (type as VehicleType) || undefined,
                prixMin: 25000,
                prixMax: prixMax ? Number(prixMax) : undefined,
                dateDebut: debut || undefined,
                dateFin: fin || undefined,
                sortBy: by as any,
                sortOrder: order,
            });
            setVehicles(result.data ?? []);
        } catch {
            setError(true);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [zone, type, prixMax, debut, fin, sort]);

    useEffect(() => { fetchResults(); }, [fetchResults]);

    /* ── Filter text search ────────────────────────────────────── */
    const filteredVehicles = useMemo(() => {
        if (!q.trim()) return vehicles;
        const lower = q.toLowerCase();
        return vehicles.filter(
            v =>
                v.marque.toLowerCase().includes(lower) ||
                v.modele.toLowerCase().includes(lower) ||
                v.ville.toLowerCase().includes(lower),
        );
    }, [vehicles, q]);

    /* ── Remove filter ─────────────────────────────────────────── */
    function handleRemoveFilter(key: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        router.push(`/vehicle?${params.toString()}`);
    }

    const gridVehicles = filteredVehicles;

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

            {/* ═══════════════════════════════════════════════════════════
         HERO HEADER
      ═══════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-8 pb-10 sm:pt-10 sm:pb-12">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-8 blur-[120px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5 blur-[100px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Title */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-[22px] sm:text-[26px] font-black tracking-tight text-white leading-tight">
                                Résultats de recherche
                            </h1>
                            <p className="text-[12px] sm:text-[13px] font-medium text-white/40 mt-0.5">
                                Véhicules vérifiés et disponibles
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
         MAIN CONTENT
      ═══════════════════════════════════════════════════════════ */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 pb-16">

                {/* Summary bar */}
                <SearchSummaryBar
                    zone={zone || undefined}
                    type={type || undefined}
                    prixMax={prixMax || undefined}
                    debut={debut || undefined}
                    fin={fin || undefined}
                    q={q || undefined}
                    totalResults={filteredVehicles.length}
                    loading={loading}
                    onRemoveFilter={handleRemoveFilter}
                />

                {/* Sort + count row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 mb-6">
                    <div>
                        {loading ? (
                            <div className="h-6 w-52 rounded-lg bg-slate-100 animate-pulse" />
                        ) : (
                            <h2 className="text-[18px] sm:text-[20px] font-black tracking-tight text-slate-900">
                                <span className="text-emerald-500">{filteredVehicles.length}</span>{' '}
                                véhicule{filteredVehicles.length > 1 ? 's' : ''} disponible{filteredVehicles.length > 1 ? 's' : ''}
                            </h2>
                        )}
                        {!loading && filteredVehicles.length > 0 && (
                            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                                Triés et vérifiés pour votre confort
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-300" strokeWidth={2} />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className={cn(
                                'rounded-xl border border-slate-200 bg-white px-3 py-2',
                                'text-[13px] font-semibold text-slate-600',
                                'focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 focus:outline-none',
                                'transition-all cursor-pointer',
                            )}
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Results ─────────────────────────────────────────── */}
                {loading ? (
                    <SearchSkeleton />
                ) : error ? (
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
                            onClick={fetchResults}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div ref={gridRef} className="space-y-8">

                        {/* Grid */}
                        {gridVehicles.length > 0 && (
                            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {gridVehicles.map((vehicle, i) => (
                                    <div
                                        key={vehicle.id}
                                        className={cn(
                                            'transition-all duration-500',
                                            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                                        )}
                                        style={{ transitionDelay: `${Math.min(i * 70, 500)}ms` }}
                                    >
                                        <ExplorerVehicleCard vehicle={vehicle as any} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
