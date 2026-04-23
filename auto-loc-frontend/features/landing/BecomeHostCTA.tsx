'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight,
    DollarSign,
    Star,
    BarChart3,
    Headphones,
    CheckCircle2,
    TrendingUp,
} from 'lucide-react';

// ─── Benefits data ────────────────────────────────────────────────────────────
const BENEFITS = [
    { icon: DollarSign, title: 'Revenus passifs', description: 'Votre véhicule rapporte même quand vous ne conduisez pas.' },
    { icon: Star, title: 'Locataires vérifiés', description: 'Chaque locataire est identifié et évalué.' },
    { icon: BarChart3, title: 'Tableau de bord', description: 'Suivez vos revenus et réservations en temps réel.' },
    { icon: Headphones, title: 'Support dédié', description: 'Une équipe à votre écoute 7j/7.' },
];

// ─── Section ──────────────────────────────────────────────────────────────────
export function BecomeHostCTA(): React.ReactElement {
    return (
        <section className="px-4 py-6 lg:px-8" aria-labelledby="become-host-heading">
            <div className="mx-auto max-w-7xl">
                {/*
                    Forme : Rectangle avec coin supérieur droit coupé en diagonal
                    (skewed corner via clip-path polygon — différent du blob de StatsSection)
                */}
                <div
                    className="relative overflow-hidden bg-black"
                    style={{
                        clipPath: 'polygon(0 0, calc(100% - 60px) 0, 100% 60px, 100% 100%, 60px 100%, 0 calc(100% - 60px))',
                        filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))',
                    }}
                >
                    {/* ── Ligne diagonale décorative top-right ── */}
                    <div
                        className="absolute top-0 right-0 pointer-events-none"
                        style={{
                            width: 85,
                            height: 85,
                            background: 'linear-gradient(225deg, rgba(52,211,153,0.15) 0%, transparent 60%)',
                        }}
                    />

                    {/* ── Ligne diagonale décorative bottom-left ── */}
                    <div
                        className="absolute bottom-0 left-0 pointer-events-none"
                        style={{
                            width: 85,
                            height: 85,
                            background: 'linear-gradient(45deg, rgba(52,211,153,0.10) 0%, transparent 60%)',
                        }}
                    />

                    {/* Dot grid */}
                    <div
                        className="absolute inset-0 opacity-[0.035] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(52,211,153,0.5) 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />

                    {/* Glow center-left */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.12 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="absolute top-1/2 -left-24 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] pointer-events-none bg-emerald-400"
                    />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

                        {/* ── LEFT: Stat showcase ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center justify-center px-8 py-10 lg:px-14 lg:py-20 border-b border-white/5 lg:border-b-0 lg:border-r lg:border-white/5"
                        >
                            {/* Big trend icon */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
                                className="relative mb-5"
                            >
                                <div className="absolute inset-0 rounded-full border border-emerald-400/20 scale-125 animate-pulse" />
                                <div className="w-24 h-24 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-[64px] lg:text-[80px] font-black leading-none tracking-tight text-emerald-400 mb-1"
                            >
                                +35%
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.5 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-[13px] font-semibold text-white/50 max-w-[200px] text-center leading-relaxed"
                            >
                                de revenus supplémentaires en moyenne
                            </motion.p>

                            {/* Mini stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-7 flex items-center gap-5"
                            >
                                {[
                                    { val: '500+', label: 'Locations' },
                                    { val: '4.6★', label: 'Note moy.' },
                                    { val: '80+', label: 'Véhicules' },
                                ].map((s) => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-[17px] font-black text-white">{s.val}</p>
                                        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{s.label}</p>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* ── RIGHT: Content ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col justify-center px-8 py-10 lg:px-14 lg:py-20"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-5 self-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                                    Propriétaires
                                </span>
                            </div>

                            {/* Heading */}
                            <h2
                                id="become-host-heading"
                                className="text-2xl font-black tracking-tight text-white leading-tight lg:text-3xl mb-2"
                            >
                                Votre véhicule dort ?{' '}
                                <span className="text-emerald-400">Faites-le travailler.</span>
                            </h2>
                            <p className="text-[13px] font-medium leading-relaxed text-white/40 max-w-sm mb-6">
                                Rejoignez des centaines de propriétaires qui rentabilisent leur
                                véhicule sur AutoLoc. Inscription gratuite, commission transparente.
                            </p>

                            {/* Benefits grid — compact 2×2 */}
                            <div className="grid grid-cols-2 gap-2.5 mb-7">
                                {BENEFITS.map((b, i) => {
                                    const Icon = b.icon;
                                    return (
                                        <motion.div
                                            key={b.title}
                                            initial={{ opacity: 0, y: 8 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                                            className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/5 p-3 hover:border-emerald-400/20 hover:bg-emerald-400/5 transition-all duration-200"
                                        >
                                            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/20 mt-0.5">
                                                <Icon className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.75} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-bold text-white leading-tight">{b.title}</p>
                                                <p className="text-[11px] font-medium text-white/35 mt-0.5 leading-snug hidden sm:block">{b.description}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* CTA — toujours visible mobile et desktop */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                            >
                                <Link
                                    href="/become-owner"
                                    className="inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 bg-emerald-400 text-black text-[14px] font-bold shadow-lg shadow-emerald-400/25 hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto"
                                >
                                    Devenir hôte
                                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                </Link>

                                <div className="flex items-center gap-2 text-[12px] font-medium text-white/30">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400/50 flex-shrink-0" strokeWidth={1.75} />
                                    Inscription gratuite · Sans engagement
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
