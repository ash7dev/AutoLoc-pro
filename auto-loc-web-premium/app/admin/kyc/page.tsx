'use client';

import React from 'react';
import { useAdminKyc } from '@/src/features/admin/kyc/hooks/useAdminKyc';
import { AdminKycHeaderBar } from '@/src/features/admin/kyc/components/AdminKycHeaderBar';
import { AdminKycTable } from '@/src/features/admin/kyc/components/AdminKycTable';
import { AdminKycInspectorModal } from '@/src/features/admin/kyc/components/AdminKycInspectorModal';

export default function AdminKycPage() {
  const {
    status,
    setStatus,
    search,
    setSearch,
    items,
    meta,
    counts,
    selectedItem,
    setSelectedItem,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    approveKyc,
    rejectKyc,
  } = useAdminKyc();

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header Bar with Search & Filter Tabs */}
      <AdminKycHeaderBar
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Table of KYC Requests */}
      <AdminKycTable
        items={items}
        isLoading={isLoading}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* HD Inspector Modal */}
      <AdminKycInspectorModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onApprove={approveKyc}
        onReject={rejectKyc}
        isMutating={isMutating}
      />
    </div>
  );
}
