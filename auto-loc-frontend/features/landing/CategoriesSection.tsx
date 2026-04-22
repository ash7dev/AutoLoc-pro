'use client';

import React from 'react';
import Link from 'next/link';
import { Car, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        href: '/become-owner',
        variant: 'emerald' as const,
    },
];

export function CategoriesSection(): React.ReactElement {
    return (
        <section className="px-4 py-12 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {CARDS.map((card, i) => {
                        const isEmerald = card.variant === 'emerald';
                        return (
                            <motion.div
                                key={card.href}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                whileHover={{ y: -5 }}
                                className={cn(
                                    'relative overflow-hidden rounded-[2.5rem] bg-black border border-white/10',
                                    'p-8 lg:p-14',
                                    'flex flex-col justify-between gap-10 lg:gap-14',
                                    'min-h-[280px] lg:min-h-[420px]',
                                    'transition-shadow duration-500 hover:shadow-2xl hover:shadow-emerald-500/10',
                                )}
                            >
                                {/* Glow background */}
                                <div
                                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.15] blur-3xl pointer-events-none transition-transform duration-700"
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
                                        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8',
                                        isEmerald
                                            ? 'bg-emerald-400/10 border border-emerald-400/20'
                                            : 'bg-white/5 border border-white/10',
                                    )}>
                                        <span className={cn(
                                            'text-[10px] font-bold uppercase tracking-[0.2em]',
                                            isEmerald ? 'text-emerald-400' : 'text-white/40',
                                        )}>
                                            {card.eyebrow}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] mb-5">
                                        {card.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-base lg:text-lg font-medium leading-relaxed text-white/35 max-w-md">
                                        {card.description}
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="relative z-10">
                                    <Link
                                        href={card.href}
                                        className={cn(
                                            'inline-flex items-center gap-3 px-8 py-4 rounded-2xl',
                                            'text-[15px] font-bold tracking-tight',
                                            'transition-all duration-300',
                                            isEmerald
                                                ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-xl shadow-emerald-400/20'
                                                : 'bg-white text-black hover:bg-slate-100 shadow-xl shadow-white/10',
                                        )}
                                    >
                                        {card.cta}
                                        <ArrowRight className="h-4 w-4" strokeWidth={3} />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
