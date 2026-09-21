'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Receipt, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantFinancialDetailsCardProps {
  booking: TenantReservationDetailData;
}

/* Ligne de type « ticket » : libellé ........ montant */
const Line: React.FC<{
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-end gap-2 text-[13px]">
    <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
      {icon && <span className="shrink-0 text-[#0A3D2E]/55">{icon}</span>}
      <span>{label}</span>
    </span>
    <span
      aria-hidden
      className="mb-[5px] min-w-3 flex-1 border-b border-dotted border-slate-300"
    />
    <span className="shrink-0 font-semibold tabular-nums text-slate-900">{value}</span>
  </div>
);

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

  // Parts réelles (au lieu de 30 / 70 codés en dur)
  const paidPercent =
    totalLoc > 0 ? Math.min(100, Math.max(0, Math.round((paidOnline / totalLoc) * 100))) : 100;
  const soldePercent = 100 - paidPercent;

  const fraisLivraison = Number(booking.fraisLivraison || 0);
  const typeLivraison = booking.typeLivraison;
  const deliveryLabel =
    typeLivraison === 'AIBD'
      ? 'Livraison aéroport AIBD'
      : typeLivraison === 'DAKAR' || booking.adresseLivraison
        ? 'Livraison à Dakar'
        : null;

  // Prix de base de la location hors frais annexes
  const totalBaseRental = prixParJour * nbJours;

  // Information paiement (Wave, Orange Money, etc.)
  const paymentProvider = booking.paiement?.fournisseur?.toUpperCase();
  const providerLabel =
    paymentProvider === 'WAVE'
      ? 'Wave'
      : paymentProvider === 'ORANGE_MONEY'
        ? 'Orange Money'
        : paymentProvider === 'INTOUCH'
          ? 'InTouch'
          : paymentProvider || null;

  const providerLogo =
    paymentProvider === 'WAVE'
      ? '/wavelogo.jpeg'
      : paymentProvider === 'ORANGE_MONEY'
        ? '/orangeMoneylogo.jpg'
        : null;

  return (
    <div className="space-y-6 rounded-3xl bg-white p-5 text-slate-900 shadow-[0_1px_2px_rgba(10,61,46,0.06),0_12px_28px_-16px_rgba(10,61,46,0.28)] ring-1 ring-slate-900/[0.06] sm:p-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#F1DFB6]">
          <Receipt className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </div>
        <div>
          <h3 className="font-fraunces text-xl font-normal leading-tight tracking-tight text-slate-900">
            Détails financiers
          </h3>
          <p className="text-xs text-slate-500">Montants en FCFA</p>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-3">
        <Line
          label={
            <>
              Location{' '}
              <span className="text-slate-400">
                {nbJours} jour{nbJours > 1 ? 's' : ''} × {formatCurrency(prixParJour)}
              </span>
            </>
          }
          value={formatCurrency(totalBaseRental || totalLoc)}
        />

        {deliveryLabel && (
          <Line
            icon={<Truck className="h-3.5 w-3.5" aria-hidden />}
            label={deliveryLabel}
            value={fraisLivraison > 0 ? formatCurrency(fraisLivraison) : 'Inclus'}
          />
        )}

        {booking.horsDakar && (
          <Line
            icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}
            label="Déplacement hors Dakar"
            value={<span className="font-medium text-slate-500">Inclus</span>}
          />
        )}

        <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-900">Total de la location</span>
          <span className="font-fraunces text-[28px] font-normal leading-none tabular-nums tracking-tight text-[#0A3D2E]">
            {formatCurrency(totalLoc)}
          </span>
        </div>
      </div>

      {/* Paiement : part réglée en ligne et solde */}
      <div className="rounded-2xl bg-[#0A3D2E] p-4 text-white sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {isDepositMode ? 'Acompte réglé en ligne' : 'Réglé en ligne'}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60">
              <span>
                {isDepositMode ? `${paidPercent}% à la réservation` : 'Paiement intégral sécurisé'}
              </span>
              {providerLabel && (
                <>
                  <span className="h-3 w-px bg-white/20" aria-hidden />
                  <span className="inline-flex items-center gap-1.5">
                    {providerLogo && (
                      <Image
                        src={providerLogo}
                        alt=""
                        width={16}
                        height={16}
                        className="h-4 w-4 rounded-full object-cover"
                      />
                    )}
                    {providerLabel}
                  </span>
                </>
              )}
            </p>
          </div>

          <p className="shrink-0 font-fraunces text-2xl font-normal leading-none tabular-nums text-[#F1DFB6]">
            {formatCurrency(paidOnline)}
          </p>
        </div>

        {/* Barre de progression : part réellement réglée */}
        <div
          role="progressbar"
          aria-label="Part de la location réglée en ligne"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={paidPercent}
          className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15"
        >
          <div
            className="h-full rounded-full bg-[#F1DFB6] transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${paidPercent}%` }}
          />
        </div>

        {isDepositMode && soldeCheckin > 0 && (
          <div className="mt-3 flex items-baseline justify-between gap-4 text-[13px]">
            <span className="text-white/70">
              Solde à la remise des clés <span className="text-white/45">{soldePercent}%</span>
            </span>
            <span className="font-semibold tabular-nums text-white">{formatCurrency(soldeCheckin)}</span>
          </div>
        )}

        {/* Garantie */}
        <div className="mt-4 flex items-start gap-2.5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/70">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F1DFB6]" aria-hidden />
          <p>
            {isDepositMode
              ? `L’acompte de ${paidPercent}% est conservé sous séquestre par AutoLoc. Le solde de ${soldePercent}% est remis à l’hôte lors du check-in.`
              : 'Votre règlement est protégé et tracé par la garantie AutoLoc jusqu’à la prise en charge.'}
          </p>
        </div>
      </div>
    </div>
  );
};