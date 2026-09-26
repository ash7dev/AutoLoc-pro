'use client';

import React from 'react';
import { Search, UserCheck, RefreshCw } from 'lucide-react';

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
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const SLATE = '#4a5f75';

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
    { id: 'EN_ATTENTE', label: 'En attente', count: counts?.EN_ATTENTE ?? 0, tone: GOLD, bg: 'rgba(178, 124, 45, 0.1)' },
    { id: 'VERIFIE', label: 'Vérifiés', count: counts?.VERIFIE ?? 0, tone: FOREST, bg: 'rgba(10, 61, 46, 0.08)' },
    { id: 'REJETE', label: 'Rejetés', count: counts?.REJETE ?? 0, tone: RUST, bg: 'rgba(161, 61, 61, 0.1)' },
    {
      id: 'ALL',
      label: 'Tous',
      count: (counts?.EN_ATTENTE ?? 0) + (counts?.VERIFIE ?? 0) + (counts?.REJETE ?? 0) + (counts?.NON_VERIFIE ?? 0),
      tone: SLATE,
      bg: 'rgba(74, 95, 117, 0.1)',
    },
  ];

  return (
    <div className="space-y-4" style={fontStyle}>
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
          >
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-normal text-brand-dark dark:text-white">Modération & vérification KYC</h1>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Contrôle de conformité des cartes d'identité, permis de conduire et selfies
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="shrink-0 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-brand-dark dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-normal transition-all shrink-0"
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${FOREST}, #062a1f)`, color: 'white' }
                    : { color: '#475569' }
                }
              >
                <span>{tab.label}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium tabular-nums"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }
                      : { backgroundColor: tab.bg, color: tab.tone }
                  }
                >
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
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-transparent focus:ring-2"
            style={{ ['--tw-ring-color' as any]: 'rgba(10, 61, 46, 0.35)' }}
          />
        </div>
      </div>
    </div>
  );
};