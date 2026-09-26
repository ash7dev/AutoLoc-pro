'use client';

import React from 'react';
import {
  CreditCard,
  DollarSign,
  MapPin,
  Receipt,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OwnerReservationItem } from '@/src/core/api/reservationsApi';

export interface OwnerFinancialDetailsCardProps {
  reservation: OwnerReservationItem;
}

/* Ligne de type ticket : libellé ....... montant */
const LineItem: React.FC<{
  icon?: React.ReactNode;
  label: React.ReactNode;
  value: React.ReactNode;
  isNegative?: boolean;
}> = ({ icon, label, value, isNegative }) => (
  <div className="flex items-end gap-2 text-[13px]">
    <span className="flex min-w-0 items-center gap-1.5 text-slate-600 font-medium">
      {icon && <span className="shrink-0 text-brand-main">{icon}</span>}
      <span>{label}</span>
    </span>
    <span
      aria-hidden
      className="mb-[5px] min-w-3 flex-1 border-b border-dotted border-slate-300"
    />
    <span
      className={`shrink-0 font-semibold tabular-nums ${
        isNegative ? 'text-rose-600' : 'text-slate-900'
      }`}
    >
      {value}
    </span>
  </div>
);

export const OwnerFinancialDetailsCard: React.FC<OwnerFinancialDetailsCardProps> = ({
  reservation,
}) => {
  const nbJours = Math.max(1, Number(reservation.nbJours || 1));
  const prixParJour = Number(reservation.prixParJour || 0);
  const totalLoc = Number(reservation.prixTotal || 0);
  const commission = Number(reservation.commission || 0);
  const netProprietaire = Number(
    reservation.netProprietaire || reservation.montantProprietaire || Math.max(0, totalLoc - commission)
  );

  const isDepositMode = reservation.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';

  const paidOnline = Number(
    reservation.montantPayeEnLigne ?? (isDepositMode ? Math.round(totalLoc * 0.3) : totalLoc)
  );
  const soldeCheckin = isDepositMode
    ? Number(reservation.montantSoldeCheckin ?? Math.max(0, totalLoc - paidOnline))
    : 0;

  const paidPercent =
    totalLoc > 0 ? Math.min(100, Math.max(0, Math.round((paidOnline / totalLoc) * 100))) : 100;
  const soldePercent = 100 - paidPercent;

  const fraisLivraison = Number(reservation.fraisLivraison || 0);
  const totalBaseRental = prixParJour * nbJours;

  return (
    <div className="space-y-6 rounded-3xl bg-white p-5 text-slate-900 shadow-sm border border-slate-200/90 sm:p-6">
      {/* ── En-tête de la carte ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-main text-champagne">
          <Receipt className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h3 className="font-fraunces text-xl font-normal leading-tight tracking-tight text-brand-dark">
            Détails financiers & Paiement
          </h3>
          <p className="text-xs text-slate-500 font-medium">Décompte des montants et net hôte en FCFA</p>
        </div>
      </div>

      {/* ── Récapitulatif Tarifaire Ticket ──────────────────────────────── */}
      <div className="space-y-3">
        <LineItem
          label={
            <>
              Location{' '}
              <span className="text-slate-400 font-medium">
                ({nbJours} jour{nbJours > 1 ? 's' : ''} × {formatCurrency(prixParJour)} FCFA)
              </span>
            </>
          }
          value={`${formatCurrency(totalBaseRental || totalLoc)} FCFA`}
        />

        {fraisLivraison > 0 && (
          <LineItem
            icon={<Truck className="h-3.5 w-3.5" aria-hidden />}
            label="Frais de livraison convenus"
            value={`${formatCurrency(fraisLivraison)} FCFA`}
          />
        )}

        <LineItem
          icon={<DollarSign className="h-3.5 w-3.5" aria-hidden />}
          label="Commission de service AutoLoc"
          value={`- ${formatCurrency(commission)} FCFA`}
          isNegative
        />

        {/* Ligne Total Net Propriétaire */}
        <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-4">
          <div>
            <span className="text-sm font-bold text-brand-dark">Revenu Net Propriétaire</span>
            <span className="block text-[11px] text-slate-500 font-medium">Montant perçu après commission</span>
          </div>
          <span className="font-fraunces text-2xl sm:text-3xl font-bold leading-none tabular-nums tracking-tight text-brand-main">
            {formatCurrency(netProprietaire)} FCFA
          </span>
        </div>
      </div>

      {/* ── Bloc Sombre Répartition Encaissement & Escrow AutoLoc ──────── */}
      <div className="rounded-2xl bg-brand-main p-4 text-white sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-champagne" />
              <p className="text-sm font-bold text-white">
                {isDepositMode ? 'Modalité d’encaissement mixte' : 'Encaissement intégral en ligne'}
              </p>
            </div>
            <p className="mt-1 text-xs text-white/70 font-medium">
              {isDepositMode
                ? `Acompte de ${paidPercent}% encaissé en ligne sur AutoLoc Escrow`
                : 'Fonds sécurisés sur votre solde AutoLoc'}
            </p>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
              Net Hôte Réglé
            </span>
            <span className="font-fraunces text-2xl font-bold tabular-nums text-champagne">
              {formatCurrency(netProprietaire)} FCFA
            </span>
          </div>
        </div>

        {/* Barre de progression d'acompte / solde */}
        <div
          role="progressbar"
          aria-label="Répartition acompte et solde"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={paidPercent}
          className="h-2 w-full overflow-hidden rounded-full bg-white/20"
        >
          <div
            className="h-full rounded-full bg-champagne transition-all duration-500"
            style={{ width: `${paidPercent}%` }}
          />
        </div>

        {/* Détails Acompte & Solde Check-in */}
        {isDepositMode && soldeCheckin > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs font-medium">
            <div>
              <span className="block text-[10px] uppercase text-white/60 font-bold">
                Acompte reçu ({paidPercent}%)
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {formatCurrency(paidOnline)} FCFA
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-white/60 font-bold">
                Solde au Check-in ({soldePercent}%)
              </span>
              <span className="text-sm font-bold text-champagne">
                {formatCurrency(soldeCheckin)} FCFA
              </span>
            </div>
          </div>
        )}

        {/* Note de garantie Escrow AutoLoc */}
        <div className="flex items-start gap-2.5 border-t border-white/10 pt-3 text-xs leading-relaxed text-white/80 font-medium">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
          <p>
            {isDepositMode
              ? `L'acompte de ${paidPercent}% est consigné en séquestre bancaire. Recevez les ${soldePercent}% restants en direct du locataire lors de la remise des clés.`
              : 'Les fonds sont garantis par AutoLoc et débloqués sur votre portefeuille à l’issue du check-in.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Export alternatif pour compatibilité
export { OwnerFinancialDetailsCard as PaymentDetailsCard, OwnerFinancialDetailsCard as FinancialDetailsCard };
