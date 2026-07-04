'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, LogOut, Loader2, ChevronLeft } from 'lucide-react';
import { useSwitchToProprietaire } from '@/features/owner/hooks/use-switch-to-proprietaire';
import { supabase } from '@/lib/supabase/client';
import { useRoleStore } from '@/features/auth/stores/role.store';
import { SettingsForm } from '@/features/dashboard/components/settings-form';
import type { UserProfile } from '@/lib/nestjs/auth';
import Link from 'next/link';

interface SettingsPageWrapperProps {
    profile: UserProfile;
    memberSince: string;
}

export function SettingsPageWrapper({ profile, memberSince }: SettingsPageWrapperProps) {
    const { switchToProprietaire, loading: switchingRole, error: hookError } = useSwitchToProprietaire();
    const router = useRouter();
    const [switchError, setSwitchError] = React.useState<string | null>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        useRoleStore.getState().clearRole();
        router.push('/login');
    };

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
            {/* Header avec boutons d'action */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16 gap-4">
                        {/* Bouton retour */}
                        <Link
                            href="/"
                            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-2">
                            {profile.role === 'LOCATAIRE' && (
                                <button
                                    onClick={handleSwitchToOwner}
                                    disabled={switchingRole}
                                    className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                                >
                                    {switchingRole ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    )}
                                    <span className="hidden sm:inline">Espace propriétaire</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all shadow-sm"
                            >
                                <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
                                <span className="hidden sm:inline">Déconnexion</span>
                            </button>
                        </div>
                    </div>

                    {/* Erreur de changement de rôle */}
                    {(switchError || hookError) && (
                        <div className="pb-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] font-medium">
                                {switchError || hookError}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenu */}
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
    );
}
