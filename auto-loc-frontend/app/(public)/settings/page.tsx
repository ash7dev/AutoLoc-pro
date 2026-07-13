import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserCircle2 } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { ApiError } from '@/lib/nestjs/api-client';
import { SettingsPageWrapper } from '@/features/settings/components/settings-page-wrapper';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';

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
            <AuthRequiredScreen
                icon={UserCircle2}
                title="Connectez-vous pour accéder à votre compte"
                description="Gérez vos informations personnelles, votre vérification d'identité et vos préférences."
                redirectTo="/settings"
            />
        );
    }

    let profile: UserProfile | null = null;
    try {
        profile = await fetchUserProfile(token);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            redirect('/login?expired=1');
        }
        redirect('/login');
    }

    if (!profile) {
        redirect('/login');
    }

    const memberSince = new Date(profile.creeLe).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <main className="min-h-screen bg-slate-50">
            <SettingsPageWrapper profile={profile} memberSince={memberSince} />
            <Footer />
        </main>
    );
}
