import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserCircle2 } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { ApiError } from '@/lib/nestjs/api-client';
import { TenantSettings } from '@/components/settings/tenant-settings';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { DesktopAuthRedirect } from '@/features/auth/components/desktop-auth-redirect';

export const metadata: Metadata = {
    title: 'Paramètres — AutoLoc',
    description: 'Gérez vos paramètres et informations personnelles sur AutoLoc.',
};

export default async function SettingsPage() {
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

    let profile: UserProfile | null = null;
    try {
        profile = await fetchUserProfile(token);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            redirect('/login?expired=1');
        }
        // Erreur réseau — TenantSettings fera son propre fetch en fallback
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Le profil est pré-chargé serveur : TenantSettings l'affiche immédiatement
                sans passer par un useEffect. Après modification, il met à jour son state
                local — pas besoin de router.refresh() pour les champs du formulaire. */}
            <TenantSettings profile={profile} />
            <Footer />
        </main>
    );
}
