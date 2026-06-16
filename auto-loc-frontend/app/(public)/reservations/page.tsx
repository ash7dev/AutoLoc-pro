import React from 'react';
import type { Metadata } from 'next';
import { CalendarRange } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchTenantReservations, type Reservation } from '@/lib/nestjs/reservations';
import { TenantReservationsList } from '@/features/reservations/components/tenant-reservations-list';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { DesktopAuthRedirect } from '@/features/auth/components/desktop-auth-redirect';

export const metadata: Metadata = {
    title: 'Mes réservations — AutoLoc',
    description: 'Consultez et gérez vos réservations de véhicules sur AutoLoc.',
};

export default async function TenantReservationsPage() {
    const nestToken = cookies().get('nest_access')?.value ?? null;

    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }

    if (!token) {
        return (
            <>
                <div className="md:hidden">
                    <AuthRequiredScreen
                        icon={CalendarRange}
                        title="Connectez-vous pour voir vos réservations"
                        description="Retrouvez l'historique et le suivi de toutes vos réservations de véhicules."
                        redirectTo="/reservations"
                    />
                </div>
                <div className="hidden md:block">
                    <DesktopAuthRedirect redirectTo="/login?redirect=/reservations" />
                </div>
            </>
        );
    }

    let reservations: Reservation[] = [];
    try {
        const result = await fetchTenantReservations(token);
        reservations = result.data ?? [];
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            redirect('/login?expired=1');
        }
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-black">
                        Mes réservations
                    </h1>
                    <p className="text-[14px] text-black/40 mt-1">
                        Retrouvez toutes vos réservations de véhicules
                    </p>
                </div>

                <TenantReservationsList initialReservations={reservations} />
            </div>
            <Footer />
        </main>
    );
}
