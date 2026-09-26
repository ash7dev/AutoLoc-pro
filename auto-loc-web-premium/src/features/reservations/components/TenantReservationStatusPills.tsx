'use client';

import React from 'react';
import {
  LayoutGrid,
  PlayCircle,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  AlertTriangle,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

export type ReservationStatusFilter =
  | 'ALL'
  | 'EN_COURS'
  | 'CONFIRMEE'
  | 'TERMINEE'
  | 'ANNULEE'
  | 'LITIGE';

export interface StatusOption {
  id: ReservationStatusFilter;
  label: string;
  backendStatus?: string;
  icon: LucideIcon;
  badgeColor?: string;
}

export const RESERVATION_STATUS_OPTIONS: StatusOption[] = [
  {
    id: 'ALL',
    label: 'Toutes',
    icon: LayoutGrid,
  },
  {
    id: 'EN_COURS',
    label: 'En cours',
    backendStatus: 'EN_COURS',
    icon: PlayCircle,
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 'CONFIRMEE',
    label: 'Confirmées',
    backendStatus: 'CONFIRMEE',
    icon: CheckCircle2,
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'TERMINEE',
    label: 'Terminées',
    backendStatus: 'TERMINEE',
    icon: CheckCheck,
    badgeColor: 'bg-slate-400',
  },
  {
    id: 'ANNULEE',
    label: 'Annulées',
    backendStatus: 'ANNULEE',
    icon: XCircle,
    badgeColor: 'bg-rose-500',
  },
  {
    id: 'LITIGE',
    label: 'Litiges',
    backendStatus: 'LITIGE',
    icon: AlertTriangle,
    badgeColor: 'bg-purple-500',
  },
];

interface TenantReservationStatusPillsProps {
  activeStatus: ReservationStatusFilter;
  onStatusChange: (status: ReservationStatusFilter) => void;
  counts?: Partial<Record<ReservationStatusFilter, number>>;
}

export function TenantReservationStatusPills({
  activeStatus,
  onStatusChange,
  counts = {},
}: TenantReservationStatusPillsProps) {
  return (
    <nav
      aria-label="Filtres par statut de réservation"
      className="relative w-full overflow-hidden"
    >
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {RESERVATION_STATUS_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeStatus === opt.id;
          const count = counts[opt.id];

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold
                transition-all duration-200 cursor-pointer select-none
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main
                ${
                  isActive
                    ? 'bg-brand-main text-champagne shadow-md shadow-brand-main/20 scale-[1.02]'
                    : 'bg-white border border-slate-200/90 text-slate-700 hover:border-brand-main/40 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }
              `}
            >
              {/* Dot indicateur de statut si inactif */}
              {!isActive && opt.badgeColor ? (
                <span className={`h-2 w-2 rounded-full ${opt.badgeColor} shrink-0`} />
              ) : (
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-champagne' : 'text-slate-500'
                  }`}
                  strokeWidth={2}
                />
              )}

              <span>{opt.label}</span>

              {/* Compteur si disponible */}
              {typeof count === 'number' && (
                <span
                  className={`ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
                    isActive
                      ? 'bg-champagne/20 text-champagne'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
