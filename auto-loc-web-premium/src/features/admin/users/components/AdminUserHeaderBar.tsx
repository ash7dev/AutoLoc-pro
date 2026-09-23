'use client';

import React from 'react';
import { Search, X, RefreshCw, Filter, Users } from 'lucide-react';

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

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };
const FOREST = '#0A3D2E';
const FOREST_DARK = '#062a1f';
const GOLD = '#b27c2d';

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
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-[0_10px_40px_-26px_rgba(10,61,46,0.4)]"
      style={fontStyle}
    >

      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white"
            style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
          >
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight">
                Gestion & Modération des Membres
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border"
                style={{ background: 'rgba(10,61,46,0.08)', color: FOREST, borderColor: 'rgba(10,61,46,0.18)' }}
              >
                {totalItems} utilisateurs
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supervision 360°, contrôle des identités KYC, gestion des droits et modération des comptes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              style={isRefreshing ? { color: FOREST } : undefined}
            />
            Actualiser
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Role & Status Pill Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" style={{ color: GOLD }} /> Rôle:
            </span>
            {roleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRole(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${role === tab.id
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
                  }`}
                style={role === tab.id ? { background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` } : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              Statut:
            </span>
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${status === tab.id
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
                  }`}
                style={status === tab.id ? { background: `linear-gradient(135deg, #1e293b, #0f172a)` } : undefined}
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
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 transition-all duration-200"
            style={{
              ['--tw-ring-color' as string]: 'rgba(10,61,46,0.35)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = FOREST)}
            onBlur={(e) => (e.currentTarget.style.borderColor = '')}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}