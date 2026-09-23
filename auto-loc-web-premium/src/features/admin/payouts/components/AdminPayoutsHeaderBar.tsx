'use client';

import React from 'react';
import {
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';
import type { AdminPayoutStats } from '../../../../core/api/adminPayoutsApi';

interface AdminPayoutsHeaderBarProps {
  statut: string;
  onStatutChange: (newStatut: string) => void;
  methode: string;
  onMethodeChange: (newMethode: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  stats?: AdminPayoutStats;
  totalItems: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const AdminPayoutsHeaderBar: React.FC<AdminPayoutsHeaderBarProps> = ({
  statut,
  onStatutChange,
  methode,
  onMethodeChange,
  search,
  onSearchChange,
  stats,
  totalItems,
  isRefreshing,
  onRefresh,
}) => {
  const pendingAmount = stats?.totalPendingAmount ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;

  const waveAmount = stats?.wavePendingAmount ?? 0;
  const waveCount = stats?.wavePendingCount ?? 0;

  const omAmount = stats?.omPendingAmount ?? 0;
  const omCount = stats?.omPendingCount ?? 0;

  const refundsCount = stats?.refundsPendingCount ?? 0;

  const statusTabs = [
    { id: 'EN_ATTENTE', label: 'En attente', count: pendingCount, color: 'amber' },
    { id: 'EFFECTUE', label: 'Effectués', count: stats?.approvedCount ?? 0, color: 'emerald' },
    { id: 'REJETE', label: 'Rejetés', count: stats?.rejectedCount ?? 0, color: 'rose' },
    { id: 'REMBOURSEMENTS', label: 'Remboursements', count: refundsCount, color: 'cyan' },
    { id: 'ALL', label: 'Toutes les transactions', count: totalItems, color: 'slate' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A3D2E] text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/50 text-[11px] font-bold text-[#F1DFB6] tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-[#F1DFB6]" />
            <span>Audit Financier & Reversements Hôtes 360°</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Centre de Contrôle Payouts & Wallets
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Validez les virements Wave automatiques, traitez les retraits Orange Money et contrôlez les remboursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* 4 Cartes KPI Financières Haut de Gamme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Retraits en Attente */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              En Attente Globale
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono tracking-tight">
            {pendingAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-amber-700">FCFA</span>
          </div>
          <p className="text-[11px] text-amber-800/80 font-medium mt-1">
            {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente de traitement
          </p>
        </div>

        {/* KPI 2 : Wave Automatique */}
        <div className="p-5 rounded-2xl bg-white border border-cyan-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌊 Wave Payouts</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-950 font-mono tracking-tight">
            {waveAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-cyan-700">FCFA</span>
          </div>
          <p className="text-[11px] text-cyan-800/80 font-medium mt-1">
            {waveCount} virement{waveCount > 1 ? 's' : ''} auto à vérifier
          </p>
        </div>

        {/* KPI 3 : Orange Money Manuel */}
        <div className="p-5 rounded-2xl bg-white border border-orange-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🟠 Orange Money</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-950 font-mono tracking-tight">
            {omAmount.toLocaleString('fr-FR')} <span className="text-xs font-bold text-orange-700">FCFA</span>
          </div>
          <p className="text-[11px] text-orange-800/80 font-medium mt-1">
            {omCount} virement{omCount > 1 ? 's' : ''} manuels à valider
          </p>
        </div>

        {/* KPI 4 : Remboursements Locataires */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Remboursements
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-950 font-mono tracking-tight">
            {refundsCount} <span className="text-xs font-bold text-rose-700">Dossiers</span>
          </div>
          <p className="text-[11px] text-rose-800/80 font-medium mt-1">
            Annulations en cours de remboursement
          </p>
        </div>
      </div>

      {/* Barre de Recherche et Onglets de Filtrage */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Recherche Instantanée */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par nom hôte, tél, ID retrait ou Wave/OM..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0A3D2E] focus:bg-white transition-all"
            />
          </div>

          {/* Filtre par Méthode (WAVE vs OM vs ALL) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onMethodeChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methode === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous canaux
            </button>
            <button
              type="button"
              onClick={() => onMethodeChange('WAVE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methode === 'WAVE'
                  ? 'bg-cyan-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌊 Wave
            </button>
            <button
              type="button"
              onClick={() => onMethodeChange('ORANGE_MONEY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                methode === 'ORANGE_MONEY'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟠 Orange Money
            </button>
          </div>
        </div>

        {/* Onglets de Statuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          {statusTabs.map((tab) => {
            const isActive = statut === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatutChange(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0A3D2E] text-[#F1DFB6] border-[#0A3D2E] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-[#F1DFB6] text-[#0A3D2E]'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
