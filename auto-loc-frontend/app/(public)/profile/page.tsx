import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchUserProfile, type UserProfile } from '@/lib/nestjs/auth';
import { Footer } from '@/features/landing/Footer';
import {
    User, Mail, Phone, CalendarDays,
    Star, Shield, CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mon profil — AutoLoc',
    description: 'Consultez votre profil AutoLoc.',
};

export default async function ProfilePage() {
    const nestToken = cookies().get('nest_access')?.value ?? null;

    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }

    if (!token) {
        redirect('/login?redirect=/profile');
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

    const KYC_LABELS: Record<string, { label: string; color: string }> = {
        VERIFIE: { label: 'Vérifié', color: 'text-emerald-600' },
        EN_ATTENTE: { label: 'En attente', color: 'text-amber-600' },
        REJETE: { label: 'Rejeté', color: 'text-red-600' },
        NON_VERIFIE: { label: 'Non vérifié', color: 'text-slate-500' },
    };
    const kyc = KYC_LABELS[profile.statutKyc] ?? KYC_LABELS.NON_VERIFIE;

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
                <h1 className="text-2xl font-black tracking-tight text-black mb-8">
                    Mon profil
                </h1>

                {/* Avatar & name */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-white" strokeWidth={1.5} />
                        )}
                    </div>
                    <div>
                        <p className="text-xl font-black text-black">
                            {profile.prenom} {profile.nom}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] font-medium text-black/40">
                                {profile.role === 'PROPRIETAIRE' ? 'Propriétaire' : 'Locataire'}
                            </span>
                            <span className="text-[10px] text-black/20">•</span>
                            <span className={`text-[12px] font-semibold ${kyc.color}`}>{kyc.label}</span>
                        </div>
                    </div>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <InfoCard
                        icon={Mail}
                        label="Email"
                        value={profile.email}
                    />
                    <InfoCard
                        icon={Phone}
                        label="Téléphone"
                        value={profile.telephone}
                        badge={profile.phoneVerified ? 'Vérifié' : undefined}
                    />
                    <InfoCard
                        icon={CalendarDays}
                        label="Membre depuis"
                        value={new Date(profile.creeLe).toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                        })}
                    />
                    <InfoCard
                        icon={Star}
                        label="Notes"
                        value={`${profile.noteLocataire.toFixed(1)} / 5 (${profile.totalAvis} avis)`}
                    />
                </div>

                {/* KYC badge */}
                <div className="rounded-2xl border border-slate-100 p-5 bg-slate-50/40">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-black/30" strokeWidth={1.5} />
                        <div>
                            <p className="text-[13px] font-semibold text-black">Vérification KYC</p>
                            <p className={`text-[12px] font-medium mt-0.5 ${kyc.color}`}>
                                Statut : {kyc.label}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
    badge,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    badge?: string;
}) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white">
            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-black/40" strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{label}</p>
                <p className="text-[14px] font-semibold text-black mt-0.5 truncate">{value}</p>
            </div>
            {badge && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    {badge}
                </span>
            )}
        </div>
    );
}
