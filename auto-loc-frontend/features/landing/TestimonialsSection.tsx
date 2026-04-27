'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Mamadou Diallo',
        role: 'Entrepreneur',
        city: 'Dakar',
        comment: "Service incroyable ! J'ai trouvé un SUV vérifié en 5 minutes. Le propriétaire était ponctuel et très pro.",
        avatar: 'MD',
        variant: 'black'
    },
    {
        id: 2,
        name: 'Aïssatou Ndiaye',
        role: 'Consultante',
        city: 'Cité keur gorgui',
        comment: 'Première location, zéro stress. L\'application est fluide, le véhicule était nickel. Je recommande !',
        avatar: 'AN',
        variant: 'white'
    },
    {
        id: 3,
        name: 'Ousmane Sow',
        role: 'Ingénieur',
        city: 'Dakar',
        comment: 'J\'ai loué une berline pour un mariage. Véhicule impeccable, prix juste. Bravo AutoLoc !',
        avatar: 'OS',
        variant: 'black'
    },
    {
        id: 4,
        name: 'Fatou Sarr',
        role: 'Médecin',
        city: 'Dakar plateau',
        comment: 'Très pratique pour mes déplacements pro. Large choix de véhicules et des propriétaires fiables.',
        avatar: 'FS',
        variant: 'white'
    },
];

// ─── Components ──────────────────────────────────────────────────────────────

function StarRating() {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-emerald-400 text-emerald-400" strokeWidth={0} />
            ))}
        </div>
    );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function TestimonialsSection(): React.ReactElement {
    return (
        <section className="px-4 py-24 lg:px-8 lg:py-32 bg-white" aria-labelledby="testimonials-heading">
            <div className="mx-auto max-w-7xl">

                {/* Header Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-1.5 mb-6">
                            <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" strokeWidth={0} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                La communauté AutoLoc
                            </span>
                        </div>
                        <h2 id="testimonials-heading" className="text-[32px] lg:text-[48px] font-black tracking-tight text-slate-900 leading-tight">
                            Ils nous font <span className="text-emerald-500 italic">confiance</span>
                        </h2>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                                ))}
                            </div>
                            <p className="text-[14px] font-bold text-slate-400">
                                <span className="text-slate-900">+30 avis</span> certifiés au Sénégal
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Testimonials Grid (Mixed Design) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {TESTIMONIALS.map((t, i) => {
                        const isBlack = t.variant === 'black';

                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: i * 0.1 }}
                                className={cn(
                                    "group relative p-8 flex flex-col h-full transition-all duration-500",
                                    isBlack
                                        ? "bg-black text-white shadow-2xl shadow-emerald-500/5"
                                        : "bg-slate-50 text-slate-900 border border-slate-100 group-hover:border-emerald-500/20 shadow-sm",
                                    // Portal Shape
                                    isBlack
                                        ? "rounded-tr-[4rem] rounded-bl-[4rem]"
                                        : "rounded-tl-[4rem] rounded-br-[4rem]"
                                )}
                                style={{
                                    clipPath: isBlack
                                        ? 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)'
                                        : 'polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)'
                                }}
                            >
                                {/* Quote Icon */}
                                <Quote className={cn(
                                    "absolute top-6 right-6 w-10 h-10 opacity-10",
                                    isBlack ? "text-emerald-400" : "text-emerald-600"
                                )} />

                                <div className="mb-6">
                                    <StarRating />
                                </div>

                                <p className={cn(
                                    "text-[15px] font-medium leading-relaxed italic mb-8",
                                    isBlack ? "text-white/60" : "text-slate-500"
                                )}>
                                    &ldquo;{t.comment}&rdquo;
                                </p>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black",
                                        isBlack ? "bg-emerald-400 text-black" : "bg-emerald-500 text-white"
                                    )}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className={cn("text-[14px] font-black", isBlack ? "text-white" : "text-slate-900")}>
                                            {t.name}
                                        </h4>
                                        <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                                            {t.city}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Section Trust */}
                <div className="mt-20 p-12 bg-black text-white relative overflow-hidden rounded-[4rem]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 blur-[100px]" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl lg:text-3xl font-black mb-4 tracking-tight">Convaincu par l&apos;expérience ?</h3>
                            <p className="text-white/40 font-medium">Rejoignez des milliers de Sénégalais qui ont choisi la simplicité.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link 
                                href="/explorer"
                                className="bg-emerald-500 text-black px-10 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                Réserver maintenant
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
