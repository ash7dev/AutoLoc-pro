'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock, Smartphone, UserCheck, Car, AlertTriangle } from 'lucide-react';
import type { AdminOpsCommandCenterData } from '../../../core/api/adminAnalyticsApi';
import { formatXOF } from './AdminExecutiveMetrics';

import { OpsDrawerData } from './AdminOpsDrawer';

interface AdminOpsCommandCenterProps {
  data?: AdminOpsCommandCenterData;
  isLoading?: boolean;
  onSelectItem?: (item: OpsDrawerData) => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminOpsCommandCenter: React.FC<AdminOpsCommandCenterProps> = ({ data, isLoading, onSelectItem }) => {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5" />
        ))}
      </div>
    );
  }

  const { kyc, vehicles, withdrawals, disputes } = data;

  return (
    <div className="space-y-4 font-fraunces" style={fontStyle}>
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-fraunces font-normal text-[#041912] dark:text-white flex items-center gap-2"
            style={fontStyle}
          >
            <Clock className="w-5 h-5 text-emerald-600" />
            Centre de Commande & SLA Opérationnel
          </h2>
          <p
            className="text-xs font-fraunces font-normal text-slate-600 dark:text-slate-400 mt-0.5"
            style={fontStyle}
          >
            Files d'attente urgentes nécessitant l'intervention de l'équipe modération et finance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. KYC Pending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span
                  className="text-xs font-fraunces font-normal text-[#041912] dark:text-slate-200"
                  style={fontStyle}
                >
                  Vérification KYC
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-fraunces font-normal bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/60"
                style={fontStyle}
              >
                {kyc.pendingCount} en attente
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {kyc.items.length === 0 ? (
                <div
                  className="py-6 text-center text-xs font-fraunces font-normal text-slate-500 flex flex-col items-center gap-1"
                  style={fontStyle}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="font-fraunces font-normal text-slate-600" style={fontStyle}>
                    Aucun KYC en attente !
                  </span>
                </div>
              ) : (
                kyc.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-emerald-900/5">
                    <div className="truncate pr-2">
                      <div
                        className="font-fraunces font-normal text-[#041912] dark:text-white truncate"
                        style={fontStyle}
                      >
                        {item.name}
                      </div>
                      <div className="text-[11px] font-fraunces font-normal text-slate-500 truncate" style={fontStyle}>
                        {item.phone || item.email}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-fraunces font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0 border border-amber-200"
                      style={fontStyle}
                    >
                      {item.waitHours}h attente
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/users?kyc=EN_ATTENTE"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-fraunces font-normal text-amber-800 dark:text-amber-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={fontStyle}
          >
            <span className="font-fraunces font-normal" style={fontStyle}>
              Traiter les KYC ({kyc.pendingCount})
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Vehicles Pending Validation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Car className="w-4 h-4" />
                </div>
                <span
                  className="text-xs font-fraunces font-normal text-[#041912] dark:text-slate-200"
                  style={fontStyle}
                >
                  Modération Annonces
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-fraunces font-normal bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300/60"
                style={fontStyle}
              >
                {vehicles.pendingCount} à valider
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {vehicles.items.length === 0 ? (
                <div
                  className="py-6 text-center text-xs font-fraunces font-normal text-slate-500 flex flex-col items-center gap-1"
                  style={fontStyle}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="font-fraunces font-normal text-slate-600" style={fontStyle}>
                    Toutes les annonces sont validées !
                  </span>
                </div>
              ) : (
                vehicles.items.slice(0, 3).map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-emerald-900/5">
                    <div className="truncate pr-2">
                      <div
                        className="font-fraunces font-normal text-[#041912] dark:text-white truncate"
                        style={fontStyle}
                      >
                        {v.title}
                      </div>
                      <div className="text-[11px] font-fraunces font-normal text-slate-500" style={fontStyle}>
                        {v.city} • Hôte : {v.ownerName}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-fraunces font-normal text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 border border-emerald-200"
                      style={fontStyle}
                    >
                      {formatXOF(v.pricePerDay)}/j
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/vehicles?statut=EN_ATTENTE_VALIDATION"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-fraunces font-normal text-emerald-700 dark:text-emerald-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={fontStyle}
          >
            <span className="font-fraunces font-normal" style={fontStyle}>
              Inspecter la Flotte ({vehicles.pendingCount})
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. Withdrawals (Wave / Orange Money) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span
                  className="text-xs font-fraunces font-normal text-[#041912] dark:text-slate-200"
                  style={fontStyle}
                >
                  Payouts Wave / OM
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-fraunces font-normal bg-purple-100 text-purple-900 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300/60"
                style={fontStyle}
              >
                {withdrawals.pendingCount} demandes
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {withdrawals.items.length === 0 ? (
                <div
                  className="py-6 text-center text-xs font-fraunces font-normal text-slate-500 flex flex-col items-center gap-1"
                  style={fontStyle}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="font-fraunces font-normal text-slate-600" style={fontStyle}>
                    Aucun retrait en attente !
                  </span>
                </div>
              ) : (
                withdrawals.items.slice(0, 3).map((w) => (
                  <div key={w.id} className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-purple-900/5">
                    <div className="truncate pr-2">
                      <div
                        className="font-fraunces font-normal text-[#041912] dark:text-white truncate"
                        style={fontStyle}
                      >
                        {w.userName}
                      </div>
                      <div className="text-[11px] font-fraunces font-normal text-slate-500" style={fontStyle}>
                        {w.method} • {w.recipient}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-fraunces font-normal text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md shrink-0 border border-purple-200"
                      style={fontStyle}
                    >
                      {formatXOF(w.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/withdrawals"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-fraunces font-normal text-purple-700 dark:text-purple-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={fontStyle}
          >
            <span className="font-fraunces font-normal" style={fontStyle}>
              Payer les Hôtes ({formatXOF(withdrawals.totalPendingAmount)})
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. Disputes & Claims */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span
                  className="text-xs font-fraunces font-normal text-[#041912] dark:text-slate-200"
                  style={fontStyle}
                >
                  Litiges & Sinistres
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-fraunces font-normal bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300/60"
                style={fontStyle}
              >
                {disputes.pendingCount} ouvert(s)
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {disputes.items.length === 0 ? (
                <div
                  className="py-6 text-center text-xs font-fraunces font-normal text-slate-500 flex flex-col items-center gap-1"
                  style={fontStyle}
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="font-fraunces font-normal text-slate-600" style={fontStyle}>
                    Aucun litige en cours !
                  </span>
                </div>
              ) : (
                disputes.items.slice(0, 3).map((d) => (
                  <div key={d.id} className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-rose-900/5">
                    <div className="truncate pr-2">
                      <div
                        className="font-fraunces font-normal text-rose-800 dark:text-rose-300 truncate"
                        style={fontStyle}
                      >
                        {d.motif}
                      </div>
                      <div className="text-[11px] font-fraunces font-normal text-slate-500 truncate" style={fontStyle}>
                        {d.vehicle}
                      </div>
                    </div>
                    {d.estimatedCost && (
                      <span
                        className="text-[10px] font-fraunces font-normal text-rose-900 bg-rose-100 px-2 py-0.5 rounded-md shrink-0 border border-rose-200"
                        style={fontStyle}
                      >
                        {formatXOF(d.estimatedCost)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/disputes"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-fraunces font-normal text-rose-700 dark:text-rose-300 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={fontStyle}
          >
            <span className="font-fraunces font-normal" style={fontStyle}>
              Arbitrer les Litiges ({disputes.pendingCount})
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
