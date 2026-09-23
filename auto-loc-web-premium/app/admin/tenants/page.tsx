'use client';

import React from 'react';
import { useAdminTenants } from '@/src/features/admin/tenants/hooks/useAdminTenants';
import { AdminTenantHeaderBar } from '@/src/features/admin/tenants/components/AdminTenantHeaderBar';
import { AdminTenantTable } from '@/src/features/admin/tenants/components/AdminTenantTable';
import { AdminTenantInspectorModal } from '@/src/features/admin/tenants/components/AdminTenantInspectorModal';

export default function AdminTenantsPage() {
  const {
    status,
    setStatus,
    search,
    setSearch,
    items,
    totalItems,
    counts,
    selectedTenantId,
    setSelectedTenantId,
    selectedTenantItem,
    health360,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    isRefreshing,
    isMutating,
    refresh,
    approvePermis,
    rejectPermis,
    banTenant,
    unbanTenant,
  } = useAdminTenants();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Search & Filter Tabs */}
      <AdminTenantHeaderBar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Table of Tenants Queue with Infinite Scroll */}
      <AdminTenantTable
        items={items}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        isReachingEnd={isReachingEnd}
        totalItems={totalItems}
        onLoadMore={loadMore}
        onSelectTenant={(tenant) => setSelectedTenantId(tenant.id)}
      />

      {/* 360° Inspector Modal */}
      <AdminTenantInspectorModal
        item={selectedTenantItem}
        health360={health360}
        isOpen={Boolean(selectedTenantId)}
        onClose={() => setSelectedTenantId(null)}
        onApprovePermis={approvePermis}
        onRejectPermis={rejectPermis}
        onBanTenant={banTenant}
        onUnbanTenant={unbanTenant}
        isMutating={isMutating}
      />
    </div>
  );
}
