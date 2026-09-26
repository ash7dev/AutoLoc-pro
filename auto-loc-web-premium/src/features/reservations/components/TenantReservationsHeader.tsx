'use client';

import React from 'react';
import { CalendarCheck, ShieldCheck, Clock, Headphones } from 'lucide-react';

interface TenantReservationsHeaderProps {
  totalCount?: number;
  activeCount?: number;
}

export function TenantReservationsHeader({
  totalCount = 0,
  activeCount = 0,
}: TenantReservationsHeaderProps) {
  return (
    <header className="relative space-y-6">
      {/* Badge Locations en cours (si présent) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-main text-champagne text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeCount} location{activeCount > 1 ? 's' : ''} en cours
          </span>
        </div>
      )}

      {/* Titre Principal avec Typographie Cormorant Garamond */}
      <div className="space-y-2">
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.01em] text-brand-dark leading-[1.1]"
          style={{ fontFamily: 'var(--font-cormorant), var(--font-playfair), Georgia, serif' }}
        >
          Mes{' '}
          <span className="font-normal italic bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
            Réservations.
          </span>
        </h1>

        <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium max-w-xl leading-relaxed">
          Suivez et gérez vos réservations en temps réel.
        </p>
      </div>

      {/* Badges de Réassurance Premium : Disposition Triangulaire sur Mobile, Ligne horizontale sur Desktop */}
      {/* 1. Rendu Desktop (>= 640px) */}
      <div className="hidden sm:flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-brand-dark">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Assurance Tous Risques Incluse</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-800">
          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Suivi & Confirmations Instantanés</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-800">
          <Headphones className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Support Client Dakar 24/7</span>
        </div>
      </div>

      {/* 2. Rendu Mobile en Forme de Triangle (< 640px) */}
      <div className="flex sm:hidden flex-col items-center gap-2.5 pt-1 text-[11px] font-semibold text-slate-800 w-full">
        {/* Sommet du triangle : 2 badges côte à côte (Base haute) */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs text-center min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Assurance Tous Risques</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs text-center min-w-0">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Suivi Instantané</span>
          </div>
        </div>

        {/* Pointe du triangle : 1 badge centré en dessous */}
        <div className="flex justify-center w-full">
          <div className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs text-center max-w-[90%]">
            <Headphones className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Support Client Dakar 24/7</span>
          </div>
        </div>
      </div>
    </header>
  );
}
