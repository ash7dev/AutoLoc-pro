'use client';

import React, { useEffect, useState } from 'react';
import { CalendarRange } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { fetchTenantReservations, type Reservation } from '@/lib/nestjs/reservations';
import { TenantReservationsList } from '@/features/reservations/components/tenant-reservations-list';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { DesktopAuthRedirect } from '@/features/auth/components/desktop-auth-redirect';
import { ApiError } from '@/lib/nestjs/api-client';
import { useRouter } from 'next/navigation';

type AuthStatus = 'checking' | 'auth' | 'unauth';

export function ReservationsClient() {
    const router = useRouter();
    const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // Étape 1 : vérification instantanée du store Zustand (synchrone, zéro réseau)
    // Étape 2 si nécessaire : session Supabase depuis le cache mémoire (~10 ms)
    useEffect(() => {
        const role = useRoleStore.getState().activeRole;
        if (role) {
            setAuthStatus('auth');
            return;
        }
        supabase.auth.getSession().then(({ data }) => {
            setAuthStatus(data.session ? 'auth' : 'unauth');
        });
    }, []);

    // Fetch des réservations une fois l'auth confirmée
    useEffect(() => {
        if (authStatus !== 'auth') return;
        fetchTenantReservations()
            .then((res) => setReservations(res.data ?? []))
            .catch((err) => {
                if (err instanceof ApiError && err.status === 401) {
                    router.replace('/login?expired=1');
                }
            });
    }, [authStatus, router]);

    // Phase de vérification : rendu minimal, résolu en ~1 frame
    if (authStatus === 'checking') return null;

    if (authStatus === 'unauth') {
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

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-black">Mes réservations</h1>
                    <p className="text-[14px] text-black/40 mt-1">Retrouvez toutes vos réservations de véhicules</p>
                </div>
                <TenantReservationsList initialReservations={reservations} />
            </div>
            <Footer />
        </main>
    );
}
