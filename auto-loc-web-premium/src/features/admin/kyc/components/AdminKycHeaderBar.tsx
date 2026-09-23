'use client';

import React from 'react';
import { Search, UserCheck, Clock, ShieldAlert, RefreshCw, Filter } from 'lucide-react';

interface AdminKycHeaderBarProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts?: {
    EN_ATTENTE: number;
    VERIFIE: number;
    REJETE: number;
    NON_VERIFIE: number;
  };
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const CHAMPAGNE = '#F1DFB6';

export const AdminKycHeaderBar: React.FC<AdminKycHeaderBarProps> = ({
  status,
  onStatusChange,
  search,
  onSearchChange,
  counts,
  isRefreshing,
  onRefresh,
}) => {
  const tabs = [
    { id: 'EN_ATTENTE', label: 'En attente', count: counts?.EN_ATTENTE ?? 0, color: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300' },
    { id: 'VERIFIE', label: 'Vérifiés', count: counts?.VERIFIE ?? 0, color: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300' },
    { id: 'REJETE', label: 'Rejetés', count: counts?.REJETE ?? 0, color: 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-300' },
    { id: 'ALL', label: 'Tous', count: (counts?.EN_ATTENTE ?? 0) + (counts?.VERIFIE ?? 0) + (counts?.REJETE ?? 0) + (counts?.NON_VERIFIE ?? 0), color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  ];

  return (
    <div className="space-y-4 font-fraunces" style={fontStyle}>
      {/* Page Title & SLA Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(10, 61, 46, 0.08)' }}>
              <UserCheck className="w-5 h-5" style={{ color: FOREST }} />
            </div>
            <div>
              <h1 className="text-xl font-normal text-[#041912] dark:text-white">Modération & Vérification KYC</h1>
              <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                Contrôle de conformité des cartes d'identité, permis de conduire et selfies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Inputs */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-normal transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#041912] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tabular-nums ${tab.color}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Instant Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par Nom, Email, Téléphone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
