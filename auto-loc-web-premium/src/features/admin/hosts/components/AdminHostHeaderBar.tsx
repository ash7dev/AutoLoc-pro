'use client';

import React from 'react';
import { Search, Building2, RefreshCw, X } from 'lucide-react';

interface AdminHostHeaderBarProps {
  status: string;
  onStatusChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts?: {
    total: number;
    active: number;
    pendingKyc: number;
    banned: number;
  };
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const SLATE = '#4a5f75';

export const AdminHostHeaderBar: React.FC<AdminHostHeaderBarProps> = ({
  status,
  onStatusChange,
  search,
  onSearchChange,
  counts,
  isRefreshing,
  onRefresh,
}) => {
  const tabs = [
    {
      id: 'ALL',
      label: 'Tous les hôtes',
      count: counts?.total ?? 0,
      tone: SLATE,
      bg: 'rgba(74, 95, 117, 0.1)',
    },
    {
      id: 'ACTIVE',
      label: 'Hôtes Actifs',
      count: counts?.active ?? 0,
      tone: FOREST,
      bg: 'rgba(10, 61, 46, 0.08)',
    },
    {
      id: 'PENDING_KYC',
      label: 'KYC En Attente',
      count: counts?.pendingKyc ?? 0,
      tone: GOLD,
      bg: 'rgba(178, 124, 45, 0.1)',
    },
    {
      id: 'BANNED',
      label: 'Suspendus / Bannis',
      count: counts?.banned ?? 0,
      tone: RUST,
      bg: 'rgba(161, 61, 61, 0.1)',
    },
  ];

  return (
    <div className="space-y-4" style={fontStyle}>
      {/* Title & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
          >
            <Building2 className="w-5 h-5 text-[#F1DFB6]" />
          </div>
          <div>
            <h1 className="text-xl font-normal text-[#041912] dark:text-white">
              Administration des Hôtes & Flottes
            </h1>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              Gouvernance des propriétaires, audit de risque 360°, conformité KYC et modération de flotte
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="shrink-0 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#0A3D2E]/30 transition-all flex items-center gap-2 text-xs font-semibold shadow-2xs cursor-pointer font-sans"
        >
          <RefreshCw className={`w-4 h-4 text-[#0A3D2E] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-sans">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
                style={
                  isActive
                    ? { background: `linear-gradient(135deg, ${FOREST}, #062a1f)`, color: '#F1DFB6' }
                    : { color: '#475569' }
                }
              >
                <span>{tab.label}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(241, 223, 182, 0.2)', color: '#F1DFB6' }
                      : { backgroundColor: tab.bg, color: tab.tone }
                  }
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nom, email, tél, immatriculation..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
