"use client";

import useSWR from 'swr';


import { Vehicle } from '../types/vehicle.types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch vehicles');
  }
  return res.json();
};

export interface UseVehiclesOptions {
  type?: string;
  limit?: number;
}

/**
 * Hook SWR pour récupérer des ensembles de véhicules réactifs
 * filtrés par type (ex: SUV, LUXE, BERLINE) avec mise en cache optimisée.
 */
export function useVehicles(options: UseVehiclesOptions = {}) {
  const { type = '', limit = 8 } = options;

  const queryParams = new URLSearchParams();
  if (type) queryParams.set('type', type);
  if (limit) queryParams.set('limit', limit.toString());

  const key = `/api/vehicles/search?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<Vehicle[]>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    keepPreviousData: true,
    dedupingInterval: 300_000,
    errorRetryCount: 3,
  });

  const rawVehicles: Vehicle[] = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as any).data)
    ? (data as any).data
    : data && typeof data === 'object' && Array.isArray((data as any).vehicles)
    ? (data as any).vehicles
    : [];

  return {
    vehicles: rawVehicles,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
