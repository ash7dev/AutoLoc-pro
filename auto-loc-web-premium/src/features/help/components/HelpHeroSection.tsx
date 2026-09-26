'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const HelpHeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-dark text-white shadow-xl">
      {/* Halos */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-emerald-400/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-champagne/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-main/40 via-transparent to-transparent" />

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-champagne transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
          Retour à l&apos;accueil
        </Link>

        <div className="max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-champagne/20 bg-champagne/8 px-4 py-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-champagne" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-champagne">
              Centre d&apos;aide
            </span>
          </div>

          <h1 className="font-fraunces text-3xl font-normal leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Comment pouvons-nous{' '}
            <span className="bg-gradient-to-r from-[#4ADE80] to-champagne bg-clip-text text-transparent">
              vous aider ?
            </span>
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            Trouvez des réponses rapides à vos questions sur la location de véhicules, les paiements, l&apos;assurance et bien plus encore.
          </p>
        </div>
      </div>
    </section>
  );
};
