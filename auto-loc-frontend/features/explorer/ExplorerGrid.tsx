'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { ExplorerHero } from './ExplorerHero';
import { ExplorerFilters } from './ExplorerFilters';
import { ExplorerActiveFilters, getFilterPills } from './ExplorerActiveFilters';
import { ExplorerResultsHeader } from './ExplorerResultsHeader';
import { ExplorerVehicleCard } from './ExplorerVehicleCard';
import { VehicleGridSkeleton } from './ExplorerSkeleton';

// ─── Types (exported for other components) ────────────────────────────────────
export interface ExplorerFiltersState {
    zone: string;
    type: string;
    budgetMax: number | null;
    fuel: string;
    transmission: string;
    sort: string;
    places: number | null;
    noteMin: number | null;
}

const DEFAULT_FILTERS: ExplorerFiltersState = {
    zone: '',
    type: '',
    budgetMax: null,
    fuel: '',
    transmission: '',
    sort: 'popular',
    places: null,
    noteMin: null,
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_VEHICLES: Vehicle[] = [
    {
        id: '1', proprietaireId: 'p1',
        marque: 'Toyota', modele: 'Land Cruiser', annee: 2022,
        type: 'SUV', carburant: 'DIESEL', transmission: 'AUTOMATIQUE',
        nombrePlaces: 7, immatriculation: 'DK-1234-AA',
        prixParJour: 45000, ville: 'Dakar', adresse: 'Almadies',
        latitude: null, longitude: null, joursMinimum: 2, ageMinimum: 25,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.9, totalAvis: 34, totalLocations: 18,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph1', vehiculeId: '1', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 18 },
    },
    {
        id: '2', proprietaireId: 'p2',
        marque: 'Mercedes', modele: 'Classe C', annee: 2021,
        type: 'BERLINE', carburant: 'ESSENCE', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-5678-BB',
        prixParJour: 55000, ville: 'Dakar', adresse: 'Mermoz',
        latitude: null, longitude: null, joursMinimum: 1, ageMinimum: 23,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.8, totalAvis: 21, totalLocations: 12,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph2', vehiculeId: '2', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 12 },
    },
    {
        id: '3', proprietaireId: 'p3',
        marque: 'Hyundai', modele: 'Tucson', annee: 2023,
        type: 'SUV', carburant: 'ESSENCE', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-9012-CC',
        prixParJour: 28000, ville: 'Dakar', adresse: 'Ouakam',
        latitude: null, longitude: null, joursMinimum: 1, ageMinimum: 21,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.7, totalAvis: 15, totalLocations: 8,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph3', vehiculeId: '3', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 8 },
    },
    {
        id: '4', proprietaireId: 'p4',
        marque: 'Renault', modele: 'Duster', annee: 2022,
        type: 'SUV', carburant: 'DIESEL', transmission: 'MANUELLE',
        nombrePlaces: 5, immatriculation: 'DK-3456-DD',
        prixParJour: 18000, ville: 'Thiès', adresse: 'Centre-ville',
        latitude: null, longitude: null, joursMinimum: 2, ageMinimum: 21,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.5, totalAvis: 9, totalLocations: 5,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph4', vehiculeId: '4', url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 5 },
    },
    {
        id: '5', proprietaireId: 'p5',
        marque: 'Peugeot', modele: '308', annee: 2021,
        type: 'BERLINE', carburant: 'ESSENCE', transmission: 'MANUELLE',
        nombrePlaces: 5, immatriculation: 'DK-7890-EE',
        prixParJour: 15000, ville: 'Dakar', adresse: 'Plateau',
        latitude: null, longitude: null, joursMinimum: 1, ageMinimum: 21,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.6, totalAvis: 12, totalLocations: 7,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph5', vehiculeId: '5', url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 7 },
    },
    {
        id: '6', proprietaireId: 'p6',
        marque: 'Ford', modele: 'Ranger', annee: 2022,
        type: 'PICKUP', carburant: 'DIESEL', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-2345-FF',
        prixParJour: 35000, ville: 'Dakar', adresse: 'Parcelles Assainies',
        latitude: null, longitude: null, joursMinimum: 3, ageMinimum: 25,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.8, totalAvis: 7, totalLocations: 4,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph6', vehiculeId: '6', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 4 },
    },
    {
        id: '7', proprietaireId: 'p7',
        marque: 'BMW', modele: 'X3', annee: 2023,
        type: 'SUV', carburant: 'ESSENCE', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-6789-GG',
        prixParJour: 65000, ville: 'Dakar', adresse: 'Almadies',
        latitude: null, longitude: null, joursMinimum: 2, ageMinimum: 25,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.9, totalAvis: 11, totalLocations: 6,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph7', vehiculeId: '7', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 6 },
    },
    {
        id: '8', proprietaireId: 'p8',
        marque: 'Kia', modele: 'Sportage', annee: 2022,
        type: 'SUV', carburant: 'DIESEL', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-0123-HH',
        prixParJour: 32000, ville: 'Dakar', adresse: 'Sacré-Cœur',
        latitude: null, longitude: null, joursMinimum: 1, ageMinimum: 21,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.6, totalAvis: 18, totalLocations: 10,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph8', vehiculeId: '8', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 10 },
    },
    {
        id: '9', proprietaireId: 'p9',
        marque: 'Audi', modele: 'A4', annee: 2021,
        type: 'BERLINE', carburant: 'ESSENCE', transmission: 'AUTOMATIQUE',
        nombrePlaces: 5, immatriculation: 'DK-4567-II',
        prixParJour: 48000, ville: 'Dakar', adresse: 'Mermoz',
        latitude: null, longitude: null, joursMinimum: 2, ageMinimum: 23,
        zoneConduite: null, assurance: null, reglesSpecifiques: null,
        statut: 'VERIFIE', note: 4.7, totalAvis: 14, totalLocations: 9,
        creeLe: '', misAJourLe: '',
        photos: [{ id: 'ph9', vehiculeId: '9', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80', position: 1, estPrincipale: true, creeLe: '' }],
        tarifsProgressifs: [], _count: { reservations: 9 },
    },
];

// ─── Sort function ────────────────────────────────────────────────────────────
function sortVehicles(vehicles: Vehicle[], sort: string): Vehicle[] {
    const sorted = [...vehicles];
    switch (sort) {
        case 'price-asc':
            return sorted.sort((a, b) => a.prixParJour - b.prixParJour);
        case 'price-desc':
            return sorted.sort((a, b) => b.prixParJour - a.prixParJour);
        case 'rating':
            return sorted.sort((a, b) => b.note - a.note);
        case 'newest':
            return sorted.sort((a, b) => b.annee - a.annee);
        case 'popular':
        default:
            return sorted.sort(
                (a, b) =>
                    (b._count?.reservations ?? b.totalLocations ?? 0) -
                    (a._count?.reservations ?? a.totalLocations ?? 0),
            );
    }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export function ExplorerGrid(): React.ReactElement {
    const [filters, setFilters] = useState<ExplorerFiltersState>(DEFAULT_FILTERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Simulate loading on filter change
    function handleFiltersChange(newFilters: ExplorerFiltersState) {
        setFilters(newFilters);
        setVisibleCount(6);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 400);
    }

    function handleReset() {
        setFilters(DEFAULT_FILTERS);
        setSearchQuery('');
        setVisibleCount(6);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 400);
    }

    // Filter + sort
    const filteredVehicles = useMemo(() => {
        let result = MOCK_VEHICLES;

        // Text search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (v) =>
                    v.marque.toLowerCase().includes(q) ||
                    v.modele.toLowerCase().includes(q) ||
                    v.ville.toLowerCase().includes(q),
            );
        }

        // Zone
        if (filters.zone) {
            result = result.filter((v) =>
                v.adresse.toLowerCase().includes(filters.zone.split('-')[0]),
            );
        }

        // Type
        if (filters.type) {
            result = result.filter((v) => v.type === filters.type);
        }

        // Budget max
        if (filters.budgetMax !== null) {
            result = result.filter((v) => v.prixParJour <= filters.budgetMax!);
        }

        // Fuel
        if (filters.fuel) {
            result = result.filter((v) => v.carburant === filters.fuel);
        }

        // Transmission
        if (filters.transmission) {
            result = result.filter((v) => v.transmission === filters.transmission);
        }

        // Places min
        if (filters.places !== null) {
            result = result.filter((v) => (v.nombrePlaces ?? 0) >= filters.places!);
        }

        // Note min
        if (filters.noteMin !== null) {
            result = result.filter((v) => v.note >= filters.noteMin!);
        }

        return sortVehicles(result, filters.sort);
    }, [filters, searchQuery]);

    const visibleVehicles = filteredVehicles.slice(0, visibleCount);
    const hasMore = visibleCount < filteredVehicles.length;

    // Active filter count (for mobile badge)
    const activeFilterCount = getFilterPills(filters).length;

    return (
        <>
            {/* Hero + search */}
            <ExplorerHero
                totalResults={filteredVehicles.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilterCount={activeFilterCount}
                onToggleMobileFilters={() => setMobileFiltersOpen(true)}
            />

            {/* Main content area */}
            <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
                {/* Active filter chips */}
                <div className="mb-5">
                    <ExplorerActiveFilters
                        filters={filters}
                        onChange={handleFiltersChange}
                        onClearAll={handleReset}
                    />
                </div>

                {/* Desktop: sidebar + grid | Mobile: grid only */}
                <div className="flex gap-8">
                    {/* Sidebar (desktop) */}
                    <ExplorerFilters
                        filters={filters}
                        onChange={handleFiltersChange}
                        onReset={handleReset}
                        isMobileOpen={mobileFiltersOpen}
                        onCloseMobile={() => setMobileFiltersOpen(false)}
                        filteredCount={filteredVehicles.length}
                    />

                    {/* Results area */}
                    <div className="flex-1 min-w-0">
                        {/* Results header with count + sort */}
                        <ExplorerResultsHeader
                            totalResults={filteredVehicles.length}
                            sort={filters.sort}
                            onSortChange={(sort) => handleFiltersChange({ ...filters, sort })}
                        />

                        {/* Grid */}
                        <div className="mt-6">
                            {isLoading ? (
                                <VehicleGridSkeleton count={6} />
                            ) : visibleVehicles.length === 0 ? (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center gap-5 py-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                        <Car className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[15px] font-bold text-black/50">
                                            Aucun véhicule trouvé
                                        </p>
                                        <p className="mt-1 text-[13px] font-medium text-black/30 max-w-xs">
                                            Essayez de modifier vos filtres ou votre recherche pour voir plus de résultats.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5',
                                            'bg-black text-emerald-400 text-[13px] font-semibold',
                                            'hover:bg-emerald-400 hover:text-black',
                                            'transition-all duration-200 shadow-sm',
                                        )}
                                    >
                                        Modifier les filtres
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {visibleVehicles.map((vehicle) => (
                                            <ExplorerVehicleCard key={vehicle.id} vehicle={vehicle} />
                                        ))}
                                    </div>

                                    {/* Pagination / "Voir plus" */}
                                    {hasMore && (
                                        <div className="mt-10 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setVisibleCount((c) => c + 6)}
                                                className={cn(
                                                    'inline-flex items-center gap-2.5 rounded-xl',
                                                    'border border-slate-200 bg-white px-6 py-3',
                                                    'text-[13.5px] font-semibold text-black',
                                                    'shadow-sm transition-all duration-200',
                                                    'hover:border-slate-300 hover:bg-slate-50 hover:shadow-md',
                                                )}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                Voir plus de véhicules
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
