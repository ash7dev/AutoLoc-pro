'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────
const ZONES = [
    { slug: 'almadies-ngor-mamelles',      name: 'Almadies – Ngor',       subtitle: 'Quartier premium',   highlight: true  },
    { slug: 'ouakam-yoff',                 name: 'Ouakam – Yoff',         subtitle: 'Proche aéroport',    highlight: false },
    { slug: 'mermoz-sacrecoeur-ckg',       name: 'Mermoz – Sacré-Cœur',   subtitle: 'Centre d\'affaires', highlight: true  },
    { slug: 'plateau-medina-gueuletapee',  name: 'Plateau – Médina',      subtitle: 'Centre historique',  highlight: false },
    { slug: 'liberte-sicap-granddakar',    name: 'Liberté – Sicap',       subtitle: 'Résidentiel',        highlight: false },
    { slug: 'parcelles-grandyoff',         name: 'Parcelles Assainies',   subtitle: 'Grand Yoff',         highlight: false },
    { slug: 'pikine-guediawaye',           name: 'Pikine – Guédiawaye',   subtitle: 'Banlieue nord',      highlight: false },
    { slug: 'keurmassar-rufisque',         name: 'Keur Massar – Rufisque',subtitle: 'Banlieue est',       highlight: false },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function ZonesSection(): React.ReactElement {
    return (
        <section className="px-4 py-8 lg:px-8" aria-labelledby="zones-heading">
            <div className="mx-auto max-w-7xl">
                <div 
                    className={cn(
                        "relative overflow-hidden bg-black px-6 py-12 md:px-8 md:py-16 lg:px-16 lg:py-20",
                        "transition-all duration-500",
                        // Mobile: Large radius on opposing corners | Desktop: Standard large radius
                        "rounded-tl-[80px] rounded-br-[80px] rounded-tr-[2rem] rounded-bl-[2rem] lg:rounded-[4rem]",
                        "border border-white/10"
                    )}
                >
                    {/* Inner border glow for the custom shape */}
                    <div className="absolute inset-0 pointer-events-none rounded-tl-[80px] rounded-br-[80px] rounded-tr-[2rem] rounded-bl-[2rem] lg:rounded-[4rem] border border-emerald-400/5 group-hover:border-emerald-400/20 transition-colors duration-500" />

                    {/* Background glow */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.08 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5 }}
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                    />

                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 mb-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-5">
                            <MapPin className="h-3 w-3 text-emerald-400" strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                Zones de couverture
                            </span>
                        </div>
                        <h2
                            id="zones-heading"
                            className="text-3xl font-black tracking-tight text-white leading-tight lg:text-4xl"
                        >
                            Disponible près de <span className="text-emerald-400">chez vous</span>
                        </h2>
                        <p className="mt-3 mx-auto max-w-md text-[14px] font-medium leading-relaxed text-white/40">
                            Des véhicules dans tous les quartiers de Dakar et ses environs.
                        </p>
                    </motion.div>

                    {/* Grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {ZONES.map((zone, i) => (
                            <motion.div
                                key={zone.slug}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                            >
                                <Link
                                    href={`/explorer?zone=${zone.slug}`}
                                    className={cn(
                                        'group relative flex flex-col rounded-xl p-4 overflow-hidden h-full',
                                        'border transition-all duration-300',
                                        zone.highlight
                                            ? 'bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40'
                                            : 'bg-white/5 border-white/8 hover:border-white/20',
                                        'hover:bg-white/10 hover:-translate-y-1',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-bold text-white tracking-tight truncate">
                                                {zone.name}
                                            </p>
                                            <p className="text-[11px] font-medium text-white/30 mt-0.5">
                                                {zone.subtitle}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-0.5" strokeWidth={2} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
