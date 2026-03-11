import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VehicleSearchPage } from '@/features/vehicle-search/VehicleSearchPage';

export const metadata: Metadata = {
    title: 'Résultats de recherche — AutoLoc',
    description:
        'Trouvez le véhicule idéal parmi nos annonces vérifiées. Filtrez par zone, type, budget et dates de location.',
};

export default function VehicleSearchRoute() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                </div>
            }
        >
            <VehicleSearchPage />
        </Suspense>
    );
}
