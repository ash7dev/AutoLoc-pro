'use client';

import React from 'react';
import { CreditCard, CheckCircle2, Key, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export type PaymentMode = 'DEPOSIT_30' | 'FULL_100';

interface BookingPaymentModeSelectorProps {
  mode: PaymentMode;
  onSelectMode: (m: PaymentMode) => void;
  depositAmount: number;
  fullAmount: number;
}

export function BookingPaymentModeSelector({
  mode,
  onSelectMode,
  depositAmount,
  fullAmount,
}: BookingPaymentModeSelectorProps) {
  const remaining70 = fullAmount - depositAmount;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-xl bg-[#041912] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <h3 
            className="text-base font-fraunces font-normal text-[#041912] tracking-tight"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            Modalité de paiement
          </h3>
          <p className="text-xs text-slate-500">Choisissez comment régler votre réservation</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Option 1 : Acompte 30% */}
        <button
          type="button"
          onClick={() => onSelectMode('DEPOSIT_30')}
          className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
            mode === 'DEPOSIT_30'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  mode === 'DEPOSIT_30'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {mode === 'DEPOSIT_30' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-sm font-bold text-slate-900">
                  Acompte de 30% en ligne
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                  Populaire
                </span>
              </div>
            </div>

            <span
              className={`text-sm sm:text-base font-bold tabular-nums shrink-0 ${
                mode === 'DEPOSIT_30' ? 'text-emerald-800' : 'text-slate-900'
              }`}
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              {formatCurrency(depositAmount)} FCFA
            </span>
          </div>

          {/* Breakdown Acompte */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 truncate">À payer aujourd'hui en ligne</span>
              </div>
              <span className="font-bold text-emerald-700 tabular-nums shrink-0">
                {formatCurrency(depositAmount)} FCFA
              </span>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 truncate">Solde lors de la remise des clés</span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums shrink-0">
                {formatCurrency(remaining70)} FCFA
              </span>
            </div>
          </div>

          {mode === 'DEPOSIT_30' && (
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Réservation instantanée garantie dès la validation de l'acompte.</span>
            </div>
          )}
        </button>

        {/* Option 2 : Totalité 100% en ligne */}
        <button
          type="button"
          onClick={() => onSelectMode('FULL_100')}
          className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
            mode === 'FULL_100'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  mode === 'FULL_100'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {mode === 'FULL_100' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">
                  Totalité 100% en ligne
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Règlement intégral en une seule fois
                </p>
              </div>
            </div>

            <span
              className={`text-sm sm:text-base font-bold tabular-nums shrink-0 ${
                mode === 'FULL_100' ? 'text-emerald-800' : 'text-slate-900'
              }`}
              style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}
            >
              {formatCurrency(fullAmount)} FCFA
            </span>
          </div>

          {/* Breakdown Totalité */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 truncate">Règlement intégral en ligne</span>
              </div>
              <span className="font-bold text-emerald-700 tabular-nums shrink-0">
                {formatCurrency(fullAmount)} FCFA
              </span>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 truncate">Solde au propriétaire</span>
              </div>
              <span className="font-bold text-emerald-700 tabular-nums shrink-0">
                0 FCFA (Tout réglé)
              </span>
            </div>
          </div>

          {mode === 'FULL_100' && (
            <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tranquillité d'esprit totale, aucun règlement supplémentaire à effectuer.</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
