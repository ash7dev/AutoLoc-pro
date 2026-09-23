'use client';

import React from 'react';
import { useAdminHosts } from '@/src/features/admin/hosts/hooks/useAdminHosts';
import { AdminHostHeaderBar } from '@/src/features/admin/hosts/components/AdminHostHeaderBar';
import { AdminHostTable } from '@/src/features/admin/hosts/components/AdminHostTable';
import { AdminHostInspectorModal } from '@/src/features/admin/hosts/components/AdminHostInspectorModal';

export default function AdminHostsPage() {
  const {
    status,
    setStatus,
    search,
    setSearch,
    items,
    counts,
    selectedHostId,
    setSelectedHostId,
    selectedHostItem,
    health360,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    validateVehicle,
    suspendVehicle,
    featureVehicle,
    deleteVehiclePhoto,
    setMainVehiclePhoto,
    executeFleetAction,
    banHost,
    unbanHost,
  } = useAdminHosts();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Search & Filter Tabs */}
      <AdminHostHeaderBar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Table of Hosts & Fleet Overview */}
      <AdminHostTable
        items={items}
        isLoading={isLoading}
        onSelectHost={(host) => setSelectedHostId(host.id)}
      />

      {/* 360° Inspector Modal */}
      <AdminHostInspectorModal
        item={selectedHostItem}
        health360={health360}
        isOpen={Boolean(selectedHostId)}
        onClose={() => setSelectedHostId(null)}
        onValidateVehicle={validateVehicle}
        onSuspendVehicle={suspendVehicle}
        onFeatureVehicle={featureVehicle}
        onDeletePhoto={deleteVehiclePhoto}
        onSetMainPhoto={setMainVehiclePhoto}
        onExecuteFleetAction={executeFleetAction}
        onBanHost={banHost}
        onUnbanHost={unbanHost}
        isMutating={isMutating}
      />
    </div>
  );
}
