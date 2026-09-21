'use client';

import React from 'react';
import Image from 'next/image';
import {
  Wallet,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Truck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantFinancialDetailsCardProps {
  booking: TenantReservationDetailData;
}

export const TenantFinancialDetailsCard: React.FC<TenantFinancialDetailsCardProps> = ({ booking }) => {
  const nbJours = Math.max(1, Number(booking.nbJours || 1));
  const prixParJour = Number(booking.prixParJour || 0);
  const totalLoc = Number(booking.prixTotal || 0);

  const isDepositMode = booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
  
  // Calculs acompte et solde
  const paidOnline = Number(
    booking.montantPayeEnLigne ?? booking.paiement?.montant ?? (isDepositMode ? Math.round(totalLoc * 0.3) : totalLoc)
  );
  const soldeCheckin = isDepositMode
    ? Number(booking.montantSoldeCheckin ?? Math.max(0, totalLoc - paidOnline))
    : 0;

  const fraisLivraison = Number(booking.fraisLivraison || 0);
  const typeLivraison = booking.typeLivraison;
  const deliveryLabel = typeLivraison === 'AIBD'
    ? 'Livraison Aéroport AIBD'
    : typeLivraison === 'DAKAR' || booking.adresseLivraison
    ? 'Livraison Dakar (Ville)'
    : null;

  // Calcul prix base location hors frais annexe
  const totalBaseRental = prixParJour * nbJours;

  // Information paiement (Wave, Orange Money, etc.)
  const paymentProvider = booking.paiement?.fournisseur?.toUpperCase();
  const providerLabel = paymentProvider === 'WAVE'
    ? 'Wave'
    : paymentProvider === 'ORANGE_MONEY'
    ? 'Orange Money'
    : paymentProvider === 'INTOUCH'
    ? 'InTouch'
    : paymentProvider || null;

  const providerLogo = paymentProvider === 'WAVE'
    ? '/wavelogo.jpeg'
    : paymentProvider === 'ORANGE_MONEY'
    ? '/orangeMoneylogo.jpg'
    : null;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5 text-[#041912]">
      {/* En-tête : Badge Icône Sombre + Titre Fraunces + Currency Pill */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#041912] text-[#4ADE80] border border-[#4ADE80]/30 flex items-center justify-center shrink-0 shadow-xs">
            <Receipt className="w-5 h-5 text-[#4ADE80]" />
          </div>
          <div>
            <h3 className="font-fraunces text-xl text-[#041912] font-normal tracking-tight">
              Détails financiers
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Transparence complète des tarifs et des acomptes réglés
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {providerLabel && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
              {providerLogo && (
                <Image
                  src={providerLogo}
                  alt={providerLabel}
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span>{providerLabel}</span>
            </div>
          )}
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] font-extrabold text-[11px] uppercase tracking-wide">
            FCFA (XOF)
          </span>
        </div>
      </div>

      {/* Lignes de Détails des Frais */}
      <div className="space-y-3 text-xs font-medium">
        {/* Ligne 1 : Location de base */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">
            Location ({nbJours} jour{nbJours > 1 ? 's' : ''} × {formatCurrency(prixParJour)})
          </span>
          <span className="font-bold text-[#041912] tabular-nums">
            {formatCurrency(totalBaseRental || totalLoc)}
          </span>
        </div>

        {/* Ligne 2 : Livraison (si applicable) */}
        {deliveryLabel && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              {deliveryLabel}
            </span>
            <span className="font-bold text-[#041912] tabular-nums">
              {fraisLivraison > 0 ? formatCurrency(fraisLivraison) : 'Inclus'}
            </span>
          </div>
        )}

        {/* Ligne 3 : Option Hors Dakar (si cochée) */}
        {booking.horsDakar && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              Option déplacement Hors Dakar
            </span>
            <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
              Inclus dans l’accord
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-4">
          <span className="font-bold text-sm text-[#041912]">Total de la location</span>
          <span className="font-fraunces text-2xl font-semibold text-[#041912] tabular-nums tracking-tight">
            {formatCurrency(totalLoc)}
          </span>
        </div>
      </div>

      {/* Module Acompte 30% / Solde 70% Dark Obsidian (Standard Mobile) */}
      <div className="bg-[#041912] border border-[#4ADE80]/30 rounded-2xl p-4 sm:p-5 text-white space-y-4 shadow-md relative overflow-hidden">
        {/* Glow ambient de fond */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ADE80]/10 rounded-full blur-2xl pointer-events-none" />

        {/* En-tête Acompte */}
        <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] flex items-center justify-center shrink-0">
              <CreditCard className="w-4.5 h-4.5 text-[#4ADE80]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {isDepositMode ? 'Acompte réglé en ligne' : 'Montant 100% réglé en ligne'}
              </p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {isDepositMode ? '30% payés à la réservation' : 'Paiement intégral sécurisé'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-fraunces text-xl font-bold text-[#4ADE80] tabular-nums">
              {formatCurrency(paidOnline)}
            </span>
          </div>
        </div>

        {/* Barre de Progression Visuelle 30% / 70% */}
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative z-10">
          <div
            className="h-full bg-[#4ADE80] rounded-full transition-all duration-500"
            style={{ width: isDepositMode ? '30%' : '100%' }}
          />
        </div>

        {/* Pied Solde au Check-in (si acompte 30%) */}
        {isDepositMode && soldeCheckin > 0 && (
          <div className="flex items-center justify-between gap-4 pt-1 text-xs relative z-10">
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
              <span>Solde dû à la remise des clés (70%)</span>
            </div>
            <span className="font-bold text-white tabular-nums">
              {formatCurrency(soldeCheckin)}
            </span>
          </div>
        )}

        {/* Garantie & Sécurité */}
        <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-200 font-medium relative z-10">
          <ShieldCheck className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isDepositMode
              ? 'L’acompte de 30% est conservé sous séquestre par AutoLoc. Le solde de 70% est remis à l’hôte lors du check-in.'
              : 'Votre règlement est protégé et tracé par la garantie AutoLoc jusqu’à la prise en charge.'}
          </p>
        </div>
      </div>
    </div>
  );
};
