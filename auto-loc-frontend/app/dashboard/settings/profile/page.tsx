import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ChevronLeft, User, ShieldCheck, Star } from 'lucide-react';
import { ApiError } from '@/lib/nestjs/api-client';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import { KycProfileButton } from '@/features/kyc/KycProfileButton';

export const metadata: Metadata = {
  title: 'Informations — AutoLoc',
  description: 'Gérez vos informations personnelles sur AutoLoc.',
};

/* ── Stat badge ─────────────────────────────────────────────────── */
function StatBadge({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <Icon className={`w-3.5 h-3.5 ${accent ? 'text-emerald-500' : 'text-slate-400'}`} strokeWidth={2} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className={`text-[22px] font-black tracking-tight ${accent ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

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

  const kycLabel =
    profile.statutKyc === 'VERIFIE'
      ? 'Vérifié'
      : profile.statutKyc === 'EN_ATTENTE'
        ? 'En attente'
        : profile.statutKyc === 'REJETE'
          ? 'Rejeté'
          : 'Non vérifié';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link href="/dashboard/settings" className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <h1 className="text-[15px] font-bold text-slate-900">Informations</h1>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-6">

        {/* Page title (desktop) */}
        <div className="hidden lg:block">
          <h1 className="text-[26px] font-black tracking-tight text-slate-900">Mon profil</h1>
          <p className="text-[13.5px] text-slate-400 mt-1">
            Membre depuis {memberSince}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBadge
            icon={Star}
            label="Note"
            value={profile.noteProprietaire > 0 ? `${profile.noteProprietaire.toFixed(1)} / 5` : '—'}
            accent={profile.noteProprietaire > 0}
          />
          <StatBadge
            icon={User}
            label="Avis"
            value={profile.totalAvis}
          />
          <StatBadge
            icon={ShieldCheck}
            label="Statut KYC"
            value={kycLabel}
            accent={profile.statutKyc === 'VERIFIE'}
          />
        </div>

        {/* KYC CTA — shown only if not verified */}
        <KycProfileButton kycStatus={profile.statutKyc as any} />

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <SettingsForm profile={profile} />
        </div>
      </div>
    </div>
  );
}
