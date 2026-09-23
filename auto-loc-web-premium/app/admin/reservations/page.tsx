'use client';

import React from 'react';
import { useAdminReservations } from '@/src/features/admin/reservations/hooks/useAdminReservations';
import { AdminReservationHeaderBar } from '@/src/features/admin/reservations/components/AdminReservationHeaderBar';
import { AdminReservationTable } from '@/src/features/admin/reservations/components/AdminReservationTable';
import { AdminReservationInspectorModal } from '@/src/features/admin/reservations/components/AdminReservationInspectorModal';

export default function AdminReservationsPage() {
  const {
    statut,
    setStatut,
    search,
    setSearch,
    items,
    counts,
    totalItems,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedReservationId,
    setSelectedReservationId,
    selectedReservationItem,
    detailData,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    forceConfirm,
    forceCancel,
    forceComplete,
  } = useAdminReservations();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Status Filter Tabs & Instant Search */}
      <AdminReservationHeaderBar
        statut={statut}
        onStatutChange={setStatut}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Reservation Control Table with Infinite Scroll */}
      <AdminReservationTable
        items={items}
        isLoading={isLoading}
        onSelectReservation={(r) => setSelectedReservationId(r.id)}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalItems={totalItems}
        onLoadMore={loadMore}
      />

      {/* Complete 360° Reservation Inspector Modal */}
      <AdminReservationInspectorModal
        reservation={selectedReservationItem}
        detailData={detailData}
        isOpen={Boolean(selectedReservationId)}
        onClose={() => setSelectedReservationId(null)}
        onForceConfirm={forceConfirm}
        onForceCancel={forceCancel}
        onForceComplete={forceComplete}
        isMutating={isMutating}
      />
    </div>
  );
}
