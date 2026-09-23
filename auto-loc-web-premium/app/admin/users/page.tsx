'use client';

import React from 'react';
import { useAdminUsers } from '@/src/features/admin/users/hooks/useAdminUsers';
import { AdminUserKpiCards } from '@/src/features/admin/users/components/AdminUserKpiCards';
import { AdminUserHeaderBar } from '@/src/features/admin/users/components/AdminUserHeaderBar';
import { AdminUserTable } from '@/src/features/admin/users/components/AdminUserTable';
import { AdminUserInspectorModal } from '@/src/features/admin/users/components/AdminUserInspectorModal';

export default function AdminUsersPage() {
  const {
    role,
    setRole,
    status,
    setStatus,
    search,
    setSearch,
    items,
    counts,
    totalItems,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedUserId,
    setSelectedUserId,
    userDetail,
    isLoadingDetail,
    isLoading,
    isRefreshing,
    isMutating,
    refresh,
    setUserStatus,
    setUserRole,
    approveKyc,
    rejectKyc,
  } = useAdminUsers();

  const handleBanClick = (userItem: any) => {
    setSelectedUserId(userItem.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-8 space-y-6">
      {/* Header & Controls Bar */}
      <AdminUserHeaderBar
        role={role}
        setRole={setRole}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        totalItems={totalItems}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* KPI Stats Header Bar */}
      <AdminUserKpiCards
        counts={counts}
        activeStatusFilter={status}
        activeRoleFilter={role}
        onSelectStatusFilter={setStatus}
        onSelectRoleFilter={setRole}
      />


      {/* High-Density User Table with Infinite Scroll */}
      <AdminUserTable
        items={items}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onSelectUser={setSelectedUserId}
        onBanClick={handleBanClick}
      />

      {/* 360° User Inspector & Moderation Modal */}
      {selectedUserId && (
        <AdminUserInspectorModal
          user={userDetail ?? null}
          isLoading={isLoadingDetail}
          onClose={() => setSelectedUserId(null)}
          onBanUser={setUserStatus}
          onSetRole={setUserRole}
          onApproveKyc={approveKyc}
          onRejectKyc={rejectKyc}
          isMutating={isMutating}
        />
      )}
    </div>
  );
}
