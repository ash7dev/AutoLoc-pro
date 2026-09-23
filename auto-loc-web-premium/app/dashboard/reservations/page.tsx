'use client';

import React from 'react';
import { useOwnerReservations } from '../../../src/features/reservations/hooks/useOwnerReservations';
import { OwnerReservationsHeader } from '../../../src/features/reservations/components/OwnerReservationsHeader';
import { OwnerReservationsList } from '../../../src/features/reservations/components/OwnerReservationsList';

export default function OwnerReservationsPage() {
  const {
    filteredReservations,
    stats,
    isLoading,
    isRefreshing,
    lastRefreshedAt,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleRefresh,
  } = useOwnerReservations();

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
        isRefreshing={isRefreshing}
        lastRefreshedAt={lastRefreshedAt}
      />

      {/* ── Cards List Grid Component ───────────────────────────────── */}
      <OwnerReservationsList
        reservations={filteredReservations}
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
      />
    </div>
  );
}
