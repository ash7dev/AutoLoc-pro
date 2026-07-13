import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CalendarRange } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchTenantReservations } from '@/lib/nestjs/reservations';
import { ApiError } from '@/lib/nestjs/api-client';
import { TenantReservationsList } from '@/features/reservations/components/tenant-reservations-list';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { Footer } from '@/features/landing/Footer';
import { CACHE_DURATIONS, CACHE_TAGS, getCacheKey, getScopedCacheTags } from '@/lib/cache-config';

export const metadata: Metadata = {
    title: 'Mes réservations — AutoLoc',
    description: 'Consultez et gérez vos réservations de véhicules sur AutoLoc.',
};

async function getCachedTenantReservations(token: string) {
    return unstable_cache(
        () => fetchTenantReservations(token),
        getCacheKey(CACHE_TAGS.tenant_reservations, token),
        {
            revalidate: CACHE_DURATIONS.critical,
            tags: getScopedCacheTags(CACHE_TAGS.tenant_reservations, token),
        },
    )();
}

export default async function TenantReservationsPage() {
    // Lecture du cookie NestJS (connexion téléphone) ou session Supabase
    const nestToken = cookies().get('nest_access')?.value ?? null;

    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }

    // Non authentifié
    if (!token) {
        return (
            <AuthRequiredScreen
                icon={CalendarRange}
                title="Connectez-vous pour voir vos réservations"
                description="Retrouvez l'historique et le suivi de toutes vos réservations."
                redirectTo="/reservations"
            />
        );
    }

    // Fetch server-side — données fraîches à chaque requête, zéro waterfall client
    let reservations: Awaited<ReturnType<typeof fetchTenantReservations>>['data'] = [];
    try {
        const res = await getCachedTenantReservations(token);
        reservations = res.data ?? [];
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            redirect('/login?expired=1');
        }
        // Autre erreur réseau — liste vide, l'utilisateur peut rafraîchir
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-black">Mes réservations</h1>
                    <p className="text-[14px] text-black/40 mt-1">
                        Retrouvez toutes vos réservations de véhicules
                    </p>
                </div>
                {/* TenantReservationsList est client-only (filtres, interactions).
                    Après une mutation (annulation…), appeler router.refresh() pour
                    re-exécuter ce RSC et obtenir les données fraîches. */}
                <TenantReservationsList initialReservations={reservations} />
            </div>
            <Footer />
        </main>
    );
}
