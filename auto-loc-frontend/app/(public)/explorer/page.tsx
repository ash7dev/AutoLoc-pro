import { Suspense } from 'react';
import { ExplorerGrid } from '@/features/explorer/ExplorerGrid';
import { VehicleGridSkeleton } from '@/features/explorer/ExplorerSkeleton';
import { Footer } from '@/features/landing/Footer';

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
