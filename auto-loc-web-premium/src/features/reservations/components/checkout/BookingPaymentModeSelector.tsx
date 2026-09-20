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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0 shadow-xs">
          <CreditCard className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-slate-900">
            Modalité de paiement
          </h3>
          <p className="text-xs text-slate-500">Choisissez comment régler votre réservation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Option 1 : Acompte 30% (Populaire) */}
        <button
          type="button"
          onClick={() => onSelectMode('DEPOSIT_30')}
          className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer ${
            mode === 'DEPOSIT_30'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  mode === 'DEPOSIT_30'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {mode === 'DEPOSIT_30' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    Acompte de 30% en ligne
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Populaire
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Réservez instantanément, payez le solde plus tard
                </p>
              </div>
            </div>

            <span
              className={`text-base font-display font-bold tabular-nums shrink-0 ${
                mode === 'DEPOSIT_30' ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              {formatCurrency(depositAmount)} FCFA
            </span>
          </div>

          {/* Breakdown Acompte */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500">À payer aujourd'hui</p>
                <p className="font-bold text-emerald-700 tabular-nums">
                  {formatCurrency(depositAmount)} FCFA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80">
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Key className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500">Solde au check-in</p>
                <p className="font-bold text-slate-800 tabular-nums">
                  {formatCurrency(remaining70)} FCFA
                </p>
              </div>
            </div>
          </div>

          {mode === 'DEPOSIT_30' && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Véhicule bloqué et garanti immédiatement dès validation.</span>
            </div>
          )}
        </button>

        {/* Option 2 : Totalité 100% en ligne */}
        <button
          type="button"
          onClick={() => onSelectMode('FULL_100')}
          className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer ${
            mode === 'FULL_100'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
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
              className={`text-base font-display font-bold tabular-nums shrink-0 ${
                mode === 'FULL_100' ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              {formatCurrency(fullAmount)} FCFA
            </span>
          </div>

          {mode === 'FULL_100' && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Tranquillité d'esprit totale, aucun paiement lors de la remise des clés.</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
