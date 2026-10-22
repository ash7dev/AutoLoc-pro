'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { COMMISSION_RATE, formatCurrency, type TenantQuote } from '@/lib/utils';

interface BookingPriceBreakdownCardProps {
  quote: TenantQuote;
  typeLivraison: 'AUCUNE' | 'DAKAR' | 'AIBD';
}

export function BookingPriceBreakdownCard({ quote, typeLivraison }: BookingPriceBreakdownCardProps) {
  const { nbJours } = quote;
  const grandTotal = quote.total;
  const tauxPct = Math.round(COMMISSION_RATE * 100);

  return (
    <div className="bg-brand-main border border-brand-main/80 rounded-3xl p-6 text-champagne shadow-xl shadow-slate-950/10 space-y-5">
      <div className="flex items-center justify-between border-b border-champagne/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-champagne/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-champagne" />
          </div>
          <div>
            <h4 
              className="text-base font-fraunces font-normal text-champagne tracking-tight"
            >
              Détail du tarif
            </h4>
            <p className="text-xs text-champagne/75">Transparence totale AutoLoc</p>
          </div>
        </div>
        <span className="text-xs font-bold text-champagne bg-white/10 px-2.5 py-1 rounded-full border border-champagne/20">
          {nbJours} jour{nbJours > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 text-sm text-champagne/85">
        <div className="flex items-center justify-between gap-3">
          <span>
            Location ({formatCurrency(quote.prixParJour)} FCFA × {nbJours} jour{nbJours > 1 ? 's' : ''})
          </span>
          <span className="font-semibold text-champagne tabular-nums">{formatCurrency(quote.location)} FCFA</span>
        </div>

        {quote.horsDakar && (
          <div className="flex items-center justify-between gap-3">
            <span>
              Hors Dakar ({formatCurrency(quote.horsDakar.prixParJour)} FCFA × {quote.horsDakar.nbJours} j)
            </span>
            <span className="font-semibold text-champagne tabular-nums">+{formatCurrency(quote.horsDakar.montant)} FCFA</span>
          </div>
        )}

        {quote.chauffeur && (
          <div className="flex items-center justify-between gap-3">
            <span>
              Chauffeur ({formatCurrency(quote.chauffeur.prixParJour)} FCFA × {quote.chauffeur.nbJours} j)
            </span>
            <span className="font-semibold text-champagne tabular-nums">+{formatCurrency(quote.chauffeur.montant)} FCFA</span>
          </div>
        )}

        {quote.livraison > 0 && (
          <div className="flex items-center justify-between gap-3">
            <span>Livraison ({typeLivraison === 'AIBD' ? 'Aéroport AIBD' : 'Dakar Métropole'})</span>
            <span className="font-semibold text-champagne tabular-nums">+{formatCurrency(quote.livraison)} FCFA</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <span>Frais de service AutoLoc ({tauxPct} % de la location)</span>
          <span className="font-semibold text-champagne tabular-nums">+{formatCurrency(quote.fraisService)} FCFA</span>
        </div>
      </div>

      <div className="pt-4 border-t border-champagne/20 flex items-baseline justify-between">
        <div>
          <p className="text-xs text-champagne/75 uppercase tracking-wider font-semibold">
            Total Général
          </p>
          <p className="text-xs text-champagne/60">Toutes taxes & assurance incluses</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-display font-extrabold text-champagne tabular-nums leading-none">
            {formatCurrency(grandTotal)}
            <span className="ml-1.5 text-sm font-sans text-champagne/80 font-normal">
              FCFA
            </span>
          </p>
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2 text-xs text-champagne/80 bg-white/5 p-3 rounded-2xl border border-champagne/10">
        <ShieldCheck className="w-4 h-4 text-champagne shrink-0" />
        <span>Couverture Assurance tous risques et assistance 24/7 offertes.</span>
      </div>
    </div>
  );
}
