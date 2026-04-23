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
    {
        icon: DollarSign,
        title: 'Revenus passifs',
        description: 'Votre véhicule vous rapporte même quand vous ne conduisez pas.',
    },
    {
        icon: Star,
        title: 'Locataires vérifiés',
        description: 'Chaque locataire est identifié et évalué. Votre véhicule est entre de bonnes mains.',
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

// ─── SVG blob clip-path (mirrored from StatsSection for consistency) ──────────
const CTA_CLIP_ID = 'cta-blob-clip';

function BlobClipDef() {
    return (
        <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
                {/* 
                    Organic shape: 
                    - Notch top-right (concave)  
                    - Notch bottom-left (concave)
                    Same language as StatsSection blob
                */}
                <clipPath id={CTA_CLIP_ID} clipPathUnits="objectBoundingBox">
                    <path d="
                        M 0.03,0
                        L 0.72,0
                        C 0.74,0 0.75,0.01 0.75,0.025
                        L 0.75,0.055
                        C 0.75,0.09 0.78,0.115 0.82,0.115
                        L 0.97,0.115
                        C 0.99,0.115 1,0.125 1,0.145
                        L 1,0.975
                        C 1,0.99 0.99,1 0.97,1
                        L 0.28,1
                        C 0.26,1 0.25,0.99 0.25,0.975
                        L 0.25,0.945
                        C 0.25,0.91 0.22,0.885 0.18,0.885
                        L 0.03,0.885
                        C 0.01,0.885 0,0.875 0,0.855
                        L 0,0.03
                        C 0,0.01 0.01,0 0.03,0
                        Z
                    " />
                </clipPath>
            </defs>
        </svg>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function BecomeHostCTA(): React.ReactElement {
    return (
        <section className="px-4 py-6 lg:px-8" aria-labelledby="become-host-heading">
            <div className="mx-auto max-w-7xl">
                <BlobClipDef />

                {/* Blob-shaped outer wrapper */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        clipPath: `url(#${CTA_CLIP_ID})`,
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #052e16 60%, #064e3b 100%)',
                        filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.5))',
                    }}
                >
                    {/* Dot grid texture */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(52,211,153,0.5) 1px, transparent 0)',
                            backgroundSize: '28px 28px',
                        }}
                    />

                    {/* Glow blobs */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.15 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2 }}
                        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none bg-emerald-400"
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[100px] pointer-events-none bg-emerald-300"
                    />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* ── LEFT: Stat showcase ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="flex flex-col items-center justify-center px-8 py-12 lg:px-14 lg:py-20 border-b border-white/5 lg:border-b-0 lg:border-r lg:border-white/5"
                        >
                            {/* Big stat */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
                                className="relative mb-6"
                            >
                                {/* Floating ring */}
                                <div className="absolute inset-0 rounded-full border border-emerald-400/20 scale-125 animate-pulse" />
                                <div className="w-28 h-28 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                                    <TrendingUp className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="text-[72px] lg:text-[88px] font-black leading-none tracking-tight text-emerald-400 mb-2"
                            >
                                +35%
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.55 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-[14px] font-semibold text-white/55 max-w-[220px] text-center leading-relaxed"
                            >
                                de revenus supplémentaires en moyenne pour nos propriétaires
                            </motion.p>

                            {/* Mini stats row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-8 flex items-center gap-6"
                            >
                                {[
                                    { val: '500+', label: 'Locations' },
                                    { val: '4.6★', label: 'Note moy.' },
                                    { val: '80+', label: 'Véhicules' },
                                ].map((s) => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-[18px] font-black text-white">{s.val}</p>
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
                            className="flex flex-col justify-center px-8 py-12 lg:px-14 lg:py-20"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-6 self-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                                    Propriétaires
                                </span>
                            </div>

                            {/* Heading — folder tab style label above */}
                            <div className="mb-6">
                                {/* Folder tab */}
                                <div className="flex items-end h-7 mb-0">
                                    <div className="flex items-center gap-1.5 px-3 pt-1.5 rounded-t-lg bg-white/5 border border-b-0 border-white/10">
                                        <span className="w-1 h-1 rounded-full bg-emerald-400 opacity-70" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                                            Votre véhicule
                                        </span>
                                    </div>
                                    <div className="flex-1 border-b border-white/10" />
                                </div>
                                {/* Card body for heading */}
                                <div className="rounded-b-2xl rounded-tr-2xl bg-white/5 border border-t-0 border-white/10 px-5 py-4">
                                    <h2
                                        id="become-host-heading"
                                        className="text-2xl font-black tracking-tight text-white leading-tight lg:text-3xl"
                                    >
                                        Votre véhicule dort ?{' '}
                                        <span className="text-emerald-400">Faites-le travailler.</span>
                                    </h2>
                                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/45 max-w-sm">
                                        Rejoignez des centaines de propriétaires qui rentabilisent leur
                                        véhicule sur AutoLoc. Inscription gratuite, commission transparente.
                                    </p>
                                </div>
                            </div>

                            {/* Benefits grid — compact 2×2 */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {BENEFITS.map((b, i) => {
                                    const Icon = b.icon;
                                    return (
                                        <motion.div
                                            key={b.title}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
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

                            {/* CTA row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                            >
                                <Link
                                    href="/become-owner"
                                    className="inline-flex items-center gap-2.5 rounded-xl px-6 py-3.5 bg-emerald-400 text-black text-[14px] font-bold shadow-lg shadow-emerald-400/25 hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                                >
                                    Devenir hôte
                                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                                </Link>

                                <div className="flex items-center gap-2 text-[12px] font-medium text-white/30">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400/50" strokeWidth={1.75} />
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
