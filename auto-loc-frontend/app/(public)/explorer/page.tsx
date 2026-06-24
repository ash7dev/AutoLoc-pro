import { Suspense } from 'react';
import { ExplorerGrid } from '@/features/explorer/ExplorerGrid';
import { VehicleGridSkeleton } from '@/features/explorer/ExplorerSkeleton';
import { Footer } from '@/features/landing/Footer';

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

export default function ExplorerPage() {
    return (
        <main>
            <Suspense fallback={<VehicleGridSkeleton count={6} />}>
                <ExplorerGrid />
            </Suspense>
            <Footer />
        </main>
    );
}
