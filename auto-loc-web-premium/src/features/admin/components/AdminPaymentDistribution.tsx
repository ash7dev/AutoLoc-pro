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

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';

export const AdminPaymentDistribution: React.FC<AdminPaymentDistributionProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs h-72 animate-pulse" />
    );
  }

  const { providers, totalVolume, modeBreakdown } = data;
  const wave = providers.wave;
  const om = providers.orangeMoney;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs" style={fontStyle}>
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
            <Smartphone className="w-4.5 h-4.5" style={{ color: FOREST }} />
          </div>
          <div>
            <h3 className="text-base font-normal text-[#041912] dark:text-white">Répartition Mobile Money</h3>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Volumes encaissés via Wave & Orange Money Sénégal
            </p>
          </div>
        </div>
        <span
          className="text-xs font-normal px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap"
          style={{ backgroundColor: CHAMPAGNE, color: FOREST }}
        >
          Total {formatXOF(totalVolume)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Wave Senegal */}
        <div className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1DA1F2] text-white font-normal flex items-center justify-center text-sm shrink-0">
                W
              </div>
              <div>
                <div className="font-normal text-[#041912] dark:text-white text-sm">Wave Sénégal</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Mobile Money (0% frais client)
                </div>
              </div>
            </div>
            <span className="text-xl font-normal text-[#1DA1F2] tabular-nums">{wave.sharePercent}%</span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-normal text-[#041912] dark:text-white tabular-nums">{formatXOF(wave.volume)}</div>
            <div className="w-full h-1.5 rounded-full mt-3 overflow-hidden bg-slate-200/70 dark:bg-slate-800">
              <div className="h-full rounded-full bg-[#1DA1F2]" style={{ width: `${wave.sharePercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <span>{wave.transactionCount} transactions</span>
              <span className="font-medium" style={{ color: FOREST }}>{wave.successRate || 100}% de succès</span>
            </div>
          </div>
        </div>

        {/* Orange Money Senegal */}
        <div className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF6600] text-white font-normal flex items-center justify-center text-sm shrink-0">
                OM
              </div>
              <div>
                <div className="font-normal text-[#041912] dark:text-white text-sm">Orange Money</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  QR Code & USSD (Sonatel)
                </div>
              </div>
            </div>
            <span className="text-xl font-normal text-[#FF6600] tabular-nums">{om.sharePercent}%</span>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-normal text-[#041912] dark:text-white tabular-nums">{formatXOF(om.volume)}</div>
            <div className="w-full h-1.5 rounded-full mt-3 overflow-hidden bg-slate-200/70 dark:bg-slate-800">
              <div className="h-full rounded-full bg-[#FF6600]" style={{ width: `${om.sharePercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <span>{om.transactionCount} transactions</span>
              <span className="font-medium" style={{ color: FOREST }}>{om.successRate || 100}% de succès</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Payment Mode Breakdown */}
      {modeBreakdown && modeBreakdown.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">
            Mode d'encaissement des contrats confirmés
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modeBreakdown.map((m) => {
              const onlineAmt = m.volumeOnline ?? m.volume;
              const checkinAmt = m.volumeCheckin ?? 0;
              return (
                <div
                  key={m.mode}
                  className="p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#041912] dark:text-slate-200">
                      {m.mode === 'TOTAL_EN_LIGNE' ? '100% en ligne' : 'Acompte + solde check-in'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.count} contrat{m.count > 1 ? 's' : ''} confirmé{m.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 mt-0.5 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="font-medium" style={{ color: FOREST }}>
                      Encaissé en ligne : {formatXOF(onlineAmt)}
                    </span>
                    {checkinAmt > 0 && (
                      <span className="font-medium" style={{ color: GOLD }}>
                        Solde check-in : {formatXOF(checkinAmt)}
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