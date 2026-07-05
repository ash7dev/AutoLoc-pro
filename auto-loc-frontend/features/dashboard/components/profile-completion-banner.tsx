'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, AlertCircle, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/nestjs/auth';

interface ProfileCompletionBannerProps {
    profile: UserProfile;
}

interface CompletionItem {
    label: string;
    completed: boolean;
    priority: 'critical' | 'important' | 'optional';
    action?: {
        label: string;
        href: string;
    };
}

const STORAGE_KEY = 'autoloc_profile_banner_dismissed';
const DISMISS_DURATION_DAYS = 7; // Réafficher après 7 jours

function calculateCompletion(profile: UserProfile) {
    const items: CompletionItem[] = [
        {
            label: 'Vérification d\'identité (KYC)',
            completed: profile.statutKyc === 'VERIFIE',
            priority: 'critical', // Bloque la publication d'annonces
            action: profile.statutKyc !== 'VERIFIE' ? {
                label: 'Vérifier',
                href: '/dashboard/owner/kyc',
            } : undefined,
        },
        {
            label: 'Numéro de téléphone vérifié',
            completed: profile.phoneVerified,
            priority: 'critical', // Nécessaire pour les réservations
            action: !profile.phoneVerified ? {
                label: 'Vérifier',
                href: '/dashboard/settings/profile',
            } : undefined,
        },
        {
            label: 'Photo de profil',
            completed: !!profile.avatarUrl,
            priority: 'important', // Améliore la confiance
            action: !profile.avatarUrl ? {
                label: 'Ajouter',
                href: '/dashboard/settings/profile',
            } : undefined,
        },
        {
            label: 'Informations personnelles',
            completed: !!(profile.prenom && profile.nom && profile.dateNaissance),
            priority: 'important',
            action: !(profile.prenom && profile.nom && profile.dateNaissance) ? {
                label: 'Compléter',
                href: '/dashboard/settings/profile',
            } : undefined,
        },
    ];

    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    // Éléments critiques manquants
    const criticalMissing = items.filter(item => !item.completed && item.priority === 'critical');
    const hasCriticalIssues = criticalMissing.length > 0;

    return {
        items,
        completedCount,
        totalCount,
        percentage,
        isComplete: percentage === 100,
        hasCriticalIssues,
        criticalMissing,
    };
}

function checkDismissed(): boolean {
    if (typeof window === 'undefined') return false;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) return false;

    const dismissedDate = new Date(dismissed);
    const now = new Date();
    const daysSinceDismiss = Math.floor((now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceDismiss < DISMISS_DURATION_DAYS;
}

function setDismissed() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}

export function ProfileCompletionBanner({ profile }: ProfileCompletionBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const completion = calculateCompletion(profile);

    useEffect(() => {
        // Ne pas afficher si profil complet
        if (completion.isComplete) {
            setIsVisible(false);
            return;
        }

        // Toujours afficher si problèmes critiques (KYC ou téléphone)
        if (completion.hasCriticalIssues) {
            setIsVisible(true);
            return;
        }

        // Sinon vérifier si déjà masqué
        const wasDismissed = checkDismissed();
        setIsVisible(!wasDismissed);
    }, [completion.isComplete, completion.hasCriticalIssues]);

    const handleDismiss = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setDismissed();
        }, 300);
    };

    // Ne rien afficher si invisible
    if (!isVisible) {
        return null;
    }

    const incompleteItems = completion.items.filter(item => !item.completed);
    const canDismiss = !completion.hasCriticalIssues; // Ne peut pas masquer si problèmes critiques

    return (
        <div
            className={cn(
                "transition-all duration-300 ease-out",
                isClosing && "opacity-0 scale-95 -translate-y-2"
            )}
        >
            <div className="relative bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-purple-200/60 p-4 sm:p-6 shadow-sm overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Close button (si pas critique) */}
                {canDismiss && (
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/60 hover:bg-white border border-purple-200/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group z-10"
                        aria-label="Masquer pour 7 jours"
                    >
                        <X className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" strokeWidth={2.5} />
                    </button>
                )}

                <div className="flex flex-col sm:flex-row items-start gap-4 relative">
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                                <h3 className="text-[17px] sm:text-[19px] font-black text-slate-900 tracking-tight leading-tight">
                                    Complétez votre profil ✨
                                </h3>
                                <p className="text-[13px] sm:text-[14px] text-slate-600 mt-1.5 font-medium leading-relaxed">
                                    {completion.hasCriticalIssues
                                        ? "Éléments requis pour publier des annonces et recevoir des réservations."
                                        : "Ajoutez vos informations pour rassurer vos locataires."}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4 mb-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.12em] text-purple-700">
                                    Complété
                                </span>
                                <span className={cn(
                                    'text-[14px] sm:text-[15px] font-black tabular-nums',
                                    completion.percentage >= 75 ? 'text-emerald-600' :
                                    completion.percentage >= 50 ? 'text-amber-600' : 'text-purple-700'
                                )}>
                                    {completion.percentage}%
                                </span>
                            </div>
                            <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner relative">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-700 ease-out relative',
                                        completion.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                        completion.percentage >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                        'bg-gradient-to-r from-purple-500 to-indigo-600'
                                    )}
                                    style={{ width: `${completion.percentage}%` }}
                                >
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Missing items - Responsive grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {incompleteItems.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-xl border transition-all hover:shadow-md",
                                        item.priority === 'critical'
                                            ? "bg-red-50/80 border-red-200/60 hover:border-red-300"
                                            : "bg-white/60 border-purple-200/40 hover:border-purple-300"
                                    )}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <AlertCircle
                                            className={cn(
                                                "w-4 h-4 flex-shrink-0",
                                                item.priority === 'critical' ? "text-red-600" : "text-purple-600"
                                            )}
                                            strokeWidth={2.5}
                                        />
                                        <span className="text-[12px] sm:text-[13px] font-bold text-slate-700 truncate">
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.action && (
                                        <Link
                                            href={item.action.href}
                                            className={cn(
                                                "flex items-center gap-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all px-2.5 sm:px-3 py-1.5 rounded-lg flex-shrink-0",
                                                item.priority === 'critical'
                                                    ? "text-red-700 hover:text-red-900 hover:bg-red-100/60"
                                                    : "text-purple-700 hover:text-purple-900 hover:bg-purple-100/60"
                                            )}
                                        >
                                            <span className="hidden xs:inline">{item.action.label}</span>
                                            <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Info sur le masquage */}
                        {canDismiss && (
                            <p className="text-[11px] text-slate-400 mt-3 font-medium">
                                💡 Vous pouvez masquer ce message pendant 7 jours
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
