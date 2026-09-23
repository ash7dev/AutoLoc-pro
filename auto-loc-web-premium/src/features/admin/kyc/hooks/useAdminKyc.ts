'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type { AdminKycQueueResponse, AdminKycQueueItem } from '../../../../core/api/adminAnalyticsApi';

export function useAdminKyc() {
  const [status, setStatus] = useState<string>('EN_ATTENTE');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<AdminKycQueueItem | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const { data, isLoading, isValidating, mutate } = useSWR<AdminKycQueueResponse>(
    ['admin-kyc-queue', status, search, page],
    () => adminAnalyticsApi.getKycQueue({
      status: status === 'ALL' ? undefined : status,
      search: search.trim() || undefined,
      page,
      limit: 20,
    }),
    {
      dedupingInterval: 15 * 1000,
      revalidateOnFocus: true,
      keepPreviousData: true,
    }
  );

  const approveKyc = useCallback(
    async (userId: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.approveUserKyc(userId);
        await mutate();
        setSelectedItem(null);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const rejectKyc = useCallback(
    async (userId: string, raison?: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.rejectUserKyc(userId, raison);
        await mutate();
        setSelectedItem(null);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  return {
    status,
    setStatus: (newStatus: string) => {
      setStatus(newStatus);
      setPage(1);
    },
    search,
    setSearch: (newSearch: string) => {
      setSearch(newSearch);
      setPage(1);
    },
    page,
    setPage,

    items: data?.data ?? [],
    meta: data?.meta,
    counts: data?.meta?.counts,

    selectedItem,
    setSelectedItem,

    isLoading,
    isRefreshing: isValidating,
    isMutating,
    refresh: mutate,

    approveKyc,
    rejectKyc,
  };
}
