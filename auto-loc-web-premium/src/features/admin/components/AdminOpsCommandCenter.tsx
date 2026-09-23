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

const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';
const SLATE = '#4a5f75';
const RUST = '#a13d3d';

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

  const EmptyState = ({ label }: { label: string }) => (
    <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
      <CheckCircle2 className="w-5 h-5" style={{ color: FOREST }} />
      <span className="font-normal text-slate-500">{label}</span>
    </div>
  );

  return (
    <div className="space-y-4" style={fontStyle}>
      <div>
        <h2 className="text-lg font-normal text-[#041912] dark:text-white flex items-center gap-2">
          <Clock className="w-4.5 h-4.5" style={{ color: FOREST }} />
          Centre de commande & SLA opérationnel
        </h2>
        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
          Files d'attente urgentes nécessitant l'intervention de l'équipe modération et finance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. KYC Pending */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(178, 124, 45, 0.1)' }}>
                  <UserCheck className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <span className="text-xs font-normal text-[#041912] dark:text-slate-200">Vérification KYC</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums" style={{ backgroundColor: 'rgba(178, 124, 45, 0.12)', color: GOLD }}>
                {kyc.pendingCount}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {kyc.items.length === 0 ? (
                <EmptyState label="Aucun KYC en attente" />
              ) : (
                kyc.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      onSelectItem?.({
                        type: 'kyc',
                        id: item.id,
                        title: item.name,
                        email: item.email,
                        phone: item.phone,
                        submittedAt: item.submittedAt,
                        waitHours: item.waitHours,
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-800 hover:border-[#b27c2d]/50 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="font-normal text-[#041912] dark:text-white truncate">{item.name}</div>
                      <div className="text-[11px] font-normal text-slate-500 truncate">{item.phone || item.email}</div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: 'rgba(178, 124, 45, 0.1)', color: GOLD }}>
                      {item.waitHours}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/users?kyc=EN_ATTENTE"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-normal hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={{ color: GOLD }}
          >
            Traiter les KYC ({kyc.pendingCount})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. Vehicles Pending Validation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
                  <Car className="w-4 h-4" style={{ color: FOREST }} />
                </div>
                <span className="text-xs font-normal text-[#041912] dark:text-slate-200">Modération annonces</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST }}>
                {vehicles.pendingCount}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {vehicles.items.length === 0 ? (
                <EmptyState label="Toutes les annonces sont validées" />
              ) : (
                vehicles.items.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() =>
                      onSelectItem?.({
                        type: 'vehicle',
                        id: v.id,
                        title: v.title,
                        city: v.city,
                        pricePerDay: v.pricePerDay,
                        ownerName: v.ownerName,
                        submittedAt: v.submittedAt,
                        waitHours: v.waitHours,
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-800 hover:border-[#0A3D2E]/40 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="font-normal text-[#041912] dark:text-white truncate">{v.title}</div>
                      <div className="text-[11px] font-normal text-slate-500">{v.city} • Hôte : {v.ownerName}</div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)', color: FOREST }}>
                      {formatXOF(v.pricePerDay)}/j
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/vehicles?statut=EN_ATTENTE_VALIDATION"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-normal hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={{ color: FOREST }}
          >
            Inspecter la flotte ({vehicles.pendingCount})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. Withdrawals (Wave / Orange Money) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(74, 95, 117, 0.1)' }}>
                  <Smartphone className="w-4 h-4" style={{ color: SLATE }} />
                </div>
                <span className="text-xs font-normal text-[#041912] dark:text-slate-200">Payouts Wave / OM</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums" style={{ backgroundColor: 'rgba(74, 95, 117, 0.12)', color: SLATE }}>
                {withdrawals.pendingCount}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {withdrawals.items.length === 0 ? (
                <EmptyState label="Aucun retrait en attente" />
              ) : (
                withdrawals.items.slice(0, 3).map((w) => (
                  <div
                    key={w.id}
                    onClick={() =>
                      onSelectItem?.({
                        type: 'withdrawal',
                        id: w.id,
                        title: `Demande de ${w.userName}`,
                        amount: w.amount,
                        method: w.method,
                        recipient: w.recipient,
                        submittedAt: w.requestedAt,
                        waitHours: w.waitHours,
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-800 hover:border-[#4a5f75]/50 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="font-normal text-[#041912] dark:text-white truncate">{w.userName}</div>
                      <div className="text-[11px] font-normal text-slate-500">{w.method} • {w.recipient}</div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: 'rgba(74, 95, 117, 0.1)', color: SLATE }}>
                      {formatXOF(w.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/admin/withdrawals"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-normal hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={{ color: SLATE }}
          >
            Payer les hôtes ({formatXOF(withdrawals.totalPendingAmount)})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. Disputes & Claims */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(161, 61, 61, 0.1)' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: RUST }} />
                </div>
                <span className="text-xs font-normal text-[#041912] dark:text-slate-200">Litiges & sinistres</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums" style={{ backgroundColor: 'rgba(161, 61, 61, 0.12)', color: RUST }}>
                {disputes.pendingCount}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {disputes.items.length === 0 ? (
                <EmptyState label="Aucun litige en cours" />
              ) : (
                disputes.items.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() =>
                      onSelectItem?.({
                        type: 'dispute',
                        id: d.id,
                        title: d.motif,
                        motif: d.motif,
                        vehicle: d.vehicle,
                        renterName: d.renterName,
                        ownerName: d.ownerName,
                        estimatedCost: d.estimatedCost,
                        submittedAt: d.createdAt,
                      })
                    }
                    className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-800 hover:border-[#a13d3d]/50 cursor-pointer transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="font-normal truncate" style={{ color: RUST }}>{d.motif}</div>
                      <div className="text-[11px] font-normal text-slate-500 truncate">{d.vehicle}</div>
                    </div>
                    {d.estimatedCost && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: 'rgba(161, 61, 61, 0.1)', color: RUST }}>
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
            className="mt-4 flex items-center justify-center gap-1 text-xs font-normal hover:underline pt-2 border-t border-slate-100 dark:border-slate-800/80"
            style={{ color: RUST }}
          >
            Arbitrer les litiges ({disputes.pendingCount})
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};