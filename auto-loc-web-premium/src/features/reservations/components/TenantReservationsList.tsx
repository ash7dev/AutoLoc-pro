'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { History, ChevronDown, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { TenantReservation, TenantReservationCard } from './TenantReservationCard';
import { ReservationStatusFilter } from './TenantReservationStatusPills';
import { TenantEmptyReservationsState } from './TenantEmptyReservationsState';

interface TenantReservationsListProps {
  reservations: TenantReservation[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  activeStatus: ReservationStatusFilter;
  onRefresh?: () => void;
  onResetFilter?: () => void;
}

const PAST_STATUSES = ['TERMINEE', 'ANNULEE', 'LITIGE'];

export function TenantReservationsList({
  reservations,
  isLoading,
  isError,
  errorMessage,
  activeStatus,
  onRefresh,
  onResetFilter,
}: TenantReservationsListProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  /* Séparation entre réservations actives et historiques (passées / annulées) */
  const { activeBookings, historyBookings } = useMemo(() => {
    const active: TenantReservation[] = [];
    const history: TenantReservation[] = [];

    (reservations || []).forEach((r) => {
      const s = (r.statut || '').toUpperCase();
      if (PAST_STATUSES.includes(s)) {
        history.push(r);
      } else {
        active.push(r);
      }
    });

    return { activeBookings: active, historyBookings: history };
  }, [reservations]);

  /* 1. Skeletons pendant le chargement */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 w-full rounded-2xl bg-slate-200/60 animate-pulse border border-slate-200/40"
          />
        ))}
      </div>
    );
  }

  /* 2. Affichage en cas d'erreur API */
  if (isError) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-4 my-6">
        <h3 className="text-lg font-bold">Erreur de chargement</h3>
        <p className="text-xs text-rose-600">
          {errorMessage || 'Impossible de récupérer vos réservations pour le moment.'}
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-900 text-white font-bold text-xs hover:bg-rose-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
        )}
      </div>
    );
  }

  /* 3. État vide si aucune réservation trouvée */
  if (!reservations || reservations.length === 0) {
    return (
      <TenantEmptyReservationsState
        activeStatus={activeStatus}
        onResetFilter={onResetFilter}
      />
    );
  }

  /* 4. Onglet "Toutes" ('ALL') avec séparation Actives & Accordéon Historique */
  if (activeStatus === 'ALL' && historyBookings.length > 0) {
    return (
      <div className="space-y-4">
        {/* Banner ultra-premium si aucune réservation active en cours */}
        {activeBookings.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-900/15 bg-gradient-to-r from-emerald-950/[0.04] via-white to-slate-50 p-4 sm:p-5 shadow-xs transition-all duration-300">
            {/* Halo lumineux de fond */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#0A3D2E] via-emerald-500 to-teal-700" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-dark border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className="text-sm sm:text-base font-bold text-brand-dark tracking-tight"
                    >
                      Aucune location active
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Dispo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Vous n’avez pas de réservation en cours d'utilisation. Retrouvez vos séjours passés ci-dessous.
                  </p>
                </div>
              </div>

              <Link
                href="/vehicles"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-brand-main text-champagne font-bold text-xs shadow-xs hover:bg-forest-700 transition-all cursor-pointer shrink-0 self-start sm:self-auto group"
              >
                <span>Explorer les véhicules</span>
                <ArrowRight className="w-3.5 h-3.5 text-champagne group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        {/* 1. Réservations actives (Confirmées, En cours, En attente) */}
        {activeBookings.map((res) => (
          <TenantReservationCard key={res.id} reservation={res} />
        ))}

        {/* 2. Accordéon Dépliable pour l'Historique (Locations passées & annulées) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all duration-200">
          <button
            type="button"
            onClick={() => setIsHistoryExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-dark border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <History className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-display font-bold text-brand-dark leading-snug truncate">
                  Historique & Réservations passées
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {historyBookings.length} location{historyBookings.length > 1 ? 's' : ''} terminée{historyBookings.length > 1 ? 's' : ''} ou annulée{historyBookings.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {historyBookings.length}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                <ChevronDown
                  className={`w-4 h-4 text-brand-dark transition-transform duration-200 ${
                    isHistoryExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>
          </button>

          {/* Contenu Déplié des Réservations Passées & Annulées */}
          {isHistoryExpanded && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100/80 bg-slate-50/40 animate-in fade-in duration-200">
              <div className="pt-3 space-y-3">
                {historyBookings.map((res) => (
                  <TenantReservationCard key={res.id} reservation={res} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* 5. Rendu filtré direct par statut (ex: 'EN_COURS', 'CONFIRMEE', 'TERMINEE', etc.) */
  return (
    <div className="space-y-3">
      {reservations.map((res) => (
        <TenantReservationCard key={res.id} reservation={res} />
      ))}
    </div>
  );
}
