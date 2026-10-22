'use client';

import React from 'react';
import Image from 'next/image';
import { CarFront, MapPin, Receipt, ShieldCheck, Truck, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getReservationDecompte } from '@/src/core/api/reservationsApi';
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
      {icon && <span className="shrink-0 text-brand-main/55">{icon}</span>}
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
  // Décompte calculé par le serveur : les lignes retombent exactement sur le total payé
  const d = getReservationDecompte({ ...booking, prixTotal: booking.prixTotal });
  const totalLoc = d.totalLocataire;
  const isDepositMode = d.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
  const paidOnline = d.payeEnLigne;
  const soldeCheckin = d.soldeCheckin;

  // Parts réelles (au lieu de 30 / 70 codés en dur)
  const paidPercent =
    totalLoc > 0 ? Math.min(100, Math.max(0, Math.round((paidOnline / totalLoc) * 100))) : 100;
  const soldePercent = 100 - paidPercent;

  // Les frais de service AutoLoc ne sont pas détaillés au locataire : ils sont inclus
  // dans la ligne Location (le détail figure dans le contrat)
  const locationTTC = d.location.montant + d.commission.montant;
  const jours = (n: number) => `${n} jour${n > 1 ? 's' : ''}`;

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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-main text-champagne">
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
          icon={<CarFront className="h-3.5 w-3.5" aria-hidden />}
          label={
            <>
              Location{' '}
              <span className="text-slate-400">{jours(d.location.nbJours)}</span>
            </>
          }
          value={formatCurrency(locationTTC)}
        />

        {d.horsDakar && (
          <Line
            icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}
            label={
              <>
                Hors Dakar{' '}
                <span className="text-slate-400">
                  {jours(d.horsDakar.nbJours)} × {formatCurrency(d.horsDakar.prixParJour)}
                </span>
              </>
            }
            value={formatCurrency(d.horsDakar.montant)}
          />
        )}

        {d.chauffeur && (
          <Line
            icon={<UserCheck className="h-3.5 w-3.5" aria-hidden />}
            label={
              <>
                Chauffeur{' '}
                <span className="text-slate-400">
                  {jours(d.chauffeur.nbJours)} × {formatCurrency(d.chauffeur.prixParJour)}
                </span>
              </>
            }
            value={formatCurrency(d.chauffeur.montant)}
          />
        )}

        {d.livraison && (
          <Line
            icon={<Truck className="h-3.5 w-3.5" aria-hidden />}
            label={d.livraison.type === 'AIBD' ? 'Livraison aéroport AIBD' : 'Livraison à Dakar'}
            value={formatCurrency(d.livraison.montant)}
          />
        )}

        <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-900">Total de la location</span>
          <span className="font-fraunces text-[28px] font-normal leading-none tabular-nums tracking-tight text-brand-main">
            {formatCurrency(totalLoc)}
          </span>
        </div>
      </div>

      {/* Paiement : part réglée en ligne et solde */}
      <div className="rounded-2xl bg-brand-main p-4 text-white sm:p-5">
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

          <p className="shrink-0 font-fraunces text-2xl font-normal leading-none tabular-nums text-champagne">
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
            className="h-full rounded-full bg-champagne transition-[width] duration-500 motion-reduce:transition-none"
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
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
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