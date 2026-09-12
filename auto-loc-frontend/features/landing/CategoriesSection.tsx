'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Sparkles, Gem, Truck, Zap, Package, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'suv',
    title: 'SUV & 4×4',
    subtitle: 'Spacieux, tout-terrain & robustes',
    badge: 'Populaire',
    icon: Shield,
    href: '/explorer?type=SUV',
    gradient: 'from-emerald-950/90 via-slate-900/90 to-slate-950',
    accentColor: 'text-emerald-400',
    borderColor: 'group-hover:border-emerald-500/40',
  },
  {
    id: 'berline',
    title: 'Berlines Prestige',
    subtitle: 'Confort VIP & élégance urbaine',
    badge: 'Confort',
    icon: Sparkles,
    href: '/explorer?type=BERLINE',
    gradient: 'from-slate-900/95 via-slate-900/90 to-slate-950',
    accentColor: 'text-amber-400',
    borderColor: 'group-hover:border-amber-400/40',
  },
  {
    id: 'luxe',
    title: 'Luxe & VIP',
    subtitle: 'Véhicules d\'exception & cérémonies',
    badge: 'Haut de gamme',
    icon: Gem,
    href: '/explorer?type=LUXE',
    gradient: 'from-purple-950/80 via-slate-900/90 to-slate-950',
    accentColor: 'text-purple-400',
    borderColor: 'group-hover:border-purple-400/40',
  },
  {
    id: 'pickup',
    title: 'Pick-ups',
    subtitle: 'Capacité de chargement & pistes',
    badge: 'Aventure',
    icon: Truck,
    href: '/explorer?type=PICKUP',
    gradient: 'from-amber-950/80 via-slate-900/90 to-slate-950',
    accentColor: 'text-amber-500',
    borderColor: 'group-hover:border-amber-500/40',
  },
  {
    id: 'citadine',
    title: 'Citadines Éco',
    subtitle: 'Agiles en ville & économes',
    badge: 'Accessible',
    icon: Zap,
    href: '/explorer?type=CITADINE',
    gradient: 'from-blue-950/80 via-slate-900/90 to-slate-950',
    accentColor: 'text-blue-400',
    borderColor: 'group-hover:border-blue-400/40',
  },
  {
    id: 'utilitaire',
    title: 'Utilitaires',
    subtitle: 'Grands volumes & déménagements',
    badge: 'Pratique',
    icon: Package,
    href: '/explorer?type=UTILITAIRE',
    gradient: 'from-slate-900 via-slate-900/95 to-slate-950',
    accentColor: 'text-emerald-400',
    borderColor: 'group-hover:border-emerald-400/40',
  },
];

export function CategoriesSection(): React.ReactElement {
  return (
    <section className="px-4 py-16 lg:px-8 lg:py-24 bg-slate-950 text-white relative overflow-hidden" aria-labelledby="categories-heading">
      {/* Ambient Radial Background Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-15 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
      />

      <div className="mx-auto max-w-7xl relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-400">
                COLLECTION AUTOLOC
              </span>
            </div>

            <h2 id="categories-heading" className="text-[32px] lg:text-[48px] font-bold text-white tracking-tight leading-tight font-editorial">
              Parcourez par <span className="italic font-normal text-emerald-400">catégorie de véhicule</span>
            </h2>

            <p className="max-w-xl text-[14.5px] text-white/50 font-medium leading-relaxed">
              Des SUV de luxe aux berlines confortables, trouvez le véhicule parfaitement adapté à votre séjour ou déplacement au Sénégal.
            </p>
          </div>

          <Link
            href="/explorer"
            className="inline-flex items-center gap-2.5 rounded-full px-6 py-3 bg-white/10 border border-white/15 text-white text-[13px] font-bold hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all duration-300 shadow-lg shrink-0 self-start lg:self-auto"
          >
            <span>Voir toute la flotte</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Categories Grid (2×3 on Desktop, 1 on Mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={cat.href}
                  className={`group relative flex flex-col justify-between p-7 lg:p-8 rounded-3xl min-h-[220px] bg-gradient-to-br ${cat.gradient} border border-white/10 ${cat.borderColor} shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden`}
                >
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                      <Icon className={`h-6 w-6 ${cat.accentColor}`} strokeWidth={2} />
                    </div>
                    <span className="px-3 py-1 rounded-full badge-glass text-[9.5px] font-extrabold uppercase tracking-widest text-white/70">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1.5 z-10">
                    <h3 className="text-[22px] lg:text-[24px] font-bold text-white font-editorial tracking-tight group-hover:text-emerald-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[12.5px] text-white/50 font-medium">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action Arrow */}
                  <div className="pt-4 flex items-center gap-2 text-[12px] font-bold text-emerald-400 group-hover:translate-x-1 transition-transform duration-300 z-10">
                    <span>Explorer les véhicules</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
