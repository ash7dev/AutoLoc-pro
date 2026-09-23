'use client';

import React from 'react';
import { Search, X, RefreshCw, Filter } from 'lucide-react';

interface AdminUserHeaderBarProps {
  role: string;
  setRole: (role: string) => void;
  status: string;
  setStatus: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  totalItems: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function AdminUserHeaderBar({
  role,
  setRole,
  status,
  setStatus,
  search,
  setSearch,
  totalItems,
  isRefreshing,
  onRefresh,
}: AdminUserHeaderBarProps) {
  const roleTabs = [
    { id: 'ALL', label: 'Tous les rôles' },
    { id: 'LOCATAIRE', label: 'Locataires' },
    { id: 'PROPRIETAIRE', label: 'Propriétaires' },
    { id: 'ADMIN', label: 'Administrateurs' },
    { id: 'SUPPORT', label: 'Support' },
  ];

  const statusTabs = [
    { id: 'ALL', label: 'Tous statuts' },
    { id: 'ACTIVE', label: 'Actifs' },
    { id: 'PENDING_KYC', label: 'KYC en attente' },
    { id: 'STUCK_ONBOARDING', label: 'Incomplets (Non finalisés)' },
    { id: 'BANNED', label: 'Suspendus / Bannis' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 space-y-4 shadow-sm">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Gestion & Modération des Membres
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              {totalItems} utilisateurs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervision 360°, contrôle des identités KYC, gestion des droits et modération des comptes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        {/* Role & Status Pill Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-emerald-600" /> Rôle:
            </span>
            {roleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRole(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  role === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1">
              Statut:
            </span>
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  status === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, email, téléphone, ID..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
