import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserCircle2, ChevronRight, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { ApiError } from '@/lib/nestjs/api-client';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import { SettingsShell } from '@/features/settings/components/settings-shell';
import { Footer } from '@/features/landing/Footer';
import { AuthRequiredScreen } from '@/features/auth/components/auth-required-screen';
import { DesktopAuthRedirect } from '@/features/auth/components/desktop-auth-redirect';
import Link from 'next/link';

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
            <div className="min-h-full bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">
                    {/* Page title */}
                    <div>
                        <h1 className="text-[24px] lg:text-[26px] font-black tracking-tight text-slate-900">Mon profil</h1>
                        <p className="text-[13px] text-slate-400 mt-1 font-medium">Membre depuis {memberSince}</p>
                    </div>

                    {/* Form */}
                    <SettingsForm profile={profile} />
                </div>
            </div>
            <Footer />
        </main>
    );
}
