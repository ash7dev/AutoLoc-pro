'use client';

import React from 'react';
import { useAdminDisputes } from '@/src/features/admin/disputes/hooks/useAdminDisputes';
import { AdminDisputeHeaderBar } from '@/src/features/admin/disputes/components/AdminDisputeHeaderBar';
import { AdminDisputeTable } from '@/src/features/admin/disputes/components/AdminDisputeTable';
import { AdminDisputeInspectorModal } from '@/src/features/admin/disputes/components/AdminDisputeInspectorModal';

export default function AdminDisputesPage() {
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
    selectedDisputeId,
    setSelectedDisputeId,
    disputeDetail,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    resolveDispute,
  } = useAdminDisputes();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Dispute Status Tabs & Search */}
      <AdminDisputeHeaderBar
        statut={statut}
        onStatutChange={setStatut}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Dispute Moderation Table with Instagram Infinite Scroll */}
      <AdminDisputeTable
        items={items}
        isLoading={isLoading}
        onSelectDispute={(id) => setSelectedDisputeId(id)}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalItems={totalItems}
        onLoadMore={loadMore}
      />

      {/* Complete HD Dispute Inspector & Arbitration Modal */}
      <AdminDisputeInspectorModal
        dispute={disputeDetail ?? null}
        isOpen={Boolean(selectedDisputeId)}
        onClose={() => setSelectedDisputeId(null)}
        onResolve={resolveDispute}
        isMutating={isMutating}
      />
    </div>
  );
}
