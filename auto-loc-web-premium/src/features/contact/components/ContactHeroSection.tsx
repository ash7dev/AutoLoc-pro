'use client';

import React from 'react';
import { Headphones } from 'lucide-react';

export const ContactHeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#041912] text-white shadow-xl">
      {/* Halo décoratif */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#4ADE80]/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#F1DFB6]/5 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0A3D2E]/40 via-transparent to-transparent" />

      <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A3D2E] ring-4 ring-[#F1DFB6]/10 mx-auto shadow-lg">
            <Headphones className="h-7 w-7 text-[#F1DFB6]" />
          </div>

          <h1 className="font-fraunces text-3xl font-normal leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Comment pouvons-nous{' '}
            <span className="bg-gradient-to-r from-[#4ADE80] to-[#F1DFB6] bg-clip-text text-transparent">
              vous aider ?
            </span>
          </h1>

          <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/65 sm:text-base">
            Notre équipe basée à Dakar est disponible 7j/7 pour répondre à toutes vos questions concernant la location, l'assurance ou votre compte AutoLoc.
          </p>
        </div>
      </div>
    </section>
  );
};
