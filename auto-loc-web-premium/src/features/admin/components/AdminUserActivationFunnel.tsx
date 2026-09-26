'use client';

import React from 'react';
import { UserCheck, AlertCircle, Sparkles, Info, ArrowRight, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import type { AdminUserActivationFunnelData } from '../../../core/api/adminAnalyticsApi';
import { clsx } from 'clsx';

interface AdminUserActivationFunnelProps {
  data?: AdminUserActivationFunnelData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

export const AdminUserActivationFunnel: React.FC<AdminUserActivationFunnelProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs h-80 animate-pulse" />
    );
  }

  const { totalUsers, activeRentersTotal, newUsers7Days, kycBreakdown, dropOffs, rates } = data;
  const activeRentersCount = activeRentersTotal ?? 0;

  const kycDropoffPercent = totalUsers > 0 ? Math.round(((totalUsers - kycBreakdown.verifie) / totalUsers) * 100) : 0;
  const activationDropoffPercent = kycBreakdown.verifie > 0 ? Math.round(((kycBreakdown.verifie - activeRentersCount) / kycBreakdown.verifie) * 100) : 0;

  const steps = [
    {
      stage: '01',
      label: 'Utilisateurs enregistrés',
      description: 'Comptes créés sur AutoLoc, prêts pour relance',
      count: totalUsers,
      subtext: `+${newUsers7Days} nouveaux (7 derniers jours)`,
      fill: 100,
      tone: 'rgba(10, 61, 46, 0.16)',
    },
    {
      stage: '02',
      label: 'KYC validés',
      description: 'Permis de conduire vérifié & approuvé',
      count: kycBreakdown.verifie,
      subtext: `${rates.kycConversionRate}% de conversion`,
      fill: totalUsers > 0 ? (kycBreakdown.verifie / totalUsers) * 100 : 0,
      tone: 'rgba(10, 61, 46, 0.4)',
    },
    {
      stage: '03',
      label: 'Locataires effectifs',
      description: 'Au moins 1 réservation confirmée',
      count: activeRentersCount,
      subtext: `${rates.activationRate}% d'activation`,
      fill: totalUsers > 0 ? (activeRentersCount / totalUsers) * 100 : 0,
      tone: FOREST,
    },
  ];

  return (
    <div
      className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs"
      style={fontStyle}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}
          >
            <UserCheck className="w-4.5 h-4.5" style={{ color: FOREST }} />
          </div>
          <div>
            <h3 className="text-base font-normal text-brand-dark dark:text-white" style={fontStyle}>
              Funnel d'activation
            </h3>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Inscription &rarr; Permis vérifié (KYC) &rarr; Première location
            </p>
          </div>
        </div>

        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] shrink-0"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.06)', color: FOREST }}
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Données temps réel</span>
        </div>
      </div>

      {/* KYC breakdown pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Répartition KYC :</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          Non vérifié <strong className="font-semibold">{kycBreakdown.nonVerifie}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]" style={{ backgroundColor: 'rgba(178, 124, 45, 0.1)', color: '#8a5a1f' }}>
          <AlertCircle className="w-3 h-3" style={{ color: '#b27c2d' }} />
          En attente admin <strong className="font-semibold">{kycBreakdown.enAttente}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px]" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST }}>
          <CheckCircle2 className="w-3 h-3" style={{ color: FOREST }} />
          Permis validés <strong className="font-semibold">{kycBreakdown.verifie}</strong>
        </span>
        {kycBreakdown.rejete > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/8 text-red-700 dark:text-red-400 text-[11px]">
            <XCircle className="w-3 h-3 text-red-500" />
            Rejetés <strong className="font-semibold">{kycBreakdown.rejete}</strong>
          </span>
        )}
      </div>

      {/* Funnel */}
      <div className="mt-5 flex flex-col md:flex-row items-stretch gap-2 md:gap-0">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-1 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] tracking-[0.15em] font-semibold px-0"
                    style={{ color: 'rgba(4, 25, 18, 0.35)' }}
                  >
                    ÉTAPE {step.stage}
                  </span>
                </div>

                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-normal text-brand-dark dark:text-white">{step.label}</h4>
                  <div className="text-2xl font-normal text-brand-dark dark:text-white tabular-nums">{step.count}</div>
                </div>

                <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                <div className="text-[11px] font-medium" style={{ color: FOREST }}>
                  {step.subtext}
                </div>
                <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, step.fill)}%`, backgroundColor: step.tone }}
                  />
                </div>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden md:flex items-center justify-center w-8 shrink-0">
                <ArrowRight className="w-4 h-4" style={{ color: 'rgba(4, 25, 18, 0.25)' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Drop-off alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/80">
        <div
          className="p-4 rounded-xl border flex items-start gap-3"
          style={{ backgroundColor: 'rgba(178, 124, 45, 0.06)', borderColor: 'rgba(178, 124, 45, 0.18)' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#b27c2d' }} />
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: '#7a5219' }}>
              {dropOffs.unverifiedStuckCount} membres bloqués à l'inscription (&gt; 7j)
            </span>
            <p className="text-[11px] font-normal mt-1 leading-normal" style={{ color: 'rgba(122, 82, 25, 0.85)' }}>
              Profil créé, permis jamais téléversé.
            </p>
            <div className="mt-2.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded"
                style={{ backgroundColor: 'rgba(178, 124, 45, 0.14)', color: '#7a5219' }}
              >
                Recommandation : relance SMS / WhatsApp
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-4 rounded-xl border flex items-start gap-3"
          style={{ backgroundColor: 'rgba(10, 61, 46, 0.05)', borderColor: 'rgba(10, 61, 46, 0.16)' }}
        >
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" style={{ color: FOREST }} />
          <div className="flex-1">
            <span className="text-xs font-semibold" style={{ color: FOREST }}>
              {dropOffs.verifiedNoBookingCount} membres vérifiés inactifs (0 location)
            </span>
            <p className="text-[11px] font-normal mt-1 leading-normal text-slate-600 dark:text-slate-400">
              Permis validé, aucun trajet réservé pour l'instant.
            </p>
            <div className="mt-2.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded"
                style={{ backgroundColor: CHAMPAGNE, color: FOREST }}
              >
                Recommandation : code promo 1ère location (-10%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};