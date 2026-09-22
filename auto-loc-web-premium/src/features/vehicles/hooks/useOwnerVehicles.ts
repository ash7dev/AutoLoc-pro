'use client';

import useSWR from 'swr';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types/vehicle.types';
import { useUserStore } from '../../../core/store/useUserStore';

export interface UseOwnerVehiclesReturn {
  vehicles: Vehicle[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  error: any;
  mutate: () => Promise<any>;
}

/**
 * Hook SWR pour la gestion de la flotte de véhicules du propriétaire.
 * Ne déclenche la requête que si la session est initialisée et que le rôle PROPRIETAIRE est actif.
 */
export function useOwnerVehicles(limit = 50, offset = 0): UseOwnerVehiclesReturn {
  const isInitialized = useUserStore((s) => s.isInitialized);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const capabilities = useUserStore((s) => s.capabilities);

  // Condition : ne faire le fetch que si l'utilisateur est authentifié et en mode Hôte/Propriétaire
  const shouldFetch = isInitialized && isAuthenticated && capabilities.isOwner;

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? ['owner-vehicles-list', limit, offset] : null,
    async () => {
      try {
        const res = await vehicleService.getMyVehicles(limit, offset);
        if (res && Array.isArray(res.data)) {
          return res;
        }
        if (Array.isArray(res)) {
          return { data: res, total: (res as any[]).length, limit, offset };
        }
        return { data: [], total: 0, limit, offset };
      } catch (err: any) {
        console.warn('[useOwnerVehicles] Backend /vehicles/me exception capturée:', err);
        return { data: [], total: 0, limit, offset, error: err };
      }
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 15000,
      errorRetryCount: 1,
    }
  );

  const isForbidden = Boolean(
    error?.status === 403 ||
      error?.statusCode === 403 ||
      (typeof error?.message === 'string' &&
        (error.message.includes('Rôle') || error.message.includes('403') || error.message.includes('Forbidden')))
  );

  return {
    vehicles: data?.data ?? [],
    total: data?.total ?? (data?.data?.length ?? 0),
    isLoading: shouldFetch ? isLoading : !isInitialized,
    isError: !!error || Boolean((data as any)?.error),
    isForbidden,
    error: error || (data as any)?.error,
    mutate,
  };
}
