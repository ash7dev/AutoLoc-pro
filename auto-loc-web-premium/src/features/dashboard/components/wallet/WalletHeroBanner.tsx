'use client';

import React from 'react';
import { ArrowUpRight, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { WalletData, SavedAccountsResponse } from '../../../../core/api/walletApi';

interface WalletHeroBannerProps {
  wallet?: WalletData;
  accounts?: SavedAccountsResponse;
  isLoading?: boolean;
  onOpenWithdrawal: (provider?: 'WAVE' | 'ORANGE_MONEY') => void;
}

export const WalletHeroBanner: React.FC<WalletHeroBannerProps> = ({
  wallet,
  accounts,
  isLoading = false,
  onOpenWithdrawal,
}) => {
  if (isLoading || !wallet) {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-brand-main p-5 text-champagne ring-1 ring-inset ring-champagne/10 sm:rounded-[32px] sm:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-40 rounded bg-champagne/20" />
          <div className="h-10 w-56 rounded bg-champagne/20" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-2xl bg-champagne/10" />
            <div className="h-20 rounded-2xl bg-champagne/10" />
          </div>
        </div>
      </div>
    );
  }

  const soldeDisponible = parseFloat(wallet.balance.soldeDisponible || '0');
  const soldeRetirable = parseFloat(wallet.balance.soldeRetirable || '0');
  const soldeWave = parseFloat(wallet.balance.soldeWave || '0');
  const soldeOm = parseFloat(wallet.balance.soldeOrangeMoney || '0');
  const totalPenalites = wallet.totalPenalites || 0;
  const penaltiesCount = wallet.penaltiesCount || 0;

  const lastWaveNum = accounts?.lastWaveNumber;
  const lastOmNum = accounts?.lastOmNumber;

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#041912] via-[#0A3D2E] to-[#062c21] p-5 text-champagne shadow-xl ring-1 ring-inset ring-champagne/15 sm:rounded-[32px] sm:p-8">
      {/* Visual Background Accents */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10 space-y-6 sm:space-y-8">
        {/* Header & Primary Solde */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-champagne/10 px-3 py-1 text-xs font-semibold text-champagne">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Portefeuille Propriétaire Certifié</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-champagne/75">Solde Retirable Instantané</p>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-champagne tabular-nums">
                {formatCurrency(soldeRetirable)}
              </h2>
              <span className="text-base font-bold text-champagne/60 sm:text-lg">FCFA</span>
            </div>
            {soldeDisponible !== soldeRetirable && (
              <p className="text-[11px] sm:text-xs text-champagne/70 leading-relaxed">
                Solde total brut : <span className="font-fraunces font-semibold text-champagne tabular-nums">{formatCurrency(soldeDisponible)} FCFA</span>
                {totalPenalites > 0 && (
                  <span className="block sm:inline sm:ml-1 text-amber-300">({formatCurrency(totalPenalites)} FCFA de pénalité déduite)</span>
                )}
              </p>
            )}
          </div>

          {/* Action Call to Action */}
          <div className="w-full shrink-0 sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenWithdrawal()}
              disabled={soldeRetirable <= 0}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-champagne px-5 py-3.5 text-xs sm:text-sm font-extrabold text-brand-dark shadow-lg transition-all hover:bg-white active:scale-[0.98] disabled:opacity-40 cursor-pointer"
            >
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-brand-dark" />
              <span>Demander un virement</span>
            </button>
          </div>
        </div>

        {/* Operator Balance Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Wave Card */}
          <div
            onClick={() => soldeWave > 0 && onOpenWithdrawal('WAVE')}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-md transition-all duration-200 ${
              soldeWave > 0 ? 'hover:border-[#00C3FF]/50 hover:bg-white/10 cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5 flex items-center justify-center">
                  <img src="/wave.png" alt="Wave Senegal" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    Wave Sénégal
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#00C3FF]" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                    {lastWaveNum ? `Virement : ${lastWaveNum}` : 'Frais 0% • Instantané'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-fraunces text-base sm:text-xl font-normal text-white tabular-nums">
                  {formatCurrency(soldeWave)} <span className="font-sans text-[10px] sm:text-xs font-normal text-slate-300">FCFA</span>
                </p>
                {soldeWave > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#00C3FF] group-hover:underline">
                    Retirer &rarr;
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Orange Money Card */}
          <div
            onClick={() => soldeOm > 0 && onOpenWithdrawal('ORANGE_MONEY')}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-md transition-all duration-200 ${
              soldeOm > 0 ? 'hover:border-[#FF6600]/50 hover:bg-white/10 cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-xl bg-black p-1 shadow-sm ring-1 ring-white/10 flex items-center justify-center">
                  <img src="/orange.png" alt="Orange Money" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    Orange Money
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#FF6600]" />
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 truncate">
                    {lastOmNum ? `Virement : ${lastOmNum}` : 'Paiement direct mobile'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-fraunces text-base sm:text-xl font-normal text-white tabular-nums">
                  {formatCurrency(soldeOm)} <span className="font-sans text-[10px] sm:text-xs font-normal text-slate-300">FCFA</span>
                </p>
                {soldeOm > 0 && (
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#FF6600] group-hover:underline">
                    Retirer &rarr;
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Penalty Warning Banner if penalites > 0 */}
        {totalPenalites > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-200 backdrop-blur-md">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-300">
                Pénalités en cours : {formatCurrency(totalPenalites)} FCFA ({penaltiesCount} retenue{penaltiesCount > 1 ? 's' : ''})
              </p>
              <p className="text-amber-200/80 text-[11px] leading-relaxed">
                Les pénalités d'annulation ou d'infraction sont automatiquement retenues sur le solde retirable net.
              </p>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-champagne/15 pt-3.5 text-[11px] text-champagne/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Fonds sécurisés par escrow bancaire & API Mobile Money directes.</span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-champagne/50">Réf: SENEGAL-MOBILE-GATEWAY</span>
        </div>
      </div>
    </div>
  );
};
