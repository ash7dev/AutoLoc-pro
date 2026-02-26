import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OwnerHeader } from '@/features/dashboard/components/owner-header';

interface PageProps {
    params: { id: string };
}

export default async function VehicleReservationsPage({ params }: PageProps) {
    const nestToken = cookies().get('nest_access')?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect('/login');

    return (
        <div className="flex flex-col gap-6 p-6">
            <OwnerHeader
                title="Réservations du véhicule"
                subtitle={`Véhicule #${params.id}`}
            />
            <div className="rounded-xl border bg-card p-8 text-center space-y-4">
                <p className="text-muted-foreground">
                    L&apos;historique des réservations pour ce véhicule sera affiché ici.
                </p>
            </div>
        </div>
    );
}
