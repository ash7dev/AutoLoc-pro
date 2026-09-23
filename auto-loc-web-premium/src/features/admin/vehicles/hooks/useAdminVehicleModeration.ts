'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { adminAnalyticsApi } from '../../../../core/api/adminAnalyticsApi';
import type { AdminVehicleQueueResponse, AdminVehicleQueueItem } from '../../../../core/api/adminAnalyticsApi';

export function useAdminVehicleModeration() {
  const [statut, setStatut] = useState<string>('EN_ATTENTE_VALIDATION');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicleQueueItem | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  const { data, isLoading, isValidating, mutate } = useSWR<AdminVehicleQueueResponse>(
    ['admin-vehicle-queue', statut, search, page],
    () => adminAnalyticsApi.getVehicleModerationQueue({
      statut: statut === 'ALL' ? undefined : statut,
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

  return {
    statut,
    setStatut: (newStatut: string) => {
      setStatut(newStatut);
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
    counts: data?.counts,

    selectedVehicle,
    setSelectedVehicle,

    isLoading,
    isRefreshing: isValidating,
    isMutating,
    refresh: mutate,

    validateVehicle,
    suspendVehicle,
    featureVehicle,
  };
}
