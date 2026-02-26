import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import { Footer } from '@/features/landing/Footer';

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
        redirect('/login?redirect=/settings');
    }

    let profile: UserProfile;
    try {
        profile = await fetchUserProfile(token);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
            redirect('/login?expired=1');
        }
        throw err;
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-black">
                        Paramètres
                    </h1>
                    <p className="text-[14px] text-black/40 mt-1">
                        Modifiez vos informations personnelles
                    </p>
                </div>

                <SettingsForm profile={profile} />
            </div>
            <Footer />
        </main>
    );
}
