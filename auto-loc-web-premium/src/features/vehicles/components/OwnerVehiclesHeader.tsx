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
  X,
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
  isRefreshing?: boolean;
  lastRefreshedAt?: Date | null;
}

export const VEHICLE_STATUS_FILTERS = [
  { id: 'ALL', label: 'Tous', icon: Layers },
  { id: 'VERIFIE', label: 'Actifs', icon: CheckCircle2 },
  { id: 'EN_ATTENTE_VALIDATION', label: 'En attente', icon: Clock },
  { id: 'BROUILLON', label: 'Brouillons', icon: FileEdit },
  { id: 'ARCHIVE', label: 'Archivés', icon: Archive },
];

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
          ? 'border-[#0A3D2E] bg-[#041912] shadow-[0_10px_24px_-10px_rgba(4,25,18,0.5)]'
          : 'border-[#041912]/8 bg-white hover:border-slate-300'
        }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11.5px] font-medium ${active ? 'text-[#F1DFB6]/70' : 'text-slate-400'}`}>
          {label}
        </span>
        <Icon className={`h-4 w-4 ${active ? 'text-[#4ADE80]' : 'text-slate-300'}`} />
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className={`font-fraunces text-2xl leading-none tabular-nums sm:text-3xl ${active ? 'text-[#F1DFB6]' : 'text-[#041912]'
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

export const OwnerVehiclesHeader: React.FC<OwnerVehiclesHeaderProps> = ({
  stats = { total: 0, verifies: 0, enAttente: 0, brouillons: 0, archives: 0, enCirculation: 0 },
  selectedStatus = 'ALL',
  onStatusChange,
  searchQuery = '',
  onSearchChange,
  onAddVehicle,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
  lastRefreshedAt,
}) => {
  const formattedRefreshedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <header className="space-y-6 sm:space-y-8">
      {/* Titre & actions */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <h1 className="font-fraunces text-3xl leading-[1.1] tracking-tight text-[#041912] sm:text-4xl lg:text-5xl">
            Gestion de votre <span className="text-[#0A3D2E]">parc automobile</span>
          </h1>

          <p className="max-w-2xl text-[13px] leading-relaxed text-slate-500 sm:text-sm">
            Pilotez la disponibilité, les tarifs et la publication de votre flotte.
          </p>

          {(stats.enAttente > 0 || stats.enCirculation > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {stats.enAttente > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  {stats.enAttente} véhicule{stats.enAttente > 1 ? 's' : ''} en attente de validation
                </span>
              )}
              {stats.enCirculation > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#041912] px-3 py-1 text-[12px] font-semibold text-[#F1DFB6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                  {stats.enCirculation} véhicule{stats.enCirculation > 1 ? 's' : ''} en location active
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 pt-1 lg:pt-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 text-[#059669] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Mise à jour...' : formattedRefreshedTime ? `Synchro ${formattedRefreshedTime}` : 'Actualiser'}
              </span>
            </button>
          )}

          {onAddVehicle && (
            <button
              type="button"
              onClick={onAddVehicle}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#041912] px-5 py-2.5 text-[13px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E]"
            >
              <Plus className="h-4 w-4 text-[#4ADE80]" />
              Ajouter un véhicule
            </button>
          )}
        </div>
      </div>

      {/* KPI (masqués sur mobile) */}
      <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4 sm:gap-4">
        <KpiTile
          label="Total flotte"
          value={stats.total}
          icon={Car}
          active={selectedStatus === 'ALL'}
          helper="Véhicules"
          onClick={() => onStatusChange?.('ALL')}
        />
        <KpiTile
          label="Actifs / vérifiés"
          value={stats.verifies}
          icon={CheckCircle2}
          active={selectedStatus === 'VERIFIE'}
          helper="Prêts à réserver"
          onClick={() => onStatusChange?.('VERIFIE')}
        />
        <KpiTile
          label="En attente"
          value={stats.enAttente}
          icon={Clock}
          active={selectedStatus === 'EN_ATTENTE_VALIDATION'}
          helper="Modération"
          onClick={() => onStatusChange?.('EN_ATTENTE_VALIDATION')}
        />
        <KpiTile
          label="En circulation"
          value={stats.enCirculation}
          icon={ShieldCheck}
          active={false}
          helper="Locations actives"
          onClick={() => onStatusChange?.('ALL')}
        />
      </div>

      {/* Recherche & filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#041912]/8 bg-white p-2.5 sm:flex-row sm:items-center sm:p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Rechercher par marque, modèle, immatriculation ou ville..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-9 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
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
                className="relative shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold text-slate-500 transition-colors hover:text-[#041912]"
              >
                {isActive && (
                  <motion.span
                    layoutId="ownerVehiclesActivePill"
                    className="absolute inset-0 rounded-lg bg-[#041912]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-[#F1DFB6]' : ''}`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#4ADE80]' : 'text-slate-400'}`} />
                  {filter.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${isActive ? 'bg-white/10 text-[#F1DFB6]' : 'bg-slate-200/70 text-slate-600'
                    }`}>
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