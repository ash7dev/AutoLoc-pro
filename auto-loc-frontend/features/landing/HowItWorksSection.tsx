'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, CalendarCheck, Car, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
    {
        number: '01',
        title: 'Cherchez',
        description:
            'Parcourez des centaines de véhicules vérifiés. Filtrez par zone, type, budget — trouvez la perle rare en quelques secondes.',
        icon: Search,
    },
    {
        number: '02',
        title: 'Réservez',
        description:
            'Choisissez vos dates, confirmez en un clic. Paiement sécurisé, confirmation instantanée. Zéro paperasse.',
        icon: CalendarCheck,
    },
    {
        number: '03',
        title: 'Conduisez',
        description:
            'Récupérez le véhicule au point convenu. La route est à vous. Assistance 24/7 incluse.',
        icon: Car,
    },
];

// ─── Section ──────────────────────────────────────────────────────────────────
export function HowItWorksSection(): React.ReactElement {
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
            className="px-4 py-10 lg:px-8 lg:py-14"
            aria-labelledby="how-it-works-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* ── Header ── */}
                <div className="mb-8 lg:mb-14 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                            Simple et rapide
                        </span>
                    </div>
                    <h2
                        id="how-it-works-heading"
                        className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
                    >
                        Comment ça{' '}
                        <span className="text-emerald-400">marche</span> ?
                    </h2>
                    <p className="mt-4 mx-auto max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                        3 étapes simples pour prendre la route. Pas de paperasse, pas de
                        stress.
                    </p>
                </div>

                {/* ── Steps grid ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={step.number} className="relative flex">
                                {/* Connector arrow — desktop only, between cards */}
                                {i < STEPS.length - 1 && (
                                    <div className="absolute -right-[18px] top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                                            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                )}

                                {/* Card */}
                                <div
                                    className={cn(
                                        'flex-1 relative overflow-hidden rounded-2xl',
                                        'bg-black border border-white/10',
                                        'p-6 lg:p-10',
                                        'transition-all duration-700 ease-out',
                                        isVisible
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-8',
                                    )}
                                    style={{ transitionDelay: `${i * 150}ms` }}
                                >
                                    {/* Glow effect top-right */}
                                    <div
                                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                                        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                                    />

                                    {/* Number */}
                                    <span className="text-[64px] font-black leading-none text-emerald-400/10 absolute top-4 right-6 select-none">
                                        {step.number}
                                    </span>

                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 mb-6">
                                        <Icon className="h-6 w-6 text-emerald-400" strokeWidth={1.75} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-[22px] font-black tracking-tight text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-[14px] font-medium leading-relaxed text-white/50">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
