'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const PrivacyHeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#041912] text-white shadow-xl">
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#4ADE80]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[#F1DFB6]/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0A3D2E]/40 via-transparent to-transparent" />

      <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        {/* Retour */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/40 hover:text-[#F1DFB6] transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
          Retour à l&apos;accueil
        </Link>

        <div className="max-w-2xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F1DFB6]/20 bg-[#F1DFB6]/8 px-4 py-1.5">
            <Lock className="h-3.5 w-3.5 text-[#F1DFB6]" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F1DFB6]">
              Protection des données
            </span>
          </div>

          <h1
            className="font-fraunces text-3xl font-normal leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            Politique de{' '}
            <span className="bg-gradient-to-r from-[#4ADE80] to-[#F1DFB6] bg-clip-text text-transparent">
              Confidentialité
            </span>
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            Nous respectons votre vie privée. Cette page explique quelles données nous collectons, pourquoi, et comment vous gardez le contrôle.
          </p>

          <p className="text-[12px] text-white/25 font-medium" suppressHydrationWarning>
            Dernière mise à jour : 16 mars 2026 · Conforme RGPD &amp; législation sénégalaise
          </p>
        </div>
      </div>
    </section>
  );
};
