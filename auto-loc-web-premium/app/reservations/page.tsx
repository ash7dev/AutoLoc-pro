'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/src/core/store/useUserStore';
import { TenantReservationsHeader } from '@/src/features/reservations/components/TenantReservationsHeader';
import {
  TenantReservationStatusPills,
  ReservationStatusFilter,
} from '@/src/features/reservations/components/TenantReservationStatusPills';
import { TenantUnauthenticatedState } from '@/src/features/reservations/components/TenantUnauthenticatedState';
import { useTenantReservations } from '@/src/features/reservations/hooks/useTenantReservations';
import { TenantReservationsList } from '@/src/features/reservations/components/TenantReservationsList';

export default function ReservationsPage() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isInitialized = useUserStore((s) => s.isInitialized);
  const [activeStatus, setActiveStatus] = useState<ReservationStatusFilter>('ALL');

  const { reservations, total, isLoading, isError, errorMessage, refetch } =
    useTenantReservations(activeStatus);

  // Décomptes des locations actives
  const activeCount = reservations.filter((r) => r.statut === 'EN_COURS').length;

  // Réinitialisation du scroll en haut de page au chargement/reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-6 sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-12 w-64 bg-slate-200/80 animate-pulse rounded-2xl" />
          <div className="h-48 bg-white border border-slate-200/80 rounded-3xl animate-pulse p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-6 sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Header Premium sans aucun chevauchement avec la Navbar */}
        <TenantReservationsHeader totalCount={total} activeCount={activeCount} />

        {/* 2. Conditionnel : Invité (Non connecté) vs Membre connecté */}
        {!isAuthenticated ? (
          <TenantUnauthenticatedState />
        ) : (
          <div className="space-y-6">
            {/* Barre de Pilules de Filtres par Statuts */}
            <TenantReservationStatusPills
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
            />

            {/* Liste de cartes des réservations du locataire */}
            <TenantReservationsList
              reservations={reservations}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              activeStatus={activeStatus}
              onRefresh={refetch}
              onResetFilter={() => setActiveStatus('ALL')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
