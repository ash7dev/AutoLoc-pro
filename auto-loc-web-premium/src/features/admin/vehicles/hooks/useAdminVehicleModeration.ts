'use client';

import { useState, useCallback } from 'react';
import useSWRInfinite from 'swr/infinite';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type { AdminVehicleQueueResponse, AdminVehicleQueueItem } from '../../../../core/api/adminAnalyticsApi';

const PAGE_SIZE = 20;

export function useAdminVehicleModeration() {
  const [statut, setStatut] = useState<string>('EN_ATTENTE_VALIDATION');
  const [search, setSearch] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleQueueItem | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const getKey = (pageIndex: number, previousPageData: AdminVehicleQueueResponse | null) => {
    if (previousPageData && previousPageData.data.length === 0) return null;
    if (previousPageData && pageIndex + 1 > previousPageData.meta.totalPages) return null;
    return ['admin-vehicle-queue-infinite', statut, search, pageIndex + 1];
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<AdminVehicleQueueResponse>(
    getKey,
    (key) => {
      const [, statusParam, searchParam, pageNum] = key;
      return adminAnalyticsApi.getVehicleModerationQueue({
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

  const items: AdminVehicleQueueItem[] = data ? data.flatMap((page) => page.data) : [];
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

  const validateVehicle = useCallback(
    async (vehicleId: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.validateVehicle(vehicleId);
        await mutate();
        setSelectedVehicle(null);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const suspendVehicle = useCallback(
    async (vehicleId: string, raison: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.suspendVehicle(vehicleId, raison);
        await mutate();
        setSelectedVehicle(null);
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const featureVehicle = useCallback(
    async (vehicleId: string, active: boolean, featuredUntil?: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.featureVehicle(vehicleId, active, featuredUntil);
        await mutate();
      } finally {
        setIsMutating(false);
      }
    },
    [mutate]
  );

  const deletePhoto = useCallback(
    async (vehicleId: string, photoId: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.deleteVehiclePhoto(vehicleId, photoId);
        await mutate();
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle((prev) =>
            prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) } : null
          );
        }
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, selectedVehicle]
  );

  const setMainPhoto = useCallback(
    async (vehicleId: string, photoId: string) => {
      setIsMutating(true);
      try {
        await adminAnalyticsApi.setMainVehiclePhoto(vehicleId, photoId);
        await mutate();
        if (selectedVehicle && selectedVehicle.id === vehicleId) {
          setSelectedVehicle((prev) =>
            prev
              ? {
                  ...prev,
                  photos: prev.photos.map((p) => ({
                    ...p,
                    estPrincipale: p.id === photoId,
                  })),
                }
              : null
          );
        }
      } finally {
        setIsMutating(false);
      }
    },
    [mutate, selectedVehicle]
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

    selectedVehicle,
    setSelectedVehicle,

    isLoading: isLoadingInitialData,
    isRefreshing: isValidating,
    isMutating,
    refresh: mutate,

    validateVehicle,
    suspendVehicle,
    featureVehicle,
    deletePhoto,
    setMainPhoto,
  };
}
