'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import { adminPayoutsApi } from '../../../../core/api/adminPayoutsApi';
import type { AdminPayoutsQueueResponse, AdminWithdrawalItem, AdminPayoutStats } from '../../../../core/api/adminPayoutsApi';

const PAGE_SIZE = 20;

export function useAdminPayouts() {
  const [statut, setStatut] = useState<string>('EN_ATTENTE');
  const [methode, setMethode] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // SWRInfinite getKey
  const getKey = (pageIndex: number, previousPageData: AdminPayoutsQueueResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    if (previousPageData && pageIndex + 1 > previousPageData.totalPages) return null;
    return ['admin-payouts-queue-infinite', statut, methode, debouncedSearch, pageIndex + 1];
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<AdminPayoutsQueueResponse>(
    getKey,
    (key) => {
      const [, statusParam, methodeParam, searchParam, pageNum] = key;
      return adminPayoutsApi.getPayoutsQueue({
        statut: statusParam as string,
        methode: methodeParam as string,
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

  const items: AdminWithdrawalItem[] = data ? data.flatMap((page) => page.data) : [];
  const lastPageData = data?.[data.length - 1];
  const stats: AdminPayoutStats | undefined = data?.[0]?.stats;

  const totalPages = lastPageData?.totalPages ?? 1;
  const totalItems = lastPageData?.total ?? items.length;

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
  }, [mutate]);

  const selectedWithdrawalItem = items.find((r) => r.id === selectedWithdrawalId) || null;

  // Actions
  const approveWithdrawal = useCallback(async (id: string) => {
    setIsMutating(true);
    try {
      await adminPayoutsApi.approveWithdrawal(id);
      refresh();
      return true;
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la validation du retrait');
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [refresh]);

  const rejectWithdrawal = useCallback(async (id: string, raison: string) => {
    setIsMutating(true);
    try {
      await adminPayoutsApi.rejectWithdrawal(id, raison);
      refresh();
      return true;
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du rejet du retrait');
      return false;
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
    methode,
    setMethode: (newMethode: string) => {
      setMethode(newMethode);
      setSize(1);
    },
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
    isLoading: isLoadingInitialData,
    isRefreshing: isValidating,
    isMutating,
    refresh,
    approveWithdrawal,
    rejectWithdrawal,
  };
}
