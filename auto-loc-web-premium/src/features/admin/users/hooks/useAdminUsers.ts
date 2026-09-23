'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type {
  AdminUserQueueResponse,
  AdminUserQueueItem,
  AdminUserDetailResponse,
} from '../../../../core/api/adminAnalyticsApi';

const PAGE_SIZE = 20;

export function useAdminUsers() {
  const [role, setRole] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const getKey = (pageIndex: number, previousPageData: AdminUserQueueResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    if (previousPageData && pageIndex + 1 > previousPageData.meta.totalPages) return null;
    return ['admin-users-queue-infinite', role, status, search, pageIndex + 1];
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<AdminUserQueueResponse>(
    getKey,
    (key) => {
      const [, roleParam, statusParam, searchParam, pageNum] = key;
      return adminAnalyticsApi.getUsersQueue({
        role: roleParam as string,
        status: statusParam as string,
        search: (searchParam as string).trim() || undefined,
        page: pageNum as number,
        limit: PAGE_SIZE,
      });
    },
    {
      dedupingInterval: 15 * 1000,
      revalidateOnFocus: true,
      revalidateFirstPage: false,
    }
  );

  // Detail query for active inspector modal
  const { data: userDetail, isLoading: isLoadingDetail, mutate: mutateDetail } = useSWR<AdminUserDetailResponse>(
    selectedUserId ? ['admin-user-detail', selectedUserId] : null,
    () => adminAnalyticsApi.getAdminUserDetail(selectedUserId!)
  );

  const items: AdminUserQueueItem[] = data ? data.flatMap((page) => page.data) : [];
  const lastPageMeta = data?.[data.length - 1]?.meta;
  const counts = lastPageMeta?.counts ?? data?.[0]?.meta?.counts;

  const totalPages = lastPageMeta?.totalPages ?? 1;
  const totalItems = lastPageMeta?.total ?? counts?.total ?? items.length;

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined') ||
    (isValidating && size > 1);

  const hasMore = data ? data.length < totalPages : false;

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, setSize]);

  // Actions
  const handleSetUserStatus = useCallback(
    async (userId: string, body: { actif: boolean; bloqueJusqua?: string | null; raison?: string }) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.setUserStatus(userId, body);
        await Promise.all([mutate(), mutateDetail()]);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, mutateDetail]
  );

  const handleSetUserRole = useCallback(
    async (userId: string, newRole: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.setUserRole(userId, newRole);
        await Promise.all([mutate(), mutateDetail()]);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, mutateDetail]
  );

  const handleApproveKyc = useCallback(
    async (userId: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.approveUserKyc(userId);
        await Promise.all([mutate(), mutateDetail()]);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, mutateDetail]
  );

  const handleRejectKyc = useCallback(
    async (userId: string, raison?: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.rejectUserKyc(userId, raison);
        await Promise.all([mutate(), mutateDetail()]);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, mutateDetail]
  );

  return {
    role,
    setRole: (newRole: string) => {
      setRole(newRole);
      setSize(1);
    },
    status,
    setStatus: (newStatus: string) => {
      setStatus(newStatus);
      setSize(1);
    },
    search,
    setSearch: (newSearch: string) => {
      setSearch(newSearch);
      setSize(1);
    },

    items,
    meta: lastPageMeta,
    counts,
    totalItems,
    hasMore,
    isLoadingMore,
    loadMore,

    selectedUserId,
    setSelectedUserId,
    userDetail: selectedUserId ? userDetail : null,
    isLoadingDetail,

    isLoading: isLoadingInitialData,
    isRefreshing: isValidating,
    isMutating,
    refresh: mutate,

    setUserStatus: handleSetUserStatus,
    setUserRole: handleSetUserRole,
    approveKyc: handleApproveKyc,
    rejectKyc: handleRejectKyc,
  };
}
