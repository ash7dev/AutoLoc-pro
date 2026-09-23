'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Car, UserCheck, RefreshCw } from 'lucide-react';

interface AdminVehicleHeaderBarProps {
  statut: string;
  onStatutChange: (statut: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  counts?: {
    pending: number;
    verified: number;
    suspended: number;
    draft: number;
    total: number;
  };
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const SLATE = '#4a5f75';

export const AdminVehicleHeaderBar: React.FC<AdminVehicleHeaderBarProps> = ({
  statut,
  onStatutChange,
  search,
  onSearchChange,
  counts,
  isRefreshing,
  onRefresh,
}) => {
  const tabs = [
    { id: 'EN_ATTENTE_VALIDATION', label: 'En attente', count: counts?.pending ?? 0, tone: GOLD, bg: 'rgba(178, 124, 45, 0.1)' },
    { id: 'VERIFIE', label: 'Vérifiés', count: counts?.verified ?? 0, tone: FOREST, bg: 'rgba(10, 61, 46, 0.08)' },
    { id: 'SUSPENDU', label: 'Suspendus', count: counts?.suspended ?? 0, tone: RUST, bg: 'rgba(161, 61, 61, 0.1)' },
    { id: 'BROUILLON', label: 'Brouillons', count: counts?.draft ?? 0, tone: SLATE, bg: 'rgba(74, 95, 117, 0.1)' },
    { id: 'ALL', label: 'Tous', count: counts?.total ?? 0, tone: SLATE, bg: 'rgba(74, 95, 117, 0.1)' },
  ];

  return (
    <div className="space-y-4" style={fontStyle}>
      {/* Navigation Switch & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{ background: `linear-gradient(135deg, ${FOREST}, #062a1f)` }}
          >
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-normal text-[#041912] dark:text-white">Modération des Véhicules</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0A3D2E]/10 text-[#0A3D2E] dark:bg-[#F1DFB6]/20 dark:text-[#F1DFB6]">
                Flotte Sénégal
              </span>
            </div>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
              Contrôle de conformité de la Carte Grise, Attestation d'Assurance, Photos HD et Tarification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to KYC */}
          <Link
            href="/admin/kyc"
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#041912] dark:hover:text-white transition-all flex items-center gap-2 text-xs font-medium"
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Passer à la modération KYC</span>
          </Link>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:text-[#041912] dark:hover:text-white transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = statut === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatutChange(tab.id)}
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
            placeholder="Marque, Modèle, Plaque DK-xxx, Hôte, Ville..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-transparent focus:ring-2"
            style={{ ['--tw-ring-color' as any]: 'rgba(10, 61, 46, 0.35)' }}
          />
        </div>
      </div>
    </div>
  );
};
