import { ExplorerGrid } from '@/features/explorer/ExplorerGrid';
import { Footer } from '@/features/landing/Footer';

/** ISR — revalidate every 60 seconds */
export const revalidate = 60;

interface LocationPageProps {
    params: { ville: string };
}

export default function LocationPage({ params }: LocationPageProps) {
    const ville = decodeURIComponent(params.ville);

    return (
        <main>
            <section className="py-12 px-4 text-center">
                <h1 className="text-3xl font-bold capitalize">
                    Location de véhicules à {ville}
                </h1>
                <p className="text-muted-foreground mt-2">
                    Découvrez les véhicules disponibles à {ville}
                </p>
            </section>
            <ExplorerGrid />
            <Footer />
        </main>
    );
}
