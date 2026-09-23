'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type { AdminReservationQueueResponse, AdminReservationQueueItem } from '../../../../core/api/adminAnalyticsApi';
import { apiClient } from '../../../../core/api/apiClient';

const PAGE_SIZE = 20;

export function useAdminReservations() {
  const [statut, setStatut] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // SWRInfinite getKey
  const getKey = (pageIndex: number, previousPageData: AdminReservationQueueResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    if (previousPageData && pageIndex + 1 > previousPageData.meta.totalPages) return null;
    return ['admin-reservation-queue-infinite', statut, debouncedSearch, pageIndex + 1];
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<AdminReservationQueueResponse>(
    getKey,
    (key) => {
      const [, statusParam, searchParam, pageNum] = key;
      return adminAnalyticsApi.getReservationsQueue({
        statut: statusParam as string,
        search: (searchParam as string).trim() || undefined,
        page: pageNum as number,
        limit: PAGE_SIZE,
      });
    },
    {
      dedupingInterval: 15 * 1000,
      revalidateOnFocus: true,
    }
  );

  // Detail SWR
  const { data: detailData, isLoading: isDetailLoading, mutate: mutateDetail } = useSWR(
    selectedReservationId ? `/admin/reservations/${selectedReservationId}` : null,
    async (url: string) => apiClient.get<any>(url)
  );

  const items: AdminReservationQueueItem[] = data ? data.flatMap((page) => page.data) : [];
  const lastPageMeta = data?.[data.length - 1]?.meta;
  const counts = data?.[0]?.counts;

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

  const refresh = useCallback(() => {
    mutate();
    if (selectedReservationId) mutateDetail();
  }, [mutate, mutateDetail, selectedReservationId]);

  const selectedReservationItem = items.find((r) => r.id === selectedReservationId) || null;

  // Actions
  const forceConfirm = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      await adminAnalyticsApi.forceConfirmReservation(id);
      refresh();
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  const forceCancel = useCallback(async (id: string, raison?: string) => {
    setIsMutating(true);
    try {
      await adminAnalyticsApi.forceCancelReservation(id, raison);
      refresh();
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  const forceComplete = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      await adminAnalyticsApi.forceCompleteReservation(id);
      refresh();
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  return {
    statut,
    setStatut: (newStatut: string) => {
      setStatut(newStatut);
      setSize(1);
    },
    search,
    setSearch,
    items,
    meta: lastPageMeta,
    counts,
    totalItems,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedReservationId,
    setSelectedReservationId,
    selectedReservationItem,
    detailData,
    isLoading: isLoadingInitialData,
    isDetailLoading,
    isRefreshing: isValidating,
    isMutating,
    refresh,
    forceConfirm,
    forceCancel,
    forceComplete,
  };
}
