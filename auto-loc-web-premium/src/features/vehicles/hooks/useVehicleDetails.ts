"use client";

import useSWR from 'swr';

import { Vehicle } from '../types/vehicle.types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Erreur lors du chargement des détails du véhicule');
  }
  return res.json();
};

export function useVehicleDetails(vehicleId: string) {
  const { data, error, isLoading, mutate } = useSWR<Vehicle>(
    vehicleId ? `/api/vehicles/${vehicleId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 60000,
    }
  );

  return {
    vehicle: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
