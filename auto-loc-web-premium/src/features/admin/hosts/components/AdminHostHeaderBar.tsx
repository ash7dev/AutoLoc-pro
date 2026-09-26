'use client';

import React, { useEffect, useRef } from 'react';
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
const CHAMPAGNE = '#F1DFB6';
const GOLD = '#b27c2d';
const RUST = '#a13d3d';
const SLATE = '#4a5f75';

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main dark:focus-visible:outline-champagne';

// "–" tant que les compteurs ne sont pas chargés (évite d'afficher un faux 0)
const fmt = (n?: number) => (n === undefined ? '–' : n.toLocaleString('fr-FR'));

export const AdminHostHeaderBar: React.FC<AdminHostHeaderBarProps> = ({
  status,
  onStatusChange,
  search,
  onSearchChange,
  counts,
  isRefreshing,
  onRefresh,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  // Raccourci "/" pour focaliser la recherche
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const tabs = [
    { id: 'ALL', label: 'Tous', count: counts?.total, tone: SLATE, bg: 'rgba(74, 95, 117, 0.12)' },
    { id: 'ACTIVE', label: 'Actifs', count: counts?.active, tone: FOREST, bg: 'rgba(10, 61, 46, 0.10)' },
    { id: 'PENDING_KYC', label: 'KYC en attente', count: counts?.pendingKyc, tone: GOLD, bg: 'rgba(178, 124, 45, 0.14)' },
    { id: 'BANNED', label: 'Suspendus / bannis', count: counts?.banned, tone: RUST, bg: 'rgba(161, 61, 61, 0.12)' },
  ];

  // Répartition de la base d'hôtes (barre fine en bas de la carte de filtres)
  const total = counts?.total ?? 0;
  const other = counts ? Math.max(total - counts.active - counts.pendingKyc - counts.banned, 0) : 0;
  const segments = counts
    ? [
      { key: 'active', value: counts.active, color: FOREST },
      { key: 'kyc', value: counts.pendingKyc, color: GOLD },
      { key: 'banned', value: counts.banned, color: RUST },
      { key: 'other', value: other, color: '#cbd5e1' },
    ].filter((s) => s.value > 0)
    : [];

  return (
    <div className="space-y-5" style={fontStyle}>
      {/* Titre + actualisation */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-inset ring-champagne/25"
            style={{ backgroundColor: FOREST }}
          >
            <Building2 className="w-5 h-5" style={{ color: CHAMPAGNE }} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-2xl leading-tight tracking-tight font-normal text-brand-dark dark:text-white">
              Hôtes et flottes
            </h1>
            <p className="text-[13px] leading-snug text-slate-500 dark:text-slate-400 mt-1 font-sans">
              Propriétaires, conformité KYC et modération des annonces
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Actualiser la liste"
          className={`shrink-0 h-10 px-3 sm:px-4 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-brand-main/40 hover:bg-brand-main/[0.03] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-[13px] font-semibold cursor-pointer font-sans ${FOCUS}`}
        >
          <RefreshCw
            className={`w-4 h-4 text-brand-main dark:text-champagne ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
          />
          <span className="hidden sm:inline">{isRefreshing ? 'Actualisation…' : 'Actualiser'}</span>
        </button>
      </div>

      {/* Filtres + recherche */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs font-sans">
        <div className="p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Onglets de statut */}
          <div
            role="tablist"
            aria-label="Filtrer les hôtes par statut"
            className="flex items-center gap-1 overflow-x-auto scrollbar-none p-0.5"
          >
            {tabs.map((tab) => {
              const isActive = status === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onStatusChange(tab.id)}
                  className={`flex items-center gap-2 h-10 pl-3.5 pr-2.5 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${FOCUS} ${isActive
                      ? 'text-champagne dark:ring-1 dark:ring-champagne/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  style={isActive ? { backgroundColor: FOREST } : undefined}
                >
                  <span>{tab.label}</span>
                  <span
                    className="min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums text-center"
                    style={
                      isActive
                        ? { backgroundColor: 'rgba(241, 223, 182, 0.18)', color: CHAMPAGNE }
                        : { backgroundColor: tab.bg, color: tab.tone }
                    }
                  >
                    {fmt(tab.count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recherche */}
          <div role="search" className="relative w-full lg:max-w-sm">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nom, email, téléphone, immatriculation"
              aria-label="Rechercher un hôte"
              autoComplete="off"
              className="w-full h-10 pl-10 pr-10 text-base sm:text-[13px] rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-colors focus:border-brand-main focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-brand-main/10"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchRef.current?.focus();
                }}
                aria-label="Effacer la recherche"
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:text-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${FOCUS}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 h-5 min-w-5 px-1.5 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-400"
              >
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Répartition de la base d'hôtes */}
        {counts && total > 0 && (
          <div
            role="img"
            aria-label={`Répartition : ${counts.active} actifs, ${counts.pendingKyc} KYC en attente, ${counts.banned} suspendus ou bannis, sur ${total} hôtes`}
            className="flex h-1 w-full bg-slate-100 dark:bg-slate-800"
          >
            {segments.map((s) => (
              <div
                key={s.key}
                className="h-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};