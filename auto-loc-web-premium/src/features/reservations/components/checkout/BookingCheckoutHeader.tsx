'use client';

import React from 'react';
import { ArrowLeft, X, ShieldCheck } from 'lucide-react';

interface BookingCheckoutHeaderProps {
  step: 1 | 2;
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export function BookingCheckoutHeader({
  step,
  title,
  onBack,
  onClose,
}: BookingCheckoutHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 sm:px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 flex items-center justify-between gap-4">
      {/* Bouton Retour */}
      <button
        type="button"
        onClick={onBack}
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        aria-label={step === 2 ? 'Retour à l’étape 1' : 'Fermer'}
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" strokeWidth={2} />
      </button>

      {/* Titre central et badge étape */}
      <div className="flex-1 text-center min-w-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0A3D2E]/10 border border-[#0A3D2E]/20 text-[#0A3D2E] text-[11px] font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0A3D2E]" />
          <span>Étape {step} sur 2</span>
        </div>
        <h2 
          className="text-lg sm:text-xl font-fraunces font-normal text-[#041912] tracking-tight truncate"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          {title}
        </h2>
      </div>

      {/* Bouton Fermer */}
      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        aria-label="Fermer la fenêtre"
      >
        <X className="w-5 h-5 text-slate-700" strokeWidth={2} />
      </button>
    </header>
  );
}
