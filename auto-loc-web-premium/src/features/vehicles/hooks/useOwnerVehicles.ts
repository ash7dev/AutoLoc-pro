'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle.types';
import { useUserStore } from '../../../core/store/useUserStore';

export interface UseOwnerVehiclesReturn {
  vehicles: Vehicle[];
  total: number;
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefreshedAt: Date | null;
  isError: boolean;
  isForbidden: boolean;
  error: any;
  mutate: () => Promise<any>;
}

const VEHICLES_SWR_OPTIONS = {
  dedupingInterval: 5 * 60 * 1000, // 5 minutes de rétention cache (données statiques)
  revalidateIfStale: false, // Empêche le re-fetch automatique au remontage du composant
  revalidateOnFocus: false,
  focusThrottleInterval: 30 * 1000,
  keepPreviousData: true, // 0ms de clignotement lors de la réhydratation
  errorRetryCount: 1,
};

/**
 * Hook SWR pour la gestion de la flotte de véhicules du propriétaire.
 * Ne déclenche la requête que si la session est initialisée et que le rôle PROPRIETAIRE est actif.
 */
export function useOwnerVehicles(limit = 50, offset = 0): UseOwnerVehiclesReturn {
  const isInitialized = useUserStore((s) => s.isInitialized);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const capabilities = useUserStore((s) => s.capabilities);

  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  // Condition : ne faire le fetch que si l'utilisateur est authentifié et en mode Hôte/Propriétaire
  const shouldFetch = isInitialized && isAuthenticated && capabilities.isOwner;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? ['owner-vehicles-list', limit, offset] : null,
    async () => {
      const res = await vehicleService.getMyVehicles(limit, offset);
      if (res && Array.isArray(res.data)) {
        return res;
      }
      if (Array.isArray(res)) {
        return { data: res, total: (res as any[]).length, limit, offset };
      }
      return { data: [], total: 0, limit, offset };
    },
    VEHICLES_SWR_OPTIONS
  );

  const isForbidden = Boolean(
    error?.status === 403 ||
      error?.statusCode === 403 ||
      (typeof error?.message === 'string' &&
        (error.message.includes('Rôle') || error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('incomplet')))
  );

  const handleMutate = useCallback(async () => {
    setLastRefreshedAt(new Date());
    return mutate();
  }, [mutate]);

  return {
    vehicles: data?.data ?? [],
    total: data?.total ?? (data?.data?.length ?? 0),
    isLoading: shouldFetch ? (isLoading && (!data || !data.data)) : !isInitialized,
    isRefreshing: isValidating,
    lastRefreshedAt,
    isError: !!error,
    isForbidden,
    error,
    mutate: handleMutate,
  };
}
