'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, CalendarCheck, Car } from 'lucide-react';

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
    {
        number: '01',
        title: 'Cherchez',
        description:
            'Parcourez des centaines de véhicules vérifiés. Filtrez par zone, type, budget — trouvez la perle rare en quelques secondes.',
        icon: Search,
        detail: 'Filtres intelligents',
    },
    {
        number: '02',
        title: 'Réservez',
        description:
            'Choisissez vos dates, confirmez en un clic. Paiement sécurisé, confirmation instantanée. Zéro paperasse.',
        icon: CalendarCheck,
        detail: 'Paiement sécurisé',
    },
    {
        number: '03',
        title: 'Conduisez',
        description:
            'Récupérez le véhicule au point convenu. La route est à vous. Assistance 24/7 incluse.',
        icon: Car,
        detail: 'Support 24/7',
    },
];

// ─── Section ──────────────────────────────────────────────────────────────────
export function HowItWorksSection(): React.ReactElement {
    return (
        <section className="px-4 py-10 lg:px-8 lg:py-14" aria-labelledby="how-it-works-heading">
            <div className="mx-auto max-w-7xl">
                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 lg:mb-16 text-center"
                >
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
                        Comment ça <span className="text-emerald-400">marche</span> ?
                    </h2>
                    <p className="mt-4 mx-auto max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                        3 étapes simples pour prendre la route. Pas de paperasse, pas de stress.
                    </p>
                </motion.div>

                {/* ── Timeline Container ── */}
                <div className="relative">

                    {/* ── Horizontal connector line (desktop) ── */}
                    <div className="hidden lg:block absolute top-[72px] left-[16.66%] right-[16.66%] h-px z-0">
                        {/* Track */}
                        <div className="w-full h-full bg-slate-200" />
                        {/* Animated progress */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-emerald-400 origin-left"
                        />
                    </div>

                    {/* ── Steps Grid ── */}
                    <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-8">
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isLast = i === STEPS.length - 1;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.2 }}
                                    className="group relative flex flex-col items-center"
                                >
                                    {/* ── Vertical connector line (mobile only) ── */}
                                    {!isLast && (
                                        <div className="lg:hidden absolute top-[72px] left-1/2 -translate-x-1/2 w-px h-[calc(100%-56px)] z-0">
                                            <div className="w-full h-full bg-slate-200" />
                                            <motion.div
                                                initial={{ scaleY: 0 }}
                                                whileInView={{ scaleY: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: 0.6 + i * 0.3 }}
                                                className="absolute inset-0 bg-emerald-400 origin-top"
                                            />
                                        </div>
                                    )}

                                    {/* ── Node ── */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 15,
                                            delay: 0.3 + i * 0.2,
                                        }}
                                        className="relative z-10 mb-6"
                                    >
                                        {/* Pulse ring */}
                                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        {/* Outer ring */}
                                        <div className="w-[72px] h-[72px] rounded-full bg-white border-2 border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-400/10 group-hover:border-emerald-400/60 group-hover:shadow-emerald-400/20 transition-all duration-300">
                                            {/* Inner circle with icon */}
                                            <div className="w-[52px] h-[52px] rounded-full bg-black flex items-center justify-center group-hover:bg-emerald-950 transition-colors duration-300">
                                                <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                                            </div>
                                        </div>
                                        {/* Step number badge */}
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center shadow-md">
                                            <span className="text-[10px] font-black text-black">{step.number}</span>
                                        </div>
                                    </motion.div>

                                    {/* ── Card with folder-tab shape ── */}
                                    <div className="relative z-10 w-full mb-10 lg:mb-0">
                                        {/* Folder tab */}
                                        <div className="flex items-end h-7 mx-4">
                                            <div className="flex items-center gap-1.5 px-3 pt-1.5 rounded-t-lg bg-black border border-b-0 border-white/10 group-hover:border-emerald-400/30 transition-colors duration-300">
                                                <span className="w-1 h-1 rounded-full bg-emerald-400 opacity-60" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                                                    {step.detail}
                                                </span>
                                            </div>
                                            <div className="flex-1 border-b border-white/10 group-hover:border-emerald-400/20 transition-colors duration-300" />
                                        </div>

                                        {/* Card body */}
                                        <div className="relative overflow-hidden rounded-b-2xl rounded-tr-2xl bg-black border border-t-0 border-white/10 p-6 group-hover:border-emerald-400/25 transition-all duration-300">
                                            {/* Glow */}
                                            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-15 blur-2xl pointer-events-none transition-opacity duration-500" />

                                            {/* Big number watermark */}
                                            <span className="absolute top-2 right-4 text-[56px] font-black leading-none text-white/[0.03] select-none pointer-events-none">
                                                {step.number}
                                            </span>

                                            <h3 className="text-[20px] font-black tracking-tight text-white mb-2.5">
                                                {step.title}
                                            </h3>
                                            <p className="text-[13px] font-medium leading-relaxed text-white/45">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
