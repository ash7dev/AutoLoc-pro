'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type {
  AdminDisputeQueueResponse,
  AdminDisputeQueueItem,
  AdminDisputeDetail,
} from '../../../../core/api/adminAnalyticsApi';

const PAGE_SIZE = 20;

export function useAdminDisputes() {
  const [statut, setStatut] = useState<string>('EN_ATTENTE');
  const [search, setSearch] = useState<string>('');
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const getKey = (pageIndex: number, previousPageData: AdminDisputeQueueResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    if (previousPageData && pageIndex + 1 > previousPageData.meta.totalPages) return null;
    return ['admin-dispute-queue-infinite', statut, search, pageIndex + 1];
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<AdminDisputeQueueResponse>(
    getKey,
    (key) => {
      const [, statusParam, searchParam, pageNum] = key;
      return adminAnalyticsApi.getDisputesQueue({
        statut: statusParam as string,
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

  // Detail query for active modal inspector
  const { data: disputeDetail, isLoading: isLoadingDetail } = useSWR<AdminDisputeDetail>(
    selectedDisputeId ? ['admin-dispute-detail', selectedDisputeId] : null,
    () => adminAnalyticsApi.getDisputeDetail(selectedDisputeId!)
  );

  const items: AdminDisputeQueueItem[] = data ? data.flatMap((page) => page.data) : [];
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

  const resolveDispute = useCallback(
    async (litigeId: string, decision: 'FONDE' | 'NON_FONDE', montantCompensation?: number) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.resolveDispute(litigeId, decision, montantCompensation);
        await mutate();
        setSelectedDisputeId(null);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  return {
    statut,
    setStatut: (newStatut: string) => {
      setStatut(newStatut);
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

    selectedDisputeId,
    setSelectedDisputeId,
    disputeDetail: selectedDisputeId ? disputeDetail : null,
    isLoadingDetail,

    isLoading: isLoadingInitialData,
    isRefreshing: isValidating,
    isMutating,
    refresh: mutate,

    resolveDispute,
  };
}
