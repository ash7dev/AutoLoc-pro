'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
            'Des centaines de véhicules vérifiés dans toute la région. SUV, berline, pick-up — réservez en quelques clics.',
        cta: 'Explorer les véhicules',
        href: '/explorer',
        side: 'left',
    },
    {
        icon: Users,
        eyebrow: 'Propriétaires',
        title: 'Rentabilisez votre véhicule',
        description:
            "Rejoignez des centaines de propriétaires qui génèrent des revenus supplémentaires. Inscription rapide, paiements sécurisés.",
        cta: 'Espace hôte',
        href: '/become-owner',
        side: 'right',
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function CategoriesSection(): React.ReactElement {
    return (
        <section className="px-4 py-16 lg:px-8 lg:py-24" aria-labelledby="categories-heading">
            <div className="mx-auto max-w-7xl">
                <h2 id="categories-heading" className="sr-only">Locataires et Propriétaires</h2>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {CARDS.map((card, i) => {
                        const Icon = card.icon;
                        const isLeft = card.side === 'left';

                        return (
                            <motion.div
                                key={card.href}
                                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="group relative"
                            >
                                {/* 
                                    SHAPE WRAPPER 
                                    Using asymmetric clip-path:
                                    Left card: cut top-left
                                    Right card: cut top-right
                                */}
                                <div
                                    className="relative overflow-hidden bg-black min-h-[340px] lg:min-h-[400px] flex flex-col justify-between p-8 lg:p-12 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                    style={{
                                        clipPath: isLeft 
                                            ? 'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)' 
                                            : 'polygon(0% 0%, calc(100% - 40px) 0%, 100% 40px, 100% 100%, 0% 100%)',
                                    }}
                                >
                                    {/* Border Glow Simulation */}
                                    <div 
                                        className="absolute inset-0 border border-white/5 pointer-events-none transition-colors duration-500 group-hover:border-emerald-400/30"
                                        style={{
                                            clipPath: isLeft 
                                                ? 'polygon(40px 0%, 100% 0%, 100% 100%, 0% 100%, 0% 40px)' 
                                                : 'polygon(0% 0%, calc(100% - 40px) 0%, 100% 40px, 100% 100%, 0% 100%)',
                                        }}
                                    />

                                    {/* Background Pattern */}
                                    <div 
                                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                                        style={{
                                            backgroundImage: 'linear-gradient(30deg, #34d399 12%, transparent 12.5%, transparent 87%, #34d399 87.5%, #34d399), linear-gradient(150deg, #34d399 12%, transparent 12.5%, transparent 87%, #34d399 87.5%, #34d399), linear-gradient(30deg, #34d399 12%, transparent 12.5%, transparent 87%, #34d399 87.5%, #34d399), linear-gradient(150deg, #34d399 12%, transparent 12.5%, transparent 87%, #34d399 87.5%, #34d399), linear-gradient(60deg, #34d399 25%, transparent 25.5%, transparent 75%, #34d399 75%, #34d399), linear-gradient(60deg, #34d399 25%, transparent 25.5%, transparent 75%, #34d399 75%, #34d399)',
                                            backgroundSize: '40px 70px',
                                        }}
                                    />

                                    {/* Ambient Glow */}
                                    <div className={cn(
                                        "absolute w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none bg-emerald-400",
                                        isLeft ? "-top-20 -left-20" : "-top-20 -right-20"
                                    )} />

                                    {/* Content Top */}
                                    <div className="relative z-10">
                                        {/* Eyebrow with folder-style tab */}
                                        <div className="inline-flex items-center gap-2 mb-8">
                                            <div className="h-[2px] w-8 bg-emerald-400/30 group-hover:w-12 transition-all duration-500" />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                                                {card.eyebrow}
                                            </span>
                                        </div>

                                        <div className="mb-6 flex items-center justify-between">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-400/5 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400/10 group-hover:border-emerald-400/20 transition-all duration-500">
                                                <Icon className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
                                            </div>
                                            <span className="text-[40px] font-black text-emerald-400/20 select-none group-hover:text-emerald-400/30 transition-colors">
                                                0{i + 1}
                                            </span>
                                        </div>

                                        <h3 className="text-[22px] lg:text-[28px] font-black tracking-tight text-white leading-tight mb-4 group-hover:translate-x-2 transition-transform duration-500">
                                            {card.title}
                                        </h3>

                                        <p className="text-[15px] font-medium leading-relaxed text-white/60 max-w-sm">
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Content Bottom / CTA */}
                                    <div className="relative z-10 mt-8">
                                        <Link
                                            href={card.href}
                                            className="inline-flex items-center gap-3 text-emerald-400 font-bold group/btn"
                                        >
                                            <span className="text-[14px] tracking-tight border-b-2 border-emerald-400/30 pb-1 group-hover/btn:border-emerald-400 transition-all">
                                                {card.cta}
                                            </span>
                                            <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center group-hover/btn:bg-emerald-400 group-hover/btn:text-black transition-all">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
