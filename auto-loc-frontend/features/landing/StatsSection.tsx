'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Car, MapPin, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Stats data ───────────────────────────────────────────────────────────────
const STATS = [
    {
        icon: Car,
        value: 500,
        suffix: '+',
        label: 'Véhicules disponibles',
        description: 'Sur tout le territoire',
    },
    {
        icon: MapPin,
        value: 10000,
        suffix: '+',
        label: 'Locations réalisées',
        description: 'Et ça continue',
    },
    {
        icon: Star,
        value: 4.9,
        suffix: '/5',
        label: 'Note moyenne',
        description: 'Par nos locataires',
        isDecimal: true,
    },
    {
        icon: ShieldCheck,
        value: 100,
        suffix: '%',
        label: 'Véhicules vérifiés',
        description: 'Aucun compromis',
    },
];

// ─── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedCounter(
    target: number,
    isVisible: boolean,
    isDecimal = false,
    duration = 2000,
): string {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        const steps = 60;
        const increment = target / steps;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            if (frame >= steps) {
                setCurrent(target);
                clearInterval(timer);
            } else {
                // Ease-out curve
                const progress = 1 - Math.pow(1 - frame / steps, 3);
                setCurrent(progress * target);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [target, isVisible, duration]);

    if (isDecimal) return current.toFixed(1);
    return Math.floor(current).toLocaleString('fr-FR');
}

// ─── Single stat card ─────────────────────────────────────────────────────────
function StatItem({
    stat,
    isVisible,
    index,
}: {
    stat: (typeof STATS)[0];
    isVisible: boolean;
    index: number;
}) {
    const Icon = stat.icon;
    const displayValue = useAnimatedCounter(
        stat.value,
        isVisible,
        stat.isDecimal,
    );

    return (
        <div
            className={cn(
                'flex flex-col items-center text-center px-6 py-8 lg:py-0',
                'transition-all duration-700 ease-out',
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            )}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 mb-5">
                <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
            </div>

            {/* Value */}
            <p className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-none tracking-tight text-emerald-400 tabular-nums">
                {displayValue}
                <span className="text-emerald-400/60">{stat.suffix}</span>
            </p>

            {/* Label */}
            <p className="mt-3 text-[14px] font-bold text-white tracking-tight">
                {stat.label}
            </p>
            <p className="mt-1 text-[12px] font-medium text-white/35">
                {stat.description}
            </p>
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function StatsSection(): React.ReactElement {
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
            { threshold: 0.2 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="px-4 py-6 lg:px-8" aria-labelledby="stats-heading">
            <div className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-[2rem] bg-black border border-white/10 py-16 lg:py-20 px-6 md:px-8 lg:px-16">
                    {/* Background glow effects */}
                    <div
                        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[100px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                    />
                    <div
                        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-[100px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                    />

                    {/* Header */}
                    <div className="relative z-10 text-center mb-14">
                        <h2
                            id="stats-heading"
                            className="text-3xl font-black tracking-tight text-white leading-tight lg:text-4xl"
                        >
                            AutoLoc en{' '}
                            <span className="text-emerald-400">chiffres</span>
                        </h2>
                        <p className="mt-3 mx-auto max-w-md text-[14px] font-medium leading-relaxed text-white/40">
                            La confiance de toute une communauté, en quelques chiffres qui parlent d&apos;eux-mêmes.
                        </p>
                    </div>

                    {/* Stats grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
                        {STATS.map((stat, i) => (
                            <StatItem key={stat.label} stat={stat} isVisible={isVisible} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
