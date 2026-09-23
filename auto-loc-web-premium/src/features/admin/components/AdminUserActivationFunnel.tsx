'use client';

import React from 'react';
import { UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import type { AdminUserActivationFunnelData } from '../../../core/api/adminAnalyticsApi';
import { clsx } from 'clsx';

interface AdminUserActivationFunnelProps {
  data?: AdminUserActivationFunnelData;
  isLoading?: boolean;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminUserActivationFunnel: React.FC<AdminUserActivationFunnelProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm h-64 animate-pulse" />
    );
  }

  const { totalUsers, newUsers7Days, kycBreakdown, dropOffs, rates } = data;

  const steps = [
    {
      label: 'Membres Inscrits',
      count: totalUsers,
      subtext: `+${newUsers7Days} nouveaux (7j)`,
      color: 'bg-emerald-600',
    },
    {
      label: 'KYC Validés',
      count: kycBreakdown.verifie,
      subtext: `${rates.kycConversionRate}% du total`,
      color: 'bg-teal-600',
    },
    {
      label: 'Locataires Effectifs',
      count: Math.round(kycBreakdown.verifie * (rates.activationRate / 100)),
      subtext: `${rates.activationRate}% d'activation`,
      color: 'bg-[#0A3D2E]',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 font-fraunces" style={fontStyle}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3
            className="text-base font-fraunces font-normal text-[#041912] dark:text-white flex items-center gap-2"
            style={fontStyle}
          >
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-fraunces font-normal" style={fontStyle}>
              Funnel d'Activation & Conversion KYC
            </span>
          </h3>
          <p
            className="text-xs font-fraunces font-normal text-slate-500 dark:text-slate-400 mt-0.5"
            style={fontStyle}
          >
            Parcours utilisateur depuis l'inscription jusqu'à la première réservation effectuée.
          </p>
        </div>
      </div>

      {/* Funnel Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {steps.map((step, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-emerald-50/40 dark:bg-slate-800/40 border border-emerald-900/10 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-fraunces font-normal text-[#041912] dark:text-slate-300 uppercase tracking-wider"
                style={fontStyle}
              >
                {step.label}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            </div>

            <div
              className="mt-2 text-2xl font-fraunces font-normal text-[#041912] dark:text-white"
              style={fontStyle}
            >
              {step.count}
            </div>

            <div
              className="text-xs font-fraunces font-normal text-slate-500 dark:text-slate-400 mt-1"
              style={fontStyle}
            >
              {step.subtext}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all duration-500', step.color)}
                style={{
                  width: `${totalUsers > 0 ? Math.min(100, (step.count / totalUsers) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Alertes Drop-off & Actionable Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div
              className="text-xs font-fraunces font-normal text-amber-800 dark:text-amber-300"
              style={fontStyle}
            >
              {dropOffs.unverifiedStuckCount} membres inscrits sans KYC (&gt; 7 jours)
            </div>
            <div
              className="text-[11px] font-fraunces font-normal text-amber-700 dark:text-amber-400 mt-0.5"
              style={fontStyle}
            >
              Utilisateurs ayant créé leur compte mais abandonné l'étape permis. Relancer par SMS / WhatsApp.
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div
              className="text-xs font-fraunces font-normal text-purple-800 dark:text-purple-300"
              style={fontStyle}
            >
              {dropOffs.verifiedNoBookingCount} membres KYC vérifiés mais 0 location
            </div>
            <div
              className="text-[11px] font-fraunces font-normal text-purple-700 dark:text-purple-400 mt-0.5"
              style={fontStyle}
            >
              Comptes prêts à réserver mais inactifs. Proposer un code promo de première location.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
