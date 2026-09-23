'use client';

import React from 'react';
import { useAdminPayouts } from '@/src/features/admin/payouts/hooks/useAdminPayouts';
import { AdminPayoutsHeaderBar } from '@/src/features/admin/payouts/components/AdminPayoutsHeaderBar';
import { AdminPayoutsTable } from '@/src/features/admin/payouts/components/AdminPayoutsTable';
import { AdminPayoutInspectorModal } from '@/src/features/admin/payouts/components/AdminPayoutInspectorModal';

export default function AdminPayoutsPage() {
  const {
    statut,
    setStatut,
    methode,
    setMethode,
    search,
    setSearch,
    items,
    stats,
    totalItems,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedWithdrawalId,
    setSelectedWithdrawalId,
    selectedWithdrawalItem,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    approveWithdrawal,
    rejectWithdrawal,
  } = useAdminPayouts();

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar avec Cartes KPI & Onglets */}
      <AdminPayoutsHeaderBar
        statut={statut}
        onStatutChange={setStatut}
        methode={methode}
        onMethodeChange={setMethode}
        search={search}
        onSearchChange={setSearch}
        stats={stats}
        totalItems={totalItems}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Tableau des Payouts & Infinite Scroll */}
      <AdminPayoutsTable
        items={items}
        totalItems={totalItems}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
        onSelect={(id) => setSelectedWithdrawalId(id)}
        isLoadingInitial={isLoading}
      />

      {/* Inspecteur 360° Modal */}
      <AdminPayoutInspectorModal
        item={selectedWithdrawalItem}
        isOpen={Boolean(selectedWithdrawalId)}
        isMutating={isMutating}
        onClose={() => setSelectedWithdrawalId(null)}
        onApprove={approveWithdrawal}
        onReject={rejectWithdrawal}
      />
    </div>
  );
}
