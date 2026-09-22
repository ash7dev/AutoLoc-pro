'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck2,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

export interface OwnerReservationStats {
  total: number;
  enAttente: number;
  enCours: number;
  confirmees: number;
  terminees: number;
  annulees: number;
}

export interface OwnerReservationsHeaderProps {
  stats?: OwnerReservationStats;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const STATUS_FILTERS = [
  { id: 'ALL', label: 'Toutes', icon: CalendarDays },
  { id: 'EN_ATTENTE', label: 'En attente', icon: Clock },
  { id: 'CONFIRMEE', label: 'Confirmées', icon: CheckCircle2 },
  { id: 'EN_COURS', label: 'En cours', icon: Car },
  { id: 'TERMINEE', label: 'Terminées', icon: ShieldCheck },
  { id: 'ANNULEE', label: 'Annulées', icon: XCircle },
];

/**
 * Une tuile KPI cliquable qui sert aussi de filtre rapide.
 * Un seul composant paramétrable au lieu de quatre blocs dupliqués :
 * plus facile à maintenir et garantit une cohérence visuelle stricte
 * entre les quatre métriques.
 */
interface KpiTileProps {
  label: string;
  value: number;
  icon: React.ElementType;
  active: boolean;
  accent: 'forest' | 'amber' | 'emerald' | 'blue';
  helper?: string;
  onClick?: () => void;
}

const ACCENTS: Record<
  KpiTileProps['accent'],
  {
    activeBg: string;
    activeGlow: string;
    activeBorder: string;
    iconActiveBg: string;
    iconIdleBg: string;
    labelIdle: string;
    labelActive: string;
    valueIdle: string;
  }
> = {
  forest: {
    activeBg: 'bg-gradient-to-br from-[#0A3D2E] to-[#041912]',
    activeGlow: 'shadow-[0_10px_30px_-8px_rgba(4,25,18,0.55)]',
    activeBorder: 'border-[#0A3D2E]',
    iconActiveBg: 'bg-[#4ADE80]/15 text-[#4ADE80] ring-1 ring-[#4ADE80]/25',
    iconIdleBg: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70',
    labelIdle: 'text-slate-500',
    labelActive: 'text-[#4ADE80]/90',
    valueIdle: 'text-[#041912]',
  },
  amber: {
    activeBg: 'bg-gradient-to-br from-[#4A360F] to-[#2E2007]',
    activeGlow: 'shadow-[0_10px_30px_-8px_rgba(120,53,15,0.45)]',
    activeBorder: 'border-[#3A2A0E]',
    iconActiveBg: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25',
    iconIdleBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    labelIdle: 'text-amber-700/80',
    labelActive: 'text-amber-300/90',
    valueIdle: 'text-[#041912]',
  },
  emerald: {
    activeBg: 'bg-gradient-to-br from-[#0F5C43] to-[#0A3D2E]',
    activeGlow: 'shadow-[0_10px_30px_-8px_rgba(10,61,46,0.5)]',
    activeBorder: 'border-[#0A3D2E]',
    iconActiveBg: 'bg-[#4ADE80]/15 text-[#4ADE80] ring-1 ring-[#4ADE80]/25',
    iconIdleBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    labelIdle: 'text-emerald-700/80',
    labelActive: 'text-[#F1DFB6]/90',
    valueIdle: 'text-[#041912]',
  },
  blue: {
    activeBg: 'bg-gradient-to-br from-[#123A6B] to-[#0B2447]',
    activeGlow: 'shadow-[0_10px_30px_-8px_rgba(11,36,71,0.5)]',
    activeBorder: 'border-[#0B2447]',
    iconActiveBg: 'bg-blue-400/15 text-blue-300 ring-1 ring-blue-400/25',
    iconIdleBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    labelIdle: 'text-blue-700/80',
    labelActive: 'text-blue-300/90',
    valueIdle: 'text-[#041912]',
  },
};

const KpiTile: React.FC<KpiTileProps> = ({ label, value, icon: Icon, active, accent, helper, onClick }) => {
  const a = ACCENTS[accent];
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669] sm:p-5 ${active
          ? `${a.activeBg} ${a.activeBorder} ${a.activeGlow} text-white`
          : 'border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(4,25,18,0.04)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_-10px_rgba(4,25,18,0.15)]'
        }`}
    >
      {/* Lueur décorative subtile en fond, uniquement à l'état actif */}
      {active && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      )}

      <div className="relative flex items-center justify-between gap-2">
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${active ? a.labelActive : a.labelIdle}`}>
          {label}
        </span>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? a.iconActiveBg : a.iconIdleBg
            }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-3 flex items-baseline justify-between gap-2">
        <span
          className={`font-fraunces text-2xl leading-none tabular-nums sm:text-3xl ${active ? 'text-white' : a.valueIdle
            }`}
        >
          {value}
        </span>
        {helper && (
          <span className={`text-[11px] font-medium ${active ? 'text-white/60' : 'text-slate-400'}`}>{helper}</span>
        )}
      </div>
    </motion.button>
  );
};

export const OwnerReservationsHeader: React.FC<OwnerReservationsHeaderProps> = ({
  stats = { total: 0, enAttente: 0, enCours: 0, confirmees: 0, terminees: 0, annulees: 0 },
  selectedStatus = 'ALL',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Titre & statut de la flotte ─────────────────────────────────── */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4ADE80]/30 bg-[#041912] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#4ADE80]">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Espace Hôte · AutoLoc Premium</span>
          </div>

          <h1 className="font-fraunces text-3xl font-normal leading-[1.1] tracking-tight text-[#041912] sm:text-4xl lg:text-5xl">
            Gestion des <span className="text-[#059669]">réservations</span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Suivez en temps réel les demandes de location pour votre flotte, validez les remises de
            clés et contrôlez l’historique des départs et retours.
          </p>

          {/* Alerte contextuelle : une seule ligne, un seul signal, pas de double animation */}
          {(stats.enAttente > 0 || stats.enCours > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.enAttente > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <AlertCircle className="h-3.5 w-3.5 animate-pulse text-amber-600" />
                  {stats.enAttente} demande{stats.enAttente > 1 ? 's' : ''} à valider
                </span>
              )}
              {stats.enCours > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F1DFB6]/50 bg-[#0A3D2E] px-3 py-1 text-xs font-semibold text-[#F1DFB6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                  {stats.enCours} location{stats.enCours > 1 ? 's' : ''} sur la route
                </span>
              )}
            </div>
          )}
        </div>

        {onRefresh && (
          <div className="shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-[#059669] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        )}
      </div>

      {/* ── KPI / filtres rapides ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total"
          value={stats.total}
          icon={CalendarCheck2}
          active={selectedStatus === 'ALL'}
          accent="forest"
          helper="Toutes"
          onClick={() => onStatusChange?.('ALL')}
        />
        <KpiTile
          label="En attente"
          value={stats.enAttente}
          icon={Clock}
          active={selectedStatus === 'EN_ATTENTE'}
          accent="amber"
          helper={stats.enAttente > 0 ? 'À traiter' : undefined}
          onClick={() => onStatusChange?.('EN_ATTENTE')}
        />
        <KpiTile
          label="En cours"
          value={stats.enCours}
          icon={Car}
          active={selectedStatus === 'EN_COURS'}
          accent="emerald"
          helper="Sur la route"
          onClick={() => onStatusChange?.('EN_COURS')}
        />
        <KpiTile
          label="Confirmées"
          value={stats.confirmees}
          icon={CheckCircle2}
          active={selectedStatus === 'CONFIRMEE'}
          accent="blue"
          helper="À venir"
          onClick={() => onStatusChange?.('CONFIRMEE')}
        />
      </div>

      {/* ── Recherche & filtres de statut ───────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-xs sm:flex-row sm:items-center sm:gap-2 sm:p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher par locataire, modèle de véhicule ou réf #..."
            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 sm:text-sm"
          />
        </div>

        <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100/70 p-1">
          {STATUS_FILTERS.map((filter) => {
            const isActive = selectedStatus === filter.id;
            const Icon = filter.icon;
            const countMap: Record<string, number> = {
              ALL: stats.total,
              EN_ATTENTE: stats.enAttente,
              CONFIRMEE: stats.confirmees,
              EN_COURS: stats.enCours,
              TERMINEE: stats.terminees,
              ANNULEE: stats.annulees,
            };
            const count = countMap[filter.id] ?? 0;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusChange?.(filter.id)}
                aria-pressed={isActive}
                className="relative shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] hover:text-slate-900"
              >
                {isActive && (
                  <motion.span
                    layoutId="ownerReservationsActivePill"
                    className="absolute inset-0 rounded-xl bg-[#041912] shadow-[0_4px_14px_-4px_rgba(4,25,18,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-[#4ADE80]' : ''}`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#4ADE80]' : 'text-slate-500'}`} />
                  <span>{filter.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${isActive ? 'bg-[#4ADE80]/15 text-[#4ADE80]' : 'bg-slate-200/80 text-slate-700'
                      }`}
                  >
                    {count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};