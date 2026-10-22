'use client';

import React from 'react';
import {
  CarFront,
  MapPin,
  Percent,
  Receipt,
  ShieldCheck,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OwnerReservationItem, getReservationDecompte } from '@/src/core/api/reservationsApi';

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
  // Décompte calculé par le serveur (montants figés à la réservation)
  const d = getReservationDecompte(reservation);
  const totalLoc = d.totalLocataire;
  const netProprietaire = d.revenuProprietaire;
  const isDepositMode = d.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
  const paidOnline = d.payeEnLigne;
  const soldeCheckin = d.soldeCheckin;

  const paidPercent =
    totalLoc > 0 ? Math.min(100, Math.max(0, Math.round((paidOnline / totalLoc) * 100))) : 100;
  const soldePercent = 100 - paidPercent;

  const tauxPct = Math.round(d.commission.taux * 1000) / 10;
  const jours = (n: number) => `${n} jour${n > 1 ? 's' : ''}`;

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

      {/* ── Votre revenu : location + options (sans commission) ─────────── */}
      <div className="space-y-3">
        <LineItem
          icon={<CarFront className="h-3.5 w-3.5" aria-hidden />}
          label={
            <>
              Location{' '}
              <span className="text-slate-400 font-medium">
                ({jours(d.location.nbJours)} × {formatCurrency(d.location.prixParJour)} FCFA)
              </span>
            </>
          }
          value={`${formatCurrency(d.location.montant)} FCFA`}
        />

        {d.horsDakar && (
          <LineItem
            icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}
            label={
              <>
                Supplément hors Dakar{' '}
                <span className="text-slate-400 font-medium">
                  ({jours(d.horsDakar.nbJours)} × {formatCurrency(d.horsDakar.prixParJour)} FCFA)
                </span>
              </>
            }
            value={`${formatCurrency(d.horsDakar.montant)} FCFA`}
          />
        )}

        {d.chauffeur && (
          <LineItem
            icon={<UserCheck className="h-3.5 w-3.5" aria-hidden />}
            label={
              <>
                Chauffeur{' '}
                <span className="text-slate-400 font-medium">
                  ({jours(d.chauffeur.nbJours)} × {formatCurrency(d.chauffeur.prixParJour)} FCFA)
                </span>
              </>
            }
            value={`${formatCurrency(d.chauffeur.montant)} FCFA`}
          />
        )}

        {d.livraison?.pourProprietaire && (
          <LineItem
            icon={<Truck className="h-3.5 w-3.5" aria-hidden />}
            label={d.livraison.type === 'AIBD' ? 'Livraison aéroport AIBD' : 'Livraison à Dakar'}
            value={`${formatCurrency(d.livraison.montant)} FCFA`}
          />
        )}

        <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-4">
          <div>
            <span className="text-sm font-bold text-brand-dark">Votre revenu</span>
            <span className="block text-[11px] text-slate-500 font-medium">
              Location, options et livraison, sans commission déduite
            </span>
          </div>
          <span className="font-fraunces text-2xl sm:text-3xl font-bold leading-none tabular-nums tracking-tight text-brand-main">
            {formatCurrency(netProprietaire)} FCFA
          </span>
        </div>
      </div>

      {/* ── Ce que le locataire paie en plus ───────────────────────────── */}
      <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Payé par le locataire
        </p>
        <LineItem label="Votre revenu" value={`${formatCurrency(netProprietaire)} FCFA`} />
        {d.livraison && !d.livraison.pourProprietaire && (
          <LineItem
            icon={<Truck className="h-3.5 w-3.5" aria-hidden />}
            label={d.livraison.type === 'AIBD' ? 'Livraison aéroport AIBD' : 'Livraison à Dakar'}
            value={`+ ${formatCurrency(d.livraison.montant)} FCFA`}
          />
        )}
        <LineItem
          icon={<Percent className="h-3.5 w-3.5" aria-hidden />}
          label={
            <>
              Frais de service AutoLoc{' '}
              {tauxPct > 0 && <span className="text-slate-400 font-medium">({tauxPct} % de la location)</span>}
            </>
          }
          value={`+ ${formatCurrency(d.commission.montant)} FCFA`}
        />
        <div className="flex items-baseline justify-between gap-4 border-t border-slate-200 pt-2.5 text-[13px]">
          <span className="font-semibold text-slate-700">Total payé par le locataire</span>
          <span className="font-bold tabular-nums text-slate-900">{formatCurrency(totalLoc)} FCFA</span>
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
              Votre revenu
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
