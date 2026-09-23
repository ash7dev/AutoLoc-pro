"use client";

import useSWR from 'swr';


import { Vehicle } from '../types/vehicle.types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch featured vehicles');
  }
  return res.json();
};

/**
 * Hook SWR pour récupérer de manière réactive et optimisée
 * les véhicules populaires / featured via le proxy API Next.js.
 */
export function useFeaturedVehicles(limit = 4) {
  const { data, error, isLoading, mutate } = useSWR<Vehicle[]>(
    `/api/vehicles/featured?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: true,
      dedupingInterval: 300_000,
      errorRetryCount: 3,
    }
  );

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
