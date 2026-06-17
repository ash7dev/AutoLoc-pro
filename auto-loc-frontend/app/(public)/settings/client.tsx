'use client';

import React, { useEffect, useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { TenantSettings } from '@/components/settings/tenant-settings';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { DesktopAuthRedirect } from '@/features/auth/components/desktop-auth-redirect';

type AuthStatus = 'checking' | 'auth' | 'unauth';

export function SettingsClient() {
    const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

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

    if (authStatus === 'checking') return null;

    if (authStatus === 'unauth') {
        return (
            <>
                <div className="md:hidden">
                    <AuthRequiredScreen
                        icon={UserCircle2}
                        title="Connectez-vous pour accéder à votre compte"
                        description="Gérez vos informations personnelles, votre vérification d'identité et vos préférences."
                        redirectTo="/settings"
                    />
                </div>
                <div className="hidden md:block">
                    <DesktopAuthRedirect redirectTo="/login?redirect=/settings" />
                </div>
            </>
        );
    }

    // TenantSettings se charge de fetcher le profil lui-même si non fourni
    return (
        <main className="min-h-screen bg-gray-50">
            <TenantSettings />
            <Footer />
        </main>
    );
}
