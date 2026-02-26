'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    {
        type: 'SUV',
        label: 'SUV',
        description: 'Confort et puissance pour tous les terrains.',
        count: 120,
        emoji: '🚙',
        gradient: 'from-emerald-400/20 to-emerald-400/5',
    },
    {
        type: 'BERLINE',
        label: 'Berline',
        description: 'Élégance et finesse pour la ville.',
        count: 85,
        emoji: '🚗',
        gradient: 'from-blue-400/20 to-blue-400/5',
    },
    {
        type: 'PICKUP',
        label: 'Pick-up',
        description: 'Robustesse pour le travail et l\'aventure.',
        count: 45,
        emoji: '🛻',
        gradient: 'from-amber-400/20 to-amber-400/5',
    },
    {
        type: 'CITADINE',
        label: 'Citadine',
        description: 'Compacte et économique au quotidien.',
        count: 60,
        emoji: '🚘',
        gradient: 'from-violet-400/20 to-violet-400/5',
    },
    {
        type: '4X4',
        label: '4x4',
        description: 'Le compagnon idéal pour la brousse.',
        count: 35,
        emoji: '🏎️',
        gradient: 'from-orange-400/20 to-orange-400/5',
    },
    {
        type: 'LUXE',
        label: 'Luxe',
        description: 'Prestige et raffinement pour les grandes occasions.',
        count: 20,
        emoji: '✨',
        gradient: 'from-yellow-400/20 to-yellow-400/5',
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function CategoriesSection(): React.ReactElement {
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
            { threshold: 0.1 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="px-4 py-20 lg:px-8 lg:py-28"
            aria-labelledby="categories-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                            <span className="text-[13px]">🚗</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Catégories
                            </span>
                        </div>
                        <h2
                            id="categories-heading"
                            className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
                        >
                            Explorez par{' '}
                            <span className="text-emerald-400">type</span>
                        </h2>
                        <p className="mt-4 max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                            Trouvez le véhicule parfait selon votre usage. SUV familial, berline pro, pick-up aventurier…
                        </p>
                    </div>

                    <Link
                        href="/explorer"
                        className="inline-flex flex-shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-black shadow-sm transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 lg:self-auto"
                    >
                        Voir tout
                        <ArrowRight className="h-3.5 w-3.5 text-black/30" strokeWidth={2.5} />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {CATEGORIES.map((cat, i) => (
                        <Link
                            key={cat.type}
                            href={`/explorer?type=${cat.type}`}
                            className={cn(
                                'group relative flex flex-col items-center text-center rounded-2xl',
                                'bg-black border border-white/10 p-6 overflow-hidden',
                                'hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-400/5',
                                'hover:-translate-y-1 transition-all duration-300',
                                isVisible
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-6',
                            )}
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            {/* Gradient bg */}
                            <div className={cn(
                                'absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                                cat.gradient,
                            )} />

                            {/* Emoji */}
                            <div className="relative z-10 text-[36px] mb-3 transition-transform duration-300 group-hover:scale-110">
                                {cat.emoji}
                            </div>

                            {/* Label */}
                            <p className="relative z-10 text-[14px] font-bold text-white tracking-tight">
                                {cat.label}
                            </p>

                            {/* Count */}
                            <p className="relative z-10 text-[11px] font-semibold text-emerald-400/60 mt-1">
                                {cat.count}+ véhicules
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
