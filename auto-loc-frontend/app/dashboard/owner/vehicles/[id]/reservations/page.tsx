import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchVehicle } from '@/lib/nestjs/vehicles';
import { fetchVehicleReservations } from '@/lib/nestjs/reservations';
import { OwnerHeader } from '@/features/dashboard/components/owner-header';
import { OwnerReservationsList } from '@/features/reservations/components/owner-reservations-list';

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

    let vehicle;
    let reservationsData;

    try {
        [vehicle, reservationsData] = await Promise.all([
            fetchVehicle(params.id, token),
            fetchVehicleReservations(token, params.id),
        ]);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect('/login?expired=1');
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    const reservations = reservationsData?.data ?? [];

    return (
        <div className="flex flex-col gap-6 p-6">
            <Link
                href={`/dashboard/owner/vehicles/${params.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour au véhicule
            </Link>

            <OwnerHeader
                title="Réservations du véhicule"
                subtitle={`${vehicle.marque} ${vehicle.modele} · ${reservations.length} réservation${reservations.length !== 1 ? 's' : ''}`}
            />

            <OwnerReservationsList initialReservations={reservations} />
        </div>
    );
}
