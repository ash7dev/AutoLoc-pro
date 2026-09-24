'use client';

import React, { useId } from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
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

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const fmt = (n: number) => n.toLocaleString('fr-FR');
const percent = (part: number, total: number) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;
const s = (n: number) => (n > 1 ? 's' : '');

const METHODS: { id: string; label: string; dot?: string }[] = [
  { id: 'ALL', label: 'Tous les canaux' },
  { id: 'WAVE', label: 'Wave', dot: 'bg-sky-400' },
  { id: 'ORANGE_MONEY', label: 'Orange Money', dot: 'bg-orange-400' },
];

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
  const uid = useId();
  const hasStats = !!stats;

  const pendingAmount = stats?.totalPendingAmount ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;

  const waveAmount = stats?.wavePendingAmount ?? 0;
  const waveCount = stats?.wavePendingCount ?? 0;

  const omAmount = stats?.omPendingAmount ?? 0;
  const omCount = stats?.omPendingCount ?? 0;

  const refundsCount = stats?.refundsPendingCount ?? 0;

  const waveShare = percent(waveAmount, pendingAmount);
  const omShare = Math.min(percent(omAmount, pendingAmount), 100 - waveShare);

  const statusTabs = [
    { id: 'EN_ATTENTE', label: 'En attente', count: pendingCount, dot: 'bg-amber-400' },
    { id: 'EFFECTUE', label: 'Effectués', count: stats?.approvedCount ?? 0, dot: 'bg-emerald-400' },
    { id: 'REJETE', label: 'Rejetés', count: stats?.rejectedCount ?? 0, dot: 'bg-rose-400' },
    { id: 'REMBOURSEMENTS', label: 'Remboursements', count: refundsCount, dot: 'bg-teal-300' },
    { id: 'ALL', label: 'Toutes les transactions', count: totalItems },
  ] as { id: string; label: string; count: number; dot?: string }[];

  const amount = (n: number) => (hasStats ? fmt(n) : '–');

  return (
    <div className="space-y-6">
      {/* Synthèse */}
      <section
        aria-label="Synthèse des reversements"
        className="relative overflow-hidden rounded-[28px] border border-[#F1DFB6]/15 bg-[#0A3D2E] p-6 text-white shadow-[0_24px_60px_-24px_rgba(10,61,46,0.6)] sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h1
              style={DISPLAY_FONT}
              className="text-3xl leading-tight tracking-tight text-[#F1DFB6] sm:text-4xl"
            >
              Payouts et wallets
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/75">
              Validez les virements Wave, traitez les retraits Orange Money et suivez les
              remboursements.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-busy={isRefreshing}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#F1DFB6]/30 px-4 py-2 text-sm font-medium text-[#F1DFB6] transition hover:bg-[#F1DFB6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`}
            />
            Actualiser
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* Montant principal */}
          <div className="flex flex-col justify-end">
            <p className="text-sm text-emerald-100/75">En attente de traitement</p>
            <div
              style={DISPLAY_FONT}
              className="mt-1 flex flex-wrap items-baseline gap-x-3 leading-none tabular-nums"
            >
              <span className="text-5xl text-white sm:text-6xl">{amount(pendingAmount)}</span>
              <span className="text-xl text-[#F1DFB6]/80">FCFA</span>
            </div>
            <p className="mt-3 text-sm text-emerald-100/75">
              {hasStats
                ? `${pendingCount} demande${s(pendingCount)} en attente`
                : 'Chargement des statistiques'}
            </p>

            <div
              role="img"
              aria-label={`Répartition du montant en attente : Wave ${waveShare} %, Orange Money ${omShare} %`}
              className="mt-6 flex h-2 overflow-hidden rounded-full bg-white/10"
            >
              <div className="bg-sky-400" style={{ width: `${waveShare}%` }} />
              <div className="bg-orange-400" style={{ width: `${omShare}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-emerald-100/75">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Wave {hasStats ? `${waveShare} %` : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                Orange Money {hasStats ? `${omShare} %` : ''}
              </span>
            </div>
          </div>

          {/* Détail par canal */}
          <dl className="divide-y divide-[#F1DFB6]/15 border-y border-[#F1DFB6]/15">
            <div className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="inline-flex items-center gap-2 text-sm text-emerald-100/80">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Wave
                </dt>
                <dd style={DISPLAY_FONT} className="text-2xl tabular-nums text-white">
                  {amount(waveAmount)}
                  <span className="ml-1.5 text-sm text-[#F1DFB6]/70">FCFA</span>
                </dd>
              </div>
              <p className="mt-1 text-xs text-emerald-100/60">
                {waveCount} virement{s(waveCount)} automatique{s(waveCount)} à vérifier
              </p>
            </div>

            <div className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="inline-flex items-center gap-2 text-sm text-emerald-100/80">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  Orange Money
                </dt>
                <dd style={DISPLAY_FONT} className="text-2xl tabular-nums text-white">
                  {amount(omAmount)}
                  <span className="ml-1.5 text-sm text-[#F1DFB6]/70">FCFA</span>
                </dd>
              </div>
              <p className="mt-1 text-xs text-emerald-100/60">
                {omCount} virement{s(omCount)} manuel{s(omCount)} à valider
              </p>
            </div>

            <div className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-emerald-100/80">Remboursements</dt>
                <dd style={DISPLAY_FONT} className="text-2xl tabular-nums text-[#F1DFB6]">
                  {hasStats ? refundsCount : '–'}
                  <span className="ml-1.5 text-sm text-[#F1DFB6]/70">
                    dossier{s(refundsCount)}
                  </span>
                </dd>
              </div>
              <p className="mt-1 text-xs text-emerald-100/60">
                Annulations en cours de remboursement
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* Recherche et filtres */}
      <section
        aria-label="Recherche et filtres"
        className="rounded-[28px] border border-[#0A3D2E]/10 bg-white p-4 shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)] sm:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Recherche */}
          <div className="relative w-full md:w-96">
            <label htmlFor={`${uid}-search`} className="sr-only">
              Rechercher un retrait
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id={`${uid}-search`}
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Nom de l'hôte, téléphone, ID de retrait"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/25 [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Méthode */}
          <div
            role="radiogroup"
            aria-label="Filtrer par canal"
            className="inline-flex self-start rounded-full bg-[#0A3D2E]/[0.06] p-1 md:self-auto"
          >
            {METHODS.map((m) => {
              const selected = methode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onMethodeChange(m.id)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${selected
                      ? 'bg-[#0A3D2E] text-[#F1DFB6] shadow'
                      : 'text-gray-600 hover:text-[#0A3D2E]'
                    }`}
                >
                  {m.dot && <span className={`h-2 w-2 rounded-full ${m.dot}`} />}
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Statuts */}
        <div
          role="group"
          aria-label="Filtrer par statut"
          className="mt-4 flex items-center gap-2 overflow-x-auto border-t border-gray-100 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {statusTabs.map((tab) => {
            const isActive = statut === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onStatutChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ring-1 ring-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${isActive
                    ? 'bg-[#0A3D2E] text-[#F1DFB6] ring-[#0A3D2E]'
                    : 'bg-white text-gray-600 ring-gray-200 hover:text-[#0A3D2E] hover:ring-[#0A3D2E]/40'
                  }`}
              >
                {tab.dot && <span className={`h-2 w-2 rounded-full ${tab.dot}`} />}
                {tab.label}
                <span
                  className={`rounded-full px-2 text-xs tabular-nums ${isActive ? 'bg-[#F1DFB6]/20 text-[#F1DFB6]' : 'bg-[#0A3D2E]/[0.07] text-[#0A3D2E]'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};