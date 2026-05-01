'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Headphones, Star, CheckCircle2 } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        tab: '01',
        label: 'Vérification',
        title: 'Véhicules vérifiés',
        description:
            "Chaque véhicule est inspecté et validé par notre équipe avant d'être listé. Documents, état mécanique, photos — tout est contrôlé.",
        highlights: ['Inspection complète', 'Documents validés', 'Photos certifiées'],
    },
    {
        icon: CreditCard,
        tab: '02',
        label: 'Paiement',
        title: 'Paiement sécurisé',
        description:
            "Vos transactions sont protégées par un système de paiement chiffré. L'argent est sécurisé jusqu'à la fin de la location.",
        highlights: ['Chiffrement SSL', 'Séquestre sécurisé', 'Remboursement garanti'],
    },
    {
        icon: Headphones,
        tab: '03',
        label: 'Support',
        title: 'Assistance 24/7',
        description:
            "Une équipe disponible jour et nuit pour vous accompagner. En cas de problème, on est là — par téléphone, WhatsApp ou email.",
        highlights: ['Disponible 24h/24', 'WhatsApp & téléphone', 'Réponse < 5 min'],
    },
    {
        icon: Star,
        tab: '04',
        label: 'Confiance',
        title: 'Avis certifiés',
        description:
            "Chaque location génère un avis authentique. Louez en confiance grâce à notre système de notation bidirectionnel.",
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
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-4 py-1.5 mb-5">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Confiance &amp; sécurité
                            </span>
                        </div>
                        <h2
                            id="trust-heading"
                            className="text-[32px] lg:text-[48px] font-black tracking-tight text-black leading-tight"
                        >
                            Pourquoi{' '}
                            <span className="text-emerald-400">AutoLoc</span> ?
                        </h2>
                        <p className="mt-4 mx-auto max-w-lg text-[15px] font-medium leading-relaxed text-black/40">
                            Votre sécurité et votre tranquillité d&apos;esprit sont notre priorité absolue.
                        </p>
                    </motion.div>
                </div>

                {/* Folder Cards Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {TRUST_ITEMS.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group flex flex-col"
                                style={{ filter: 'drop-shadow(0 8px 28px rgba(0,0,0,0.4))' }}
                            >
                                {/* ── Folder Tab ── */}
                                <div className="flex items-end h-9">
                                    {/* Active tab — sits above the card body */}
                                    <div className="relative flex items-center gap-1.5 px-4 pt-2 pb-0 rounded-t-xl bg-black border border-b-0 border-white/10 group-hover:border-emerald-400/30 transition-colors duration-300 shrink-0">
                                        {/* Coloured dot */}
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="text-[10px] font-black text-emerald-400 tabular-nums">
                                            {item.tab}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                            {item.label}
                                        </span>
                                    </div>
                                    {/* Flat spacer that becomes the right border of the tab row */}
                                    <div className="flex-1 border-b border-white/10 group-hover:border-emerald-400/20 transition-colors duration-300" />
                                </div>

                                {/* ── Card Body ── */}
                                <div className="relative flex flex-col flex-1 rounded-b-2xl rounded-tr-2xl bg-black border border-t-0 border-white/10 p-6 overflow-hidden transition-all duration-300 group-hover:border-emerald-400/25">

                                    {/* Ambient glow on hover */}
                                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 blur-2xl pointer-events-none transition-opacity duration-500 bg-emerald-400" />

                                    {/* Icon badge */}
                                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-5 group-hover:bg-emerald-400/15 transition-colors duration-300">
                                        <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.75} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-[20px] font-black tracking-tight text-white mb-2">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-[12.5px] font-medium leading-relaxed text-white/40 mb-5 flex-1">
                                        {item.description}
                                    </p>

                                    {/* Divider */}
                                    <div className="w-full h-px bg-white/5 mb-4" />

                                    {/* Highlights */}
                                    <ul className="space-y-2">
                                        {item.highlights.map((h) => (
                                            <li
                                                key={h}
                                                className="flex items-center gap-2 text-[11.5px] font-semibold text-white/50"
                                            >
                                                <CheckCircle2
                                                    className="h-3.5 w-3.5 text-emerald-400/50 flex-shrink-0"
                                                    strokeWidth={2}
                                                />
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
