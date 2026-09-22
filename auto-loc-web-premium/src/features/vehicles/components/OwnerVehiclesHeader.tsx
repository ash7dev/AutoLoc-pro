'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileEdit,
  Archive,
  Layers,
} from 'lucide-react';

export interface OwnerVehicleStats {
  total: number;
  verifies: number;
  enAttente: number;
  brouillons: number;
  archives: number;
  enCirculation: number;
}

export interface OwnerVehiclesHeaderProps {
  stats?: OwnerVehicleStats;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onAddVehicle?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const VEHICLE_STATUS_FILTERS = [
  { id: 'ALL', label: 'Tous', icon: Layers },
  { id: 'VERIFIE', label: 'Actifs (Vérifiés)', icon: CheckCircle2 },
  { id: 'EN_ATTENTE_VALIDATION', label: 'En attente', icon: Clock },
  { id: 'BROUILLON', label: 'Brouillons', icon: FileEdit },
  { id: 'ARCHIVE', label: 'Archivés', icon: Archive },
];

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

const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  icon: Icon,
  active,
  accent,
  helper,
  onClick,
}) => {
  const a = ACCENTS[accent];
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      aria-pressed={active}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#059669] sm:p-5 ${
        active
          ? `${a.activeBg} ${a.activeBorder} ${a.activeGlow} text-white`
          : 'border-slate-200/80 bg-white text-slate-900 shadow-[0_1px_2px_rgba(4,25,18,0.04)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_-10px_rgba(4,25,18,0.15)]'
      }`}
    >
      {active && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      )}

      <div className="relative flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            active ? a.labelActive : a.labelIdle
          }`}
        >
          {label}
        </span>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
            active ? a.iconActiveBg : a.iconIdleBg
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-3 flex items-baseline justify-between gap-2">
        <span
          className={`font-fraunces text-2xl leading-none tabular-nums sm:text-3xl ${
            active ? 'text-white' : a.valueIdle
          }`}
        >
          {value}
        </span>
        {helper && (
          <span
            className={`text-[11px] font-medium ${
              active ? 'text-white/60' : 'text-slate-400'
            }`}
          >
            {helper}
          </span>
        )}
      </div>
    </motion.button>
  );
};

export const OwnerVehiclesHeader: React.FC<OwnerVehiclesHeaderProps> = ({
  stats = {
    total: 0,
    verifies: 0,
    enAttente: 0,
    brouillons: 0,
    archives: 0,
    enCirculation: 0,
  },
  selectedStatus = 'ALL',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onAddVehicle,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <header className="space-y-6 sm:space-y-8">
      {/* ── Titre, Flotte & Bouton Ajouter ───────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <h1 className="font-fraunces text-3xl font-normal leading-[1.1] tracking-tight text-[#041912] sm:text-4xl lg:text-5xl">
            Gestion de votre <span className="text-[#059669]">parc automobile</span>
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-medium">
            Pilotez la disponibilité, les tarifs et la publication de votre flotte.
          </p>

          {/* Badges d'état rapide */}
          {(stats.enAttente > 0 || stats.enCirculation > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.enAttente > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600" />
                  {stats.enAttente} véhicule{stats.enAttente > 1 ? 's' : ''} en attente de validation
                </span>
              )}
              {stats.enCirculation > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F1DFB6]/50 bg-[#0A3D2E] px-3 py-1 text-xs font-semibold text-[#F1DFB6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                  {stats.enCirculation} véhicule{stats.enCirculation > 1 ? 's' : ''} en location active
                </span>
              )}
            </div>
          )}
        </div>

        {/* Boutons d'Action Haut */}
        <div className="flex items-center gap-3 pt-1 lg:pt-0 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 text-[#059669] ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          )}

          {onAddVehicle && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAddVehicle}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#0A3D2E] to-[#041912] px-5 py-3 text-xs font-bold text-[#F1DFB6] shadow-[0_10px_25px_-5px_rgba(4,25,18,0.4)] border border-[#0A3D2E] hover:from-[#0F4F3B] hover:to-[#072A20] transition-all cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4ADE80]/20 text-[#4ADE80]">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-sm">Ajouter un véhicule</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── KPI Tuiles Rapides (Masqués sur mobile) ────────────────────── */}
      <div className="hidden sm:grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total Flotte"
          value={stats.total}
          icon={Car}
          active={selectedStatus === 'ALL'}
          accent="forest"
          helper="Véhicules enregistrés"
          onClick={() => onStatusChange?.('ALL')}
        />
        <KpiTile
          label="Actifs / Vérifiés"
          value={stats.verifies}
          icon={CheckCircle2}
          active={selectedStatus === 'VERIFIE'}
          accent="emerald"
          helper="Prêts à réserver"
          onClick={() => onStatusChange?.('VERIFIE')}
        />
        <KpiTile
          label="En attente"
          value={stats.enAttente}
          icon={Clock}
          active={selectedStatus === 'EN_ATTENTE_VALIDATION'}
          accent="amber"
          helper="Modération AutoLoc"
          onClick={() => onStatusChange?.('EN_ATTENTE_VALIDATION')}
        />
        <KpiTile
          label="En circulation"
          value={stats.enCirculation}
          icon={ShieldCheck}
          active={selectedStatus === 'EN_CIRCULATION'}
          accent="blue"
          helper="Locations actives"
          onClick={() => onStatusChange?.('ALL')}
        />
      </div>

      {/* ── Barre de Recherche & Filtres par Statut ──────────────────── */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-xs sm:flex-row sm:items-center sm:gap-2 sm:p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher par marque, modèle, immatriculation ou ville..."
            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 sm:text-sm"
          />
        </div>

        <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100/70 p-1">
          {VEHICLE_STATUS_FILTERS.map((filter) => {
            const isActive = selectedStatus === filter.id;
            const Icon = filter.icon;
            const countMap: Record<string, number> = {
              ALL: stats.total,
              VERIFIE: stats.verifies,
              EN_ATTENTE_VALIDATION: stats.enAttente,
              BROUILLON: stats.brouillons,
              ARCHIVE: stats.archives,
            };
            const count = countMap[filter.id] ?? 0;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusChange?.(filter.id)}
                aria-pressed={isActive}
                className="relative shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] hover:text-slate-900 cursor-pointer"
              >
                {isActive && (
                  <motion.span
                    layoutId="ownerVehiclesActivePill"
                    className="absolute inset-0 rounded-xl bg-[#041912] shadow-[0_4px_14px_-4px_rgba(4,25,18,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 ${
                    isActive ? 'text-[#4ADE80]' : ''
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isActive ? 'text-[#4ADE80]' : 'text-slate-500'
                    }`}
                  />
                  <span>{filter.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                      isActive
                        ? 'bg-[#4ADE80]/15 text-[#4ADE80]'
                        : 'bg-slate-200/80 text-slate-700'
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
    </header>
  );
};
