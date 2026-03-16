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
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login?expired=1');
    }
    throw err;
  }

  const memberSince = new Date(profile.creeLe).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/dashboard/settings"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <h1 className="text-[15px] font-bold text-slate-900">Mon profil</h1>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">

        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-[26px] font-black tracking-tight text-slate-900">Mon profil</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Membre depuis {memberSince}</p>
        </div>

        {/* KYC CTA — shown only if not verified / pending */}
        <KycProfileButton kycStatus={profile.statutKyc as any} />

        {/* Form */}
        <SettingsForm profile={profile} />

      </div>
    </div>
  );
}
