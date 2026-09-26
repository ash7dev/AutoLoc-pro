'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  Clock,
  Car,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  X,
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
  isRefreshing?: boolean;
  lastRefreshedAt?: Date | null;
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
 * Un seul style actif/inactif (forêt/champagne) partagé par les quatre
 * métriques, au lieu d'un accent de couleur différent par tuile.
 */
interface KpiTileProps {
  label: string;
  value: number;
  icon: React.ElementType;
  active: boolean;
  helper?: string;
  onClick?: () => void;
}

const KpiTile: React.FC<KpiTileProps> = ({ label, value, icon: Icon, active, helper, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all sm:p-5 ${active
          ? 'border-brand-main bg-brand-dark shadow-[0_10px_24px_-10px_rgba(4,25,18,0.5)]'
          : 'border-brand-dark/8 bg-white hover:border-slate-300'
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11.5px] font-medium ${active ? 'text-champagne/70' : 'text-slate-400'}`}>
          {label}
        </span>
        <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-300'}`} />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className={`font-fraunces text-2xl leading-none tabular-nums sm:text-3xl ${active ? 'text-champagne' : 'text-brand-dark'
          }`}>
          {value}
        </span>
        {helper && (
          <span className={`text-[11px] font-medium ${active ? 'text-white/40' : 'text-slate-400'}`}>
            {helper}
          </span>
        )}
      </div>
    </button>
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
  isRefreshing = false,
  lastRefreshedAt,
}) => {
  const formattedRefreshedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Titre & statut de la flotte */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <h1 className="font-fraunces text-3xl leading-[1.1] tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
            Gestion des <span className="text-brand-main">réservations</span>
          </h1>

          <p className="max-w-2xl text-[13px] leading-relaxed text-slate-500 sm:text-sm">
            Suivez les demandes en temps réel, validez les remises de clés et contrôlez les locations de votre flotte.
          </p>

          {(stats.enAttente > 0 || stats.enCours > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.enAttente > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {stats.enAttente} demande{stats.enAttente > 1 ? 's' : ''} à valider
                </span>
              )}
              {stats.enCours > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-dark px-3 py-1 text-[12px] font-semibold text-champagne">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Mise à jour...' : formattedRefreshedTime ? `Synchro ${formattedRefreshedTime}` : 'Actualiser'}
            </button>
          </div>
        )}
      </div>

      {/* KPI / filtres rapides (masqués sur mobile) */}
      <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total"
          value={stats.total}
          icon={CalendarCheck2}
          active={selectedStatus === 'ALL'}
          helper="Toutes"
          onClick={() => onStatusChange?.('ALL')}
        />
        <KpiTile
          label="En attente"
          value={stats.enAttente}
          icon={Clock}
          active={selectedStatus === 'EN_ATTENTE'}
          helper={stats.enAttente > 0 ? 'À traiter' : undefined}
          onClick={() => onStatusChange?.('EN_ATTENTE')}
        />
        <KpiTile
          label="En cours"
          value={stats.enCours}
          icon={Car}
          active={selectedStatus === 'EN_COURS'}
          helper="Sur la route"
          onClick={() => onStatusChange?.('EN_COURS')}
        />
        <KpiTile
          label="Confirmées"
          value={stats.confirmees}
          icon={CheckCircle2}
          active={selectedStatus === 'CONFIRMEE'}
          helper="À venir"
          onClick={() => onStatusChange?.('CONFIRMEE')}
        />
      </div>

      {/* Recherche & filtres de statut */}
      <div className="flex flex-col gap-3 rounded-2xl border border-brand-dark/8 bg-white p-2.5 sm:flex-row sm:items-center sm:p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher par locataire, modèle de véhicule ou réf #..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-9 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-brand-main focus:outline-none focus:ring-2 focus:ring-brand-main/10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl bg-slate-50/70 p-1">
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
                className="relative shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold text-slate-500 transition-colors hover:text-brand-dark"
              >
                {isActive && (
                  <motion.span
                    layoutId="ownerReservationsActivePill"
                    className="absolute inset-0 rounded-lg bg-brand-dark"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-champagne' : ''}`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {filter.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'bg-white/10 text-champagne' : 'bg-slate-200/70 text-slate-600'
                    }`}>
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