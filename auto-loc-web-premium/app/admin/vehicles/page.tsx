'use client';

import React from 'react';
import { useAdminVehicleModeration } from '@/src/features/admin/vehicles/hooks/useAdminVehicleModeration';
import { AdminVehicleHeaderBar } from '@/src/features/admin/vehicles/components/AdminVehicleHeaderBar';
import { AdminVehicleTable } from '@/src/features/admin/vehicles/components/AdminVehicleTable';
import { AdminVehicleInspectorModal } from '@/src/features/admin/vehicles/components/AdminVehicleInspectorModal';

export default function AdminVehiclesPage() {
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
    selectedVehicle,
    setSelectedVehicle,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    validateVehicle,
    suspendVehicle,
    featureVehicle,
    deletePhoto,
    setMainPhoto,
  } = useAdminVehicleModeration();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Status Filter Tabs & Search */}
      <AdminVehicleHeaderBar
        statut={statut}
        onStatutChange={setStatut}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Vehicle Moderation Table with Instagram Infinite Scroll */}
      <AdminVehicleTable
        items={items}
        isLoading={isLoading}
        onSelectVehicle={(vehicle) => setSelectedVehicle(vehicle)}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalItems={totalItems}
        onLoadMore={loadMore}
      />

      {/* Complete HD Inspector Modal */}
      <AdminVehicleInspectorModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        onValidate={validateVehicle}
        onSuspend={suspendVehicle}
        onFeature={featureVehicle}
        onDeletePhoto={deletePhoto}
        onSetMainPhoto={setMainPhoto}
        isMutating={isMutating}
      />
    </div>
  );
}
