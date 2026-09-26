'use client';

import React from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight } from 'lucide-react';
import { useUserStore } from '@/src/core/store/useUserStore';

export function TenantUnauthenticatedState() {
  const openGuestModal = useUserStore((s) => s.openGuestModal);

  const handleLoginClick = () => {
    openGuestModal('Connectez-vous pour consulter et gérer vos réservations.');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm text-center">
      <div className="max-w-md mx-auto space-y-4">
        {/* Icône compacte */}
        <div className="w-14 h-14 rounded-2xl bg-brand-main text-champagne flex items-center justify-center mx-auto shadow-md shadow-brand-main/15">
          <KeyRound className="w-7 h-7 text-champagne" strokeWidth={1.5} />
        </div>

        {/* Titre & Sous-titre direct sans long discours */}
        <div className="space-y-1">
          <h2
            className="text-2xl sm:text-3xl font-light tracking-tight text-brand-dark"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            Consultez vos réservations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Connectez-vous pour voir vos contrats et suivre vos trajets.
          </p>
        </div>

        {/* Actions compactes et directes */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleLoginClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-main text-champagne font-bold text-xs sm:text-sm shadow-md hover:bg-forest-700 transition-all cursor-pointer"
          >
            <span>Se connecter</span>
            <ArrowRight className="w-4 h-4 text-champagne" />
          </button>

          <Link
            href="/vehicles"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
          >
            Explorer les véhicules
          </Link>
        </div>
      </div>
    </div>
  );
}
