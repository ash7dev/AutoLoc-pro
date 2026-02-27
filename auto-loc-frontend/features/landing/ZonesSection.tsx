'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 },
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="px-4 py-8 lg:px-8"
            aria-labelledby="zones-heading"
        >
            <div className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-[2rem] bg-black border border-white/10 px-6 py-12 md:px-8 md:py-16 lg:px-16 lg:py-20">
                    {/* Background glow */}
                    <div
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-8 blur-[120px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
                    />

                    {/* Header */}
                    <div className="relative z-10 mb-12 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-5">
                            <MapPin className="h-3 w-3 text-emerald-400" strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                                Zones de couverture
                            </span>
                        </div>
                        <h2
                            id="zones-heading"
                            className="text-3xl font-black tracking-tight text-white leading-tight lg:text-4xl"
                        >
                            Disponible près de{' '}
                            <span className="text-emerald-400">chez vous</span>
                        </h2>
                        <p className="mt-3 mx-auto max-w-md text-[14px] font-medium leading-relaxed text-white/40">
                            Des véhicules dans tous les quartiers de Dakar et ses environs.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {ZONES.map((zone, i) => (
                            <Link
                                key={zone.slug}
                                href={`/explorer?zone=${zone.slug}`}
                                className={cn(
                                    'group relative flex flex-col rounded-xl p-4 overflow-hidden',
                                    'border transition-all duration-500',
                                    zone.highlight
                                        ? 'bg-emerald-400/10 border-emerald-400/20 hover:border-emerald-400/40'
                                        : 'bg-white/5 border-white/8 hover:border-white/20',
                                    'hover:bg-white/10 hover:-translate-y-0.5',
                                    isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4',
                                )}
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                {/* Zone info */}
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
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
