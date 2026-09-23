'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';
import type { AdminPaymentBreakdownData } from '../../../core/api/adminAnalyticsApi';
import { formatXOF } from './AdminExecutiveMetrics';

interface AdminPaymentDistributionProps {
  data?: AdminPaymentBreakdownData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminPaymentDistribution: React.FC<AdminPaymentDistributionProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm h-64 animate-pulse" />
    );
  }

  const { providers, totalVolume, modeBreakdown } = data;
  const wave = providers.wave;
  const om = providers.orangeMoney;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 font-fraunces" style={fontStyle}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3
            className="text-base font-fraunces font-normal text-[#041912] dark:text-white flex items-center gap-2"
            style={fontStyle}
          >
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <span className="font-fraunces font-normal" style={fontStyle}>
              Répartition Mobile Money
            </span>
          </h3>
          <p
            className="text-xs font-fraunces font-normal text-slate-500 dark:text-slate-400 mt-0.5"
            style={fontStyle}
          >
            Volumes financiers encaissés via Wave & Orange Money Sénégal.
          </p>
        </div>
        <span
          className="text-xs font-fraunces font-normal px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200"
          style={fontStyle}
        >
          Total : {formatXOF(totalVolume)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Wave Senegal */}
        <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-900 border border-sky-200 dark:border-sky-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-sky-500 text-white font-normal flex items-center justify-center text-sm shadow-xs font-fraunces"
                style={fontStyle}
              >
                W
              </div>
              <div>
                <div
                  className="font-normal text-[#041912] dark:text-white text-sm font-fraunces"
                  style={fontStyle}
                >
                  Wave Sénégal
                </div>
                <div
                  className="text-[11px] text-sky-700 dark:text-sky-400 font-normal font-fraunces"
                  style={fontStyle}
                >
                  Mobile Money (0% frais client)
                </div>
              </div>
            </div>
            <span
              className="text-xl font-normal font-fraunces text-sky-700 dark:text-sky-400"
              style={fontStyle}
            >
              {wave.sharePercent}%
            </span>
          </div>

          <div className="mt-4">
            <div
              className="text-2xl font-normal font-fraunces text-[#041912] dark:text-white"
              style={fontStyle}
            >
              {formatXOF(wave.volume)}
            </div>
            <div className="flex items-center justify-between text-xs font-fraunces text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-sky-200 dark:border-slate-800">
              <span className="font-fraunces font-normal" style={fontStyle}>
                {wave.transactionCount} transactions
              </span>
              <span className="font-normal text-emerald-700 dark:text-emerald-400 font-fraunces" style={fontStyle}>
                {wave.successRate || 100}% de succès
              </span>
            </div>
          </div>
        </div>

        {/* Orange Money Senegal */}
        <div className="p-5 rounded-2xl bg-orange-50/70 dark:bg-slate-900 border border-orange-200 dark:border-orange-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl bg-orange-500 text-white font-normal flex items-center justify-center text-sm shadow-xs font-fraunces"
                style={fontStyle}
              >
                OM
              </div>
              <div>
                <div
                  className="font-normal text-[#041912] dark:text-white text-sm font-fraunces"
                  style={fontStyle}
                >
                  Orange Money
                </div>
                <div
                  className="text-[11px] text-orange-700 dark:text-orange-400 font-normal font-fraunces"
                  style={fontStyle}
                >
                  QR Code & USSD (Sonatel)
                </div>
              </div>
            </div>
            <span
              className="text-xl font-normal font-fraunces text-orange-700 dark:text-orange-400"
              style={fontStyle}
            >
              {om.sharePercent}%
            </span>
          </div>

          <div className="mt-4">
            <div
              className="text-2xl font-normal font-fraunces text-[#041912] dark:text-white"
              style={fontStyle}
            >
              {formatXOF(om.volume)}
            </div>
            <div className="flex items-center justify-between text-xs font-fraunces text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-orange-200 dark:border-slate-800">
              <span className="font-fraunces font-normal" style={fontStyle}>
                {om.transactionCount} transactions
              </span>
              <span className="font-normal text-emerald-700 dark:text-emerald-400 font-fraunces" style={fontStyle}>
                {om.successRate || 100}% de succès
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Payment Mode Breakdown */}
      {modeBreakdown && modeBreakdown.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <span
            className="text-xs font-fraunces font-normal text-slate-500 uppercase tracking-wider block mb-3"
            style={fontStyle}
          >
            Mode d'Encaissement des Contrats Confirmés
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modeBreakdown.map((m) => {
              const onlineAmt = m.volumeOnline ?? m.volume;
              const checkinAmt = m.volumeCheckin ?? 0;
              return (
                <div key={m.mode} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-xs font-fraunces">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#041912] dark:text-slate-200 font-fraunces" style={fontStyle}>
                      {m.mode === 'TOTAL_EN_LIGNE' ? '100% en Ligne' : 'Acompte + Solde Check-in'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-fraunces" style={fontStyle}>
                      {m.count} contrat{m.count > 1 ? 's' : ''} confirmé{m.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Encaissé en Ligne : {formatXOF(onlineAmt)}
                    </span>
                    {checkinAmt > 0 && (
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        Solde Check-in : {formatXOF(checkinAmt)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
