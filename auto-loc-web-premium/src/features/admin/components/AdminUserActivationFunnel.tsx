'use client';

import React from 'react';
import { UserCheck, AlertCircle, Sparkles, Info, ArrowRight, ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';
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
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm h-72 animate-pulse" />
    );
  }

  const { totalUsers, activeRentersTotal, newUsers7Days, kycBreakdown, dropOffs, rates } = data;
  const activeRentersCount = activeRentersTotal ?? 0;

  // Drop-off percentage between stages
  const kycDropoffPercent = totalUsers > 0 ? Math.round(((totalUsers - kycBreakdown.verifie) / totalUsers) * 100) : 0;
  const activationDropoffPercent = kycBreakdown.verifie > 0 ? Math.round(((kycBreakdown.verifie - activeRentersCount) / kycBreakdown.verifie) * 100) : 0;

  const steps = [
    {
      stage: 'Étape 1',
      label: 'Utilisateurs Enregistrés',
      description: 'Total des comptes créés sur AutoLoc (prêts pour relance)',
      count: totalUsers,
      subtext: `+${newUsers7Days} nouveaux membres (7 derniers jours)`,
      badge: 'Bassin d\'inscrits total',
      color: 'bg-emerald-600',
    },
    {
      stage: 'Étape 2',
      label: 'KYC Validés',
      description: 'Permis de conduire vérifié & approuvé par l\'admin',
      count: kycBreakdown.verifie,
      subtext: `${rates.kycConversionRate}% de conversion permis`,
      badge: `${kycDropoffPercent}% d'abandon permis`,
      color: 'bg-teal-600',
    },
    {
      stage: 'Étape 3',
      label: 'Locataires Effectifs',
      description: 'A effectué au moins 1 réservation confirmée',
      count: activeRentersCount,
      subtext: `${rates.activationRate}% d'activation du permis`,
      badge: `${activationDropoffPercent}% n'ont pas encore loué`,
      color: 'bg-[#0A3D2E]',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 font-fraunces" style={fontStyle}>
      {/* Header avec explications globales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
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
            Suivi étape par étape : Inscription &rarr; Envoi Permis (KYC) &rarr; Première Location Réussie.
          </p>
        </div>

        {/* Legend Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] text-emerald-800 dark:text-emerald-300">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Données réelles issues du serveur backend</span>
        </div>
      </div>

      {/* Détail du statut KYC global en petites pilules */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">Répartition actuelle du KYC :</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          Non vérifié : <strong>{kycBreakdown.nonVerifie}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px]">
          <AlertCircle className="w-3 h-3 text-amber-500" />
          En attente admin : <strong>{kycBreakdown.enAttente}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px]">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Permis Validés : <strong>{kycBreakdown.verifie}</strong>
        </span>
        {kycBreakdown.rejete > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 text-[11px]">
            <XCircle className="w-3 h-3 text-red-500" />
            Rejetés : <strong>{kycBreakdown.rejete}</strong>
          </span>
        )}
      </div>

      {/* Funnel Progress Cards avec connecteurs visuels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  {step.stage}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                  {step.badge}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <h4
                  className="text-sm font-fraunces font-normal text-[#041912] dark:text-white"
                  style={fontStyle}
                >
                  {step.label}
                </h4>
                <div
                  className="text-2xl font-fraunces font-normal text-[#041912] dark:text-white"
                  style={fontStyle}
                >
                  {step.count}
                </div>
              </div>

              <p
                className="text-[11px] font-fraunces font-normal text-slate-500 dark:text-slate-400 mt-1 leading-tight"
                style={fontStyle}
              >
                {step.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
              <div
                className="text-xs font-fraunces font-normal text-emerald-800 dark:text-emerald-300 font-medium"
                style={fontStyle}
              >
                {step.subtext}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500', step.color)}
                  style={{
                    width: `${totalUsers > 0 ? Math.min(100, (step.count / totalUsers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes Drop-off & Recommandations Opérationnelles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-fraunces font-normal font-semibold text-amber-900 dark:text-amber-200"
                style={fontStyle}
              >
                {dropOffs.unverifiedStuckCount} membres bloqués à l'inscription (&gt; 7j)
              </span>
            </div>
            <p
              className="text-[11px] font-fraunces font-normal text-amber-800/90 dark:text-amber-300 mt-1 leading-normal"
              style={fontStyle}
            >
              <strong>Pourquoi ce chiffre ?</strong> Ces utilisateurs ont créé leur profil mais n'ont jamais téléversé leur permis de conduire.
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 dark:text-amber-300 bg-amber-200/50 dark:bg-amber-900/40 px-2 py-1 rounded">
                💡 Recommandation : Envoyer un SMS / WhatsApp de relance permis
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-fraunces font-normal font-semibold text-purple-900 dark:text-purple-200"
                style={fontStyle}
              >
                {dropOffs.verifiedNoBookingCount} membres vérifiés inactifs (0 location)
              </span>
            </div>
            <p
              className="text-[11px] font-fraunces font-normal text-purple-800/90 dark:text-purple-300 mt-1 leading-normal"
              style={fontStyle}
            >
              <strong>Pourquoi ce chiffre ?</strong> Leur permis est 100% validé par vous, mais ils n’ont pas encore fait leur premier trajet.
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-purple-800 dark:text-purple-300 bg-purple-200/50 dark:bg-purple-900/40 px-2 py-1 rounded">
                🎁 Recommandation : Envoyer un Code Promo 1ère Location (ex: -10%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

