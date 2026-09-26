'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BookingPriceBreakdownCardProps {
  tenantPricePerDay: number;
  nbJours: number;
  typeLivraison: 'AUCUNE' | 'DAKAR' | 'AIBD';
  fraisLivraisonDakar?: number | null;
  fraisLivraisonAibd?: number | null;
  fraisLivraison?: number | null;
  isHorsDakarSelected: boolean;
  supplementHorsDakarParJour?: number | null;
}

export function BookingPriceBreakdownCard({
  tenantPricePerDay,
  nbJours,
  typeLivraison,
  fraisLivraisonDakar = 0,
  fraisLivraisonAibd = 0,
  fraisLivraison = 0,
  isHorsDakarSelected,
  supplementHorsDakarParJour = 0,
}: BookingPriceBreakdownCardProps) {
  const baseTotal = tenantPricePerDay * nbJours;

  let deliveryTotal = 0;
  if (typeLivraison === 'DAKAR') {
    deliveryTotal = Number(fraisLivraisonDakar ?? fraisLivraison ?? 0);
  } else if (typeLivraison === 'AIBD') {
    deliveryTotal = Number(fraisLivraisonAibd ?? 0);
  }

  const numHorsDakar = Number(supplementHorsDakarParJour ?? 0);
  const horsDakarTotal = isHorsDakarSelected ? numHorsDakar * nbJours : 0;

  const grandTotal = baseTotal + deliveryTotal + horsDakarTotal;

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
        <div className="flex items-center justify-between">
          <span>
            {formatCurrency(tenantPricePerDay)} FCFA × {nbJours} jour
            {nbJours > 1 ? 's' : ''}
          </span>
          <span className="font-semibold text-champagne tabular-nums">
            {formatCurrency(baseTotal)} FCFA
          </span>
        </div>

        {deliveryTotal > 0 && (
          <div className="flex items-center justify-between">
            <span>
              Frais de livraison (
              {typeLivraison === 'AIBD' ? 'Aéroport AIBD' : 'Dakar Métropole'})
            </span>
            <span className="font-semibold text-champagne tabular-nums">
              +{formatCurrency(deliveryTotal)} FCFA
            </span>
          </div>
        )}

        {horsDakarTotal > 0 && (
          <div className="flex items-center justify-between">
            <span>Trajets hors Dakar ({nbJours} j)</span>
            <span className="font-semibold text-champagne tabular-nums">
              +{formatCurrency(horsDakarTotal)} FCFA
            </span>
          </div>
        )}
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
