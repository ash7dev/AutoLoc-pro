'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { reservationsApi, OwnerReservationItem, ReservationStatut } from '../../../src/core/api/reservationsApi';
import { OwnerReservationsHeader, OwnerReservationStats } from '../../../src/features/reservations/components/OwnerReservationsHeader';
import { OwnerReservationsList } from '../../../src/features/reservations/components/OwnerReservationsList';

export default function OwnerReservationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all reservations for the owner (limit 200) to compute exact real-time stats & filter locally
  const {
    data: reservationsResponse,
    isLoading,
    mutate,
  } = useSWR('owner-all-reservations', () =>
    reservationsApi.getOwnerReservations({ limit: 200 })
  );

  const allReservations: OwnerReservationItem[] = reservationsResponse?.data || [];

  // Compute accurate stats from the owner's real reservation data
  const stats: OwnerReservationStats = useMemo(() => {
    let enAttente = 0;
    let confirmees = 0;
    let enCours = 0;
    let terminees = 0;
    let annulees = 0;

    allReservations.forEach((r) => {
      const s = r.statut;
      if (s === 'EN_ATTENTE_PAIEMENT' || s === 'INITIEE' || s === 'PAYEE') {
        enAttente++;
      } else if (s === 'CONFIRMEE') {
        confirmees++;
      } else if (s === 'EN_COURS') {
        enCours++;
      } else if (s === 'TERMINEE') {
        terminees++;
      } else if (s === 'ANNULEE' || s === 'EXPIREE' || s === 'LITIGE') {
        annulees++;
      }
    });

    return {
      total: allReservations.length,
      enAttente,
      confirmees,
      enCours,
      terminees,
      annulees,
    };
  }, [allReservations]);

  // Filter reservations based on selectedStatus pill
  const filteredByStatus = useMemo(() => {
    if (selectedStatus === 'ALL') return allReservations;
    return allReservations.filter((r) => {
      const s = r.statut;
      if (selectedStatus === 'EN_ATTENTE') return s === 'EN_ATTENTE_PAIEMENT' || s === 'INITIEE' || s === 'PAYEE';
      if (selectedStatus === 'CONFIRMEE') return s === 'CONFIRMEE';
      if (selectedStatus === 'EN_COURS') return s === 'EN_COURS';
      if (selectedStatus === 'TERMINEE') return s === 'TERMINEE';
      if (selectedStatus === 'ANNULEE') return s === 'ANNULEE' || s === 'EXPIREE' || s === 'LITIGE';
      return true;
    });
  }, [allReservations, selectedStatus]);

  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="space-y-8">
      {/* ── Header Component ────────────────────────────────────────── */}
      <OwnerReservationsHeader
        stats={stats}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* ── Cards List Grid Component ───────────────────────────────── */}
      <OwnerReservationsList
        reservations={filteredByStatus}
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
      />
    </div>
  );
}
