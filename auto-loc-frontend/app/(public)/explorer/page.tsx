import { Suspense } from 'react';
import { ExplorerGrid } from '@/features/explorer/ExplorerGrid';
import { VehicleGridSkeleton } from '@/features/explorer/ExplorerSkeleton';
import { Footer } from '@/features/landing/Footer';
import {
    searchVehicles,
    type FuelType,
    type SearchVehiclesParams,
    type Transmission,
    type VehicleType,
} from '@/lib/nestjs/vehicles';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Explorer nos véhicules — AutoLoc',
    description: 'Parcourez la liste des véhicules disponibles à la location au Sénégal. SUV, citadines, berlines et utilitaires vérifiés au meilleur prix.',
    alternates: {
        canonical: 'https://www.autoloc.sn/explorer',
    },
    openGraph: {
        url: 'https://www.autoloc.sn/explorer',
        title: 'Explorer nos véhicules — AutoLoc',
        description: 'Parcourez la liste des véhicules disponibles à la location au Sénégal.',
    },
};

export const revalidate = 60;

type PageSearchParams = Record<string, string | string[] | undefined>;

function firstParam(searchParams: PageSearchParams, key: string): string | undefined {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
}

function allParams(searchParams: PageSearchParams, key: string): string[] {
    const value = searchParams[key];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function numberParam(searchParams: PageSearchParams, key: string): number | undefined {
    const value = firstParam(searchParams, key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function buildInitialSearchParams(searchParams: PageSearchParams): SearchVehiclesParams {
    const sort = firstParam(searchParams, 'sort') ?? 'popular';
    const sortMap: Record<string, { by: SearchVehiclesParams['sortBy']; order: 'asc' | 'desc' }> = {
        popular: { by: 'totalLocations', order: 'desc' },
        rating: { by: 'note', order: 'desc' },
        'price-asc': { by: 'prixParJour', order: 'asc' },
        'price-desc': { by: 'prixParJour', order: 'desc' },
        newest: { by: 'annee', order: 'desc' },
    };
    const { by, order } = sortMap[sort] ?? sortMap.popular;

    return {
        type: firstParam(searchParams, 'type') as VehicleType | undefined,
        ville: firstParam(searchParams, 'zone'),
        prixMin: numberParam(searchParams, 'budgetMin'),
        prixMax: numberParam(searchParams, 'budgetMax') ?? numberParam(searchParams, 'budget'),
        dateDebut: firstParam(searchParams, 'debut'),
        dateFin: firstParam(searchParams, 'fin'),
        carburant: firstParam(searchParams, 'fuel') as FuelType | undefined,
        transmission: firstParam(searchParams, 'transmission') as Transmission | undefined,
        placesMin: numberParam(searchParams, 'places'),
        noteMin: numberParam(searchParams, 'noteMin'),
        equipements: allParams(searchParams, 'equipements'),
        sortBy: by,
        sortOrder: order,
        q: firstParam(searchParams, 'q')?.trim() || undefined,
        page: 1,
    };
}

export default async function ExplorerPage({ searchParams = {} }: { searchParams?: PageSearchParams }) {
    const initialResults = await searchVehicles(buildInitialSearchParams(searchParams)).catch(() => null);

    return (
        <main>
            <Suspense fallback={<VehicleGridSkeleton count={6} />}>
                <ExplorerGrid
                    initialVehicles={initialResults?.data ?? []}
                    initialTotal={initialResults?.total ?? 0}
                    initialLoaded={Boolean(initialResults)}
                />
            </Suspense>
            <Footer />
        </main>
    );
}
