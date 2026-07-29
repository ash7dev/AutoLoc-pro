'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { useSwitchToProprietaire } from '@/features/owner/hooks/use-switch-to-proprietaire';
import { useSignOut } from '@/features/auth/hooks/use-signout';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import type { UserProfile } from '@/lib/nestjs/auth';

interface SettingsPageWrapperProps {
    profile: UserProfile;
    memberSince: string;
}

export function SettingsPageWrapper({ profile, memberSince }: SettingsPageWrapperProps) {
    const { switchToProprietaire, loading: switchingRole, error: hookError } = useSwitchToProprietaire();
    const router = useRouter();
    const [switchError, setSwitchError] = React.useState<string | null>(null);
    const { signOut: handleLogout, loading: loggingOut } = useSignOut();

    const handleSwitchToOwner = async () => {
        setSwitchError(null);
        try {
            await switchToProprietaire();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erreur lors du changement de rôle';
            setSwitchError(message);
        }
    };

    return (
        <div className="min-h-full bg-slate-50">
            {/* Contenu */}
            <div className="max-w-3xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">
                {/* Page title avec boutons */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-[24px] lg:text-[26px] font-black tracking-tight text-slate-900">Mon profil</h1>
                        <p className="text-[13px] text-slate-400 mt-1 font-medium">Membre depuis {memberSince}</p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {profile.role === 'PROPRIETAIRE' ? (
                            <Link
                                href="/dashboard/owner"
                                className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span>Propriétaire</span>
                            </Link>
                        ) : (
                            <button
                                onClick={handleSwitchToOwner}
                                disabled={switchingRole}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                            >
                                {switchingRole ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                                )}
                                <span>Propriétaire</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-lg shadow-black/10 hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loggingOut ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
                            )}
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>

                {/* Erreur de changement de rôle */}
                {(switchError || hookError) && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                        <p className="text-[13px] text-red-700 font-bold">{switchError || hookError}</p>
                    </div>
                )}

                {/* Form */}
                <SettingsForm profile={profile} />
            </div>
        </div>
    );
}
