'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle, ChevronRight, Camera, Phone, Shield, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/nestjs/auth';

interface ProfileCompletionBannerProps {
    profile: UserProfile;
    vehiclesCount?: number;
}

interface CompletionItem {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    icon: typeof Shield;
    priority: 'critical' | 'important' | 'optional';
    action?: {
        label: string;
        href: string;
    };
}

function calculateCompletion(profile: UserProfile) {
    const items: CompletionItem[] = [
        {
            id: 'kyc',
            label: 'Vérification d\'identité (KYC)',
            description: 'Votre identité a été vérifiée avec succès.',
            completed: profile.statutKyc === 'VERIFIE',
            icon: Shield,
            priority: 'critical',
            action: profile.statutKyc !== 'VERIFIE' ? {
                label: 'Vérifier',
                href: '/dashboard/owner/kyc',
            } : undefined,
        },
        {
            id: 'phone',
            label: 'Vérification de téléphone',
            description: 'Vérifiez votre numéro de téléphone.',
            completed: profile.phoneVerified,
            icon: Phone,
            priority: 'critical',
            action: !profile.phoneVerified ? {
                label: 'Vérifier',
                href: '/dashboard/settings/profile',
            } : undefined,
        },
        {
            id: 'avatar',
            label: 'Photo de profil',
            description: 'Ajoutez une photo de profil pour renforcer la confiance.',
            completed: !!profile.avatarUrl,
            icon: Camera,
            priority: 'important',
            action: !profile.avatarUrl ? {
                label: 'Ajouter',
                href: '/dashboard/settings/profile',
            } : undefined,
        },
        {
            id: 'info',
            label: 'Informations personnelles',
            description: 'Complétez vos informations personnelles.',
            completed: !!(profile.prenom && profile.nom && profile.dateNaissance),
            icon: FileText,
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

    return {
        items,
        completedCount,
        totalCount,
        percentage,
        isComplete: percentage === 100,
    };
}

export function ProfileCompletionBanner({ profile, vehiclesCount = 0 }: ProfileCompletionBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const completion = calculateCompletion(profile);

    useEffect(() => {
        // Afficher si profil incomplet ET aucun véhicule
        setIsVisible(!completion.isComplete && vehiclesCount === 0);
    }, [completion.isComplete, vehiclesCount]);

    // Ne rien afficher si profil complet OU si l'utilisateur a au moins un véhicule
    if (!isVisible || vehiclesCount > 0) {
        return null;
    }

    const incompleteItems = completion.items.filter(item => !item.completed);

    return (
        <div className="space-y-4">
            {/* Welcome Banner avec voiture */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-slate-900/20">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 p-6 lg:p-8">
                    {/* Left side: Texte */}
                    <div className="flex items-start gap-4 flex-1">
                        {/* Rocket Icon */}
                        <div className="w-16 h-16 bg-emerald-500/10 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                            <span className="text-4xl">🚀</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                                <h2 className="text-[22px] lg:text-[26px] font-black tracking-tight">
                                    Bienvenue sur <span className="text-emerald-400">AutoLoc</span> !
                                </h2>
                            </div>
                            <p className="text-[14px] lg:text-[15px] font-medium text-slate-300 max-w-[600px] leading-relaxed">
                                Votre espace propriétaire est prêt. Commencez par ajouter votre premier véhicule pour commencer à recevoir des demandes de location.
                            </p>
                        </div>
                    </div>

                    {/* Right side: Illustration + CTA */}
                    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center">
                        {/* Car illustration avec shield */}
                        <div className="relative w-48 h-32 lg:w-56 lg:h-36 flex items-center justify-center">
                            {/* Shield with checkmark */}
                            <div className="absolute -left-4 top-4 lg:-left-6 lg:top-6 w-16 h-16 lg:w-20 lg:h-20 bg-emerald-500 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 border-2 border-emerald-400/30 z-10">
                                <CheckCircle className="w-8 h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2.5} />
                            </div>
                            {/* Car emoji/illustration */}
                            <div className="text-7xl lg:text-8xl opacity-90">🚗</div>
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/dashboard/owner/vehicles/new"
                            className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[14px] shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-100 transition-all"
                        >
                            Ajouter mon premier véhicule
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Profile Completion Card */}
            <div className="relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-[16px] lg:text-[18px] font-black text-slate-900 tracking-tight">
                                    Complétez votre profil ✨
                                </h3>
                                <p className="text-[12px] lg:text-[13px] text-slate-500 font-medium mt-0.5">
                                    Éléments requis pour publier des annonces et recevoir des réservations.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-600 hidden sm:inline">
                                Plus votre profil est complet, plus vous inspirez confiance !
                            </span>
                            <Sparkles className="w-4 h-4 text-emerald-500 hidden sm:block" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-slate-50 rounded-xl p-3 mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                {completion.completedCount} / {completion.totalCount} étapes complétées
                            </span>
                            <span className={cn(
                                'text-[15px] font-black tabular-nums',
                                completion.percentage >= 75 ? 'text-emerald-600' :
                                completion.percentage >= 50 ? 'text-orange-500' : 'text-orange-500'
                            )}>
                                {completion.percentage}%
                            </span>
                        </div>
                        <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-700 ease-out',
                                    completion.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-orange-400 to-orange-500'
                                )}
                                style={{ width: `${completion.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Completion items grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {completion.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                                        item.completed
                                            ? "bg-emerald-50/50 border-emerald-200"
                                            : "bg-slate-50 border-slate-200 hover:border-emerald-300 hover:shadow-md"
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        item.completed ? "bg-emerald-500" : "bg-slate-100"
                                    )}>
                                        {item.completed ? (
                                            <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                                        ) : (
                                            <Icon className="w-5 h-5 text-slate-700" strokeWidth={2} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-slate-900 mb-0.5">
                                            {item.label}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            {item.completed ? item.description : item.description}
                                        </p>
                                    </div>

                                    {/* Action button */}
                                    {item.action && (
                                        <Link
                                            href={item.action.href}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 rounded-lg transition-all text-[11px] font-bold text-white group"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
