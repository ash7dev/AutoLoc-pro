import { ExplorerGrid } from '@/features/explorer/ExplorerGrid';
import { Footer } from '@/features/landing/Footer';

/** ISR — revalidate every 60 seconds */
export const revalidate = 60;

export default function ExplorerPage() {
    return (
        <main>
            <ExplorerGrid />
            <Footer />
        </main>
    );
}
