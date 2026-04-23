'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Car, MapPin, Star, ShieldCheck } from 'lucide-react';

// ─── Stats data ───────────────────────────────────────────────────────────────
const STATS = [
    {
        icon: Car,
        value: 80,
        suffix: '+',
        label: 'Véhicules disponibles',
        description: 'Sur tout le territoire',
    },
    {
        icon: MapPin,
        value: 500,
        suffix: '+',
        label: 'Locations réalisées',
        description: 'Et ça continue',
    },
    {
        icon: Star,
        value: 4.6,
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

function StatNumber({ value, suffix, isDecimal, delay }: { value: number, suffix: string, isDecimal?: boolean, delay: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    
    const spring = useSpring(0, {
        mass: 1,
        stiffness: 100,
        damping: 30,
    });
    
    const display = useTransform(spring, (current) => 
        isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString('fr-FR')
    );

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => spring.set(value), delay * 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, value, spring, delay]);

    return (
        <p ref={ref} className="text-[36px] sm:text-[42px] lg:text-[52px] font-black leading-none tracking-tight text-emerald-400 tabular-nums">
            <motion.span>{display}</motion.span>
            <span className="text-emerald-400/60">{suffix}</span>
        </p>
    );
}

function StatItem({ stat, index }: { stat: (typeof STATS)[0]; index: number }) {
    const Icon = stat.icon;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex flex-col items-center text-center px-6 py-8 lg:py-0"
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 mb-5">
                <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
            </div>

            <StatNumber 
                value={stat.value} 
                suffix={stat.suffix} 
                isDecimal={stat.isDecimal} 
                delay={0.2 + index * 0.1}
            />

            <p className="mt-3 text-[14px] font-bold text-white tracking-tight">
                {stat.label}
            </p>
            <p className="mt-1 text-[12px] font-medium text-white/35">
                {stat.description}
            </p>
        </motion.div>
    );
}

// ─── SVG clip-path for the organic "blob card" shape ──────────────────────────
// Top-right notch + bottom-left notch, rest is smoothly rounded
const BLOB_CLIP_ID = 'stats-blob-clip';

function BlobClipDef() {
    return (
        <svg width="0" height="0" className="absolute">
            <defs>
                <clipPath id={BLOB_CLIP_ID} clipPathUnits="objectBoundingBox">
                    {/* 
                        Organic shape with:
                        - Rounded top-left corner
                        - A concave notch on the top-right
                        - Rounded bottom-right corner
                        - A concave notch on the bottom-left
                        All transitions are smooth cubic beziers.
                    */}
                    <path d="
                        M 0.03,0
                        L 0.72,0
                        C 0.74,0 0.75,0.01 0.75,0.03
                        L 0.75,0.06
                        C 0.75,0.10 0.78,0.13 0.82,0.13
                        L 0.97,0.13
                        C 0.99,0.13 1,0.14 1,0.16
                        L 1,0.97
                        C 1,0.99 0.99,1 0.97,1
                        L 0.28,1
                        C 0.26,1 0.25,0.99 0.25,0.97
                        L 0.25,0.94
                        C 0.25,0.90 0.22,0.87 0.18,0.87
                        L 0.03,0.87
                        C 0.01,0.87 0,0.86 0,0.84
                        L 0,0.03
                        C 0,0.01 0.01,0 0.03,0
                        Z
                    " />
                </clipPath>
            </defs>
        </svg>
    );
}

// ─── Shared inner content ─────────────────────────────────────────────────────
function StatsSectionInner() {
    return (
        <>
            {/* Background glow effects */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.12 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
            />
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.12 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
            />

            {/* Decorative dot grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(52,211,153,0.4) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Header */}
            <div className="relative z-10 text-center mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                            Nos résultats
                        </span>
                    </div>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    id="stats-heading"
                    className="text-3xl font-black tracking-tight text-white leading-tight lg:text-4xl"
                >
                    AutoLoc en <span className="text-emerald-400">chiffres</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-3 mx-auto max-w-md text-[14px] font-medium leading-relaxed text-white/40"
                >
                    La confiance de toute une communauté, en quelques chiffres qui parlent d&apos;eux-mêmes.
                </motion.p>
            </div>

            {/* Stats grid */}
            <div className="relative z-10 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
                {STATS.map((stat, i) => (
                    <StatItem key={stat.label} stat={stat} index={i} />
                ))}
            </div>
        </>
    );
}

export function StatsSection(): React.ReactElement {
    return (
        <section className="px-4 py-6 lg:px-8" aria-labelledby="stats-heading">
            <div className="mx-auto max-w-7xl">

                {/* ── MOBILE : forme octogone (coins coupés diagonalement) ── */}
                <div
                    className="lg:hidden relative overflow-hidden py-14 px-6"
                    style={{
                        background: '#000000',
                        clipPath: 'polygon(24px 0%, calc(100% - 24px) 0%, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0% calc(100% - 24px), 0% 24px)',
                        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
                    }}
                >
                    {/* Accent corners */}
                    <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
                        style={{ background: 'linear-gradient(315deg, rgba(52,211,153,0.10) 0%, transparent 60%)' }} />
                    <StatsSectionInner />
                </div>

                {/* ── DESKTOP : forme blob (SVG clip-path) ── */}
                <div className="hidden lg:block">
                    <BlobClipDef />
                    <div
                        className="relative overflow-hidden py-20 px-16"
                        style={{
                            clipPath: `url(#${BLOB_CLIP_ID})`,
                            background: '#000000',
                            filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.45))',
                        }}
                    >
                        {/* Border overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                clipPath: `url(#${BLOB_CLIP_ID})`,
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        />
                        <StatsSectionInner />
                    </div>
                </div>

            </div>
        </section>
    );
}
