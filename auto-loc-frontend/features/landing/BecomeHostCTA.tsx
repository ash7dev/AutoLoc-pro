'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    DollarSign,
    Shield,
    BarChart3,
    Headphones,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Benefits data ────────────────────────────────────────────────────────────
const BENEFITS = [
    {
        icon: DollarSign,
        title: 'Revenus passifs',
        description: 'Votre véhicule vous rapporte même quand vous ne conduisez pas.',
    },
    {
        icon: Shield,
        title: 'Assurance incluse',
        description: 'Chaque location est couverte. Votre véhicule est protégé.',
    },
    {
        icon: BarChart3,
        title: 'Tableau de bord',
        description: 'Suivez vos revenus, réservations et statistiques en temps réel.',
    },
    {
        icon: Headphones,
        title: 'Support dédié',
        description: 'Une équipe à votre écoute 7j/7 pour vous accompagner.',
    },
];

// ─── Section ──────────────────────────────────────────────────────────────────
export function BecomeHostCTA(): React.ReactElement {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="px-4 py-20 lg:px-8 lg:py-28"
            aria-labelledby="become-host-heading"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-0 overflow-hidden rounded-[2rem]">
                    {/* ── Left: Image side ── */}
                    <div className="relative min-h-[400px] lg:min-h-[560px] overflow-hidden rounded-[2rem] lg:rounded-r-none bg-black">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-30">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage:
                                        'radial-gradient(circle at 2px 2px, rgba(52, 211, 153, 0.15) 1px, transparent 0)',
                                    backgroundSize: '32px 32px',
                                }}
                            />
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-black/60" />

                        {/* Content over the image area */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 py-16 text-center">
                            {/* Big icon */}
                            <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 mb-8">
                                <svg
                                    className="w-12 h-12 text-emerald-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.6 1 14v2c0 .6.4 1 1 1h2" />
                                    <circle cx="7" cy="17" r="2" />
                                    <path d="M9 17h6" />
                                    <circle cx="17" cy="17" r="2" />
                                </svg>
                            </div>

                            <p className="text-[52px] lg:text-[64px] font-black leading-none tracking-tight text-emerald-400 mb-3">
                                +35%
                            </p>
                            <p className="text-[15px] font-semibold text-white/60 max-w-xs">
                                de revenus supplémentaires en moyenne pour nos propriétaires
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Content side ── */}
                    <div className="relative bg-black rounded-[2rem] lg:rounded-l-none border border-white/10 lg:border-l-0 p-10 lg:p-14 flex flex-col justify-center">
                        {/* Glow */}
                        <div
                            className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-15 blur-[80px] pointer-events-none"
                            style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                        />

                        <div className="relative z-10">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-6">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                                    Propriétaires
                                </span>
                            </div>

                            {/* Heading */}
                            <h2
                                id="become-host-heading"
                                className={cn(
                                    'text-3xl font-black tracking-tight text-white leading-tight lg:text-4xl',
                                    'transition-all duration-700 ease-out',
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                                )}
                            >
                                Votre véhicule dort ?{' '}
                                <span className="text-emerald-400">Faites-le travailler.</span>
                            </h2>

                            <p
                                className={cn(
                                    'mt-5 text-[15px] font-medium leading-relaxed text-white/50 max-w-md',
                                    'transition-all duration-700 ease-out delay-100',
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                                )}
                            >
                                Rejoignez des centaines de propriétaires qui rentabilisent leur
                                véhicule sur AutoLoc. Inscription gratuite, commission transparente.
                            </p>

                            {/* Benefits */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BENEFITS.map((b, i) => {
                                    const Icon = b.icon;
                                    return (
                                        <div
                                            key={b.title}
                                            className={cn(
                                                'flex items-start gap-3 rounded-xl bg-white/5 border border-white/5 p-4',
                                                'transition-all duration-700 ease-out',
                                                'hover:border-emerald-400/20 hover:bg-emerald-400/5',
                                                isVisible
                                                    ? 'opacity-100 translate-y-0'
                                                    : 'opacity-0 translate-y-6',
                                            )}
                                            style={{ transitionDelay: `${200 + i * 100}ms` }}
                                        >
                                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
                                                <Icon
                                                    className="h-4 w-4 text-emerald-400"
                                                    strokeWidth={1.75}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-white">
                                                    {b.title}
                                                </p>
                                                <p className="text-[12px] font-medium text-white/40 mt-0.5 leading-relaxed">
                                                    {b.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA */}
                            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                                <Link
                                    href="/become-owner"
                                    className={cn(
                                        'inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5',
                                        'bg-emerald-400 text-black text-[14px] font-bold',
                                        'shadow-lg shadow-emerald-400/25',
                                        'hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/30',
                                        'hover:-translate-y-0.5 active:translate-y-0',
                                        'transition-all duration-200',
                                    )}
                                >
                                    Devenir hôte
                                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                </Link>

                                <div className="flex items-center gap-2 text-[13px] font-medium text-white/30">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400/50" strokeWidth={1.75} />
                                    Inscription gratuite · Sans engagement
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
