'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Headphones, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: 'Véhicules vérifiés',
        description:
            'Chaque véhicule est inspecté et validé par notre équipe avant d\'être listé. Documents, état mécanique, photos — tout est contrôlé.',
        highlights: ['Inspection complète', 'Documents validés', 'Photos certifiées'],
    },
    {
        icon: CreditCard,
        title: 'Paiement sécurisé',
        description:
            'Vos transactions sont protégées par un système de paiement chiffré. L\'argent est sécurisé jusqu\'à la fin de la location.',
        highlights: ['Chiffrement SSL', 'Séquestre sécurisé', 'Remboursement garanti'],
    },
    {
        icon: Headphones,
        title: 'Assistance 24/7',
        description:
            'Une équipe disponible jour et nuit pour vous accompagner. En cas de problème, on est là — par téléphone, WhatsApp ou email.',
        highlights: ['Disponible 24h/24', 'WhatsApp & téléphone', 'Temps de réponse < 5 min'],
    },
    {
        icon: Star,
        title: 'Avis certifiés',
        description:
            'Chaque location génère un avis authentique. Louez en confiance grâce à notre système de notation bidirectionnel.',
        highlights: ['Notation bidirectionnelle', 'Avis 100% authentiques', 'Profils vérifiés'],
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function TrustSection(): React.ReactElement {
    return (
        <section
            className="px-4 py-20 lg:px-8 lg:py-28"
            aria-labelledby="trust-heading"
        >
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-14 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Confiance & sécurité
                            </span>
                        </div>
                        <h2
                            id="trust-heading"
                            className="text-4xl font-black tracking-tight text-black leading-tight lg:text-5xl"
                        >
                            Pourquoi{' '}
                            <span className="text-emerald-400">AutoLoc</span> ?
                        </h2>
                        <p className="mt-4 mx-auto max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                            Votre sécurité et votre tranquillité d&apos;esprit sont notre priorité absolue.
                        </p>
                    </motion.div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {TRUST_ITEMS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={cn(
                                    'relative rounded-2xl bg-black border border-white/10 p-7 overflow-hidden',
                                    'transition-all duration-300 ease-out',
                                    'hover:border-emerald-400/25 hover:shadow-2xl hover:shadow-emerald-400/5',
                                )}
                            >
                                {/* Glow */}
                                <div
                                    className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-15 blur-3xl pointer-events-none"
                                    style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                                />

                                {/* Icon */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 mb-5">
                                    <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                                </div>

                                {/* Title */}
                                <h3 className="text-[17px] font-black tracking-tight text-white mb-2">
                                    {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-[13px] font-medium leading-relaxed text-white/45 mb-5">
                                    {item.description}
                                </p>

                                {/* Highlights */}
                                <ul className="space-y-2">
                                    {item.highlights.map((h) => (
                                        <li
                                            key={h}
                                            className="flex items-center gap-2 text-[12px] font-semibold text-emerald-400/70"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/50 flex-shrink-0" strokeWidth={2} />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
