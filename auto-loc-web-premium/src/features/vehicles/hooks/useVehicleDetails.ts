"use client";

import useSWR from 'swr';
import { Vehicle } from '../types/vehicle.types';
import { vehicleService } from '../services/vehicleService';

export function useVehicleDetails(vehicleId: string) {
  const { data: vehicle, error, isLoading, mutate } = useSWR<Vehicle>(
    vehicleId ? `owner-vehicle-detail-${vehicleId}` : null,
    () => vehicleService.getVehicleById(vehicleId),
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 15000,
    }
  );

  // Hook for indisponibilites
  const {
    data: indisposRaw,
    isLoading: isLoadingIndispos,
    mutate: mutateIndispos,
  } = useSWR(
    vehicleId ? `owner-vehicle-indispos-${vehicleId}` : null,
    () => vehicleService.getIndisponibilites(vehicleId).catch(() => []),
    {
      revalidateOnFocus: false,
    }
  );

  // Hook for vehicle reservations
  const {
    data: reservationsRaw,
    isLoading: isLoadingReservations,
    mutate: mutateReservations,
  } = useSWR(
    vehicleId ? `owner-vehicle-reservations-${vehicleId}` : null,
    () => vehicleService.getVehicleReservations(vehicleId).catch(() => []),
    {
      revalidateOnFocus: false,
    }
  );

  const indisponibilites = Array.isArray(indisposRaw)
    ? indisposRaw
    : Array.isArray((indisposRaw as any)?.data)
    ? (indisposRaw as any).data
    : Array.isArray((vehicle as any)?.indisponibilites)
    ? (vehicle as any).indisponibilites
    : [];

  const vehicleReservations = Array.isArray(reservationsRaw)
    ? reservationsRaw
    : Array.isArray((reservationsRaw as any)?.data)
    ? (reservationsRaw as any).data
    : [];

  return {
    vehicle,
    indisponibilites,
    vehicleReservations,
    isLoading,
    isLoadingIndispos,
    isLoadingReservations,
    isError: !!error,
    error,
    mutate,
    mutateIndispos,
    mutateReservations,
  };
}
