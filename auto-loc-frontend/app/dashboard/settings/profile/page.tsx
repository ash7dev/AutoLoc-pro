import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ApiError } from '@/lib/nestjs/api-client';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import { KycProfileButton } from '@/features/kyc/KycProfileButton';

export const metadata: Metadata = {
  title: 'Mon profil — AutoLoc',
  description: 'Gérez vos informations personnelles sur AutoLoc.',
};

/* ── Page ───────────────────────────────────────────────────────── */
export default async function ProfileSettingsPage() {
  const token = cookies().get('nest_access')?.value;
  if (!token) redirect('/login');

  let profile: UserProfile;
  try {
    profile = await fetchUserProfile(token);
  } catch {
    redirect('/login?expired=1');
  }

  const memberSince = new Date(profile.creeLe).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-full bg-slate-50">
      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">

        {/* Page title */}
        <div>
          <h1 className="text-[24px] lg:text-[26px] font-black tracking-tight text-slate-900">Mon profil</h1>
          <p className="text-[13px] text-slate-400 mt-1 font-medium">Membre depuis {memberSince}</p>
        </div>

        {/* KYC CTA — shown only if not verified / pending */}
        <KycProfileButton kycStatus={profile.statutKyc as any} />

        {/* Form */}
        <SettingsForm profile={profile} />

      </div>
    </div>
  );
}
