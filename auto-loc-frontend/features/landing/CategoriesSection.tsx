'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Car, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CARDS = [
    {
        icon: Car,
        eyebrow: 'Locataires',
        title: 'Trouvez le véhicule parfait',
        description:
            'Des centaines de véhicules vérifiés dans toute la région. SUV, berline, pick-up — réservez en quelques clics, conduisez sereinement.',
        cta: 'Explorer les véhicules',
        href: '/explorer',
        variant: 'emerald' as const,
    },
    {
        icon: Users,
        eyebrow: 'Propriétaires',
        title: 'Rentabilisez votre véhicule',
        description:
            "Rejoignez des centaines de propriétaires qui génèrent des revenus supplémentaires. Inscription rapide, paiements sécurisés.",
        cta: 'Espace hôte',
        href: '/login?next=/dashboard/owner',
        variant: 'emerald' as const,
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
            className="px-4 py-12 lg:px-8 lg:py-20"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {CARDS.map((card, i) => {
                        const Icon = card.icon;
                        const isEmerald = card.variant === 'emerald';
                        return (
                            <div
                                key={card.href}
                                className={cn(
                                    'relative overflow-hidden rounded-3xl bg-black border border-white/10',
                                    'p-6 lg:p-12',
                                    'flex flex-col justify-between gap-6 lg:gap-8',
                                    'min-h-[220px] lg:min-h-[360px]',
                                    'transition-all duration-700 ease-out',
                                    isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8',
                                )}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                {/* Glow background */}
                                <div
                                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
                                    style={{
                                        background: isEmerald
                                            ? 'radial-gradient(circle, #34d399 0%, transparent 70%)'
                                            : 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
                                    }}
                                />

                                {/* Top block */}
                                <div className="relative z-10">
                                    {/* Eyebrow */}
                                    <div className={cn(
                                        'inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6',
                                        isEmerald
                                            ? 'bg-emerald-400/10 border border-emerald-400/20'
                                            : 'bg-white/5 border border-white/10',
                                    )}>
                                        <span className={cn(
                                            'text-[10.5px] font-bold uppercase tracking-widest',
                                            isEmerald ? 'text-emerald-400' : 'text-white/40',
                                        )}>
                                            {card.eyebrow}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <div className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
                                        isEmerald
                                            ? 'bg-emerald-400/10 border border-emerald-400/20'
                                            : 'bg-white/5 border border-white/10',
                                    )}>
                                        <Icon
                                            className={cn(
                                                'h-6 w-6',
                                                isEmerald ? 'text-emerald-400' : 'text-white/50',
                                            )}
                                            strokeWidth={1.75}
                                        />
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-[26px] lg:text-[30px] font-black tracking-tight text-white leading-tight mb-3">
                                        {card.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-[13.5px] font-medium leading-relaxed text-white/35 max-w-sm">
                                        {card.description}
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="relative z-10">
                                    <Link
                                        href={card.href}
                                        className={cn(
                                            'inline-flex items-center gap-2 px-5 py-3 rounded-xl',
                                            'text-[13.5px] font-semibold tracking-tight',
                                            'transition-all duration-200 hover:-translate-y-px active:translate-y-0',
                                            isEmerald
                                                ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-lg shadow-emerald-400/20'
                                                : 'bg-white text-black hover:bg-slate-100 shadow-lg shadow-white/10',
                                        )}
                                    >
                                        {card.cta}
                                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
