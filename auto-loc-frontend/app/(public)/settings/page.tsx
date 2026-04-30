import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { TenantSettings } from '@/components/settings/tenant-settings';
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
        <main className="min-h-screen bg-gray-50">
            <TenantSettings profile={profile} />
            <Footer />
        </main>
    );
}
