'use client';

import useSWR from 'swr';
import { fetchApi } from '@/lib/config';
import { TenantReservation } from '../components/TenantReservationCard';
import { ReservationStatusFilter } from '../components/TenantReservationStatusPills';

interface TenantReservationsResponse {
  data: TenantReservation[];
  total: number;
  page: number;
  limit: number;
}

const TENANT_RESERVATIONS_SWR_OPTIONS = {
  dedupingInterval: 3 * 60 * 1000, // 3 minutes de rétention cache (empêche les re-fetchs lors de la navigation inter-onglets)
  revalidateIfStale: false, // Ne pas re-fetcher automatiquement au remontage du composant si la donnée est fraîche
  revalidateOnFocus: true, // Capturer les mises à jour si l'utilisateur revient sur l'onglet
  focusThrottleInterval: 30 * 1000, // Throttlé à 30 secondes max au focus
  keepPreviousData: true, // Évite tout clignotement lors du changement de filtre de statut
};

export function useTenantReservations(statusFilter: ReservationStatusFilter = 'ALL') {
  const queryParam = statusFilter !== 'ALL' ? `?statut=${encodeURIComponent(statusFilter)}` : '';
  const key = `tenant-reservations-${statusFilter}`;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<TenantReservationsResponse>(
    key,
    () => fetchApi<TenantReservationsResponse>(`/reservations/tenant${queryParam}`),
    TENANT_RESERVATIONS_SWR_OPTIONS
  );

  const reservations = data?.data || [];
  const total = data?.total ?? reservations.length;

  return {
    reservations,
    total,
    isLoading: isLoading && reservations.length === 0,
    isValidating,
    isError: !!error,
    errorMessage: error?.message || (error ? 'Impossible de charger vos réservations.' : null),
    refetch: mutate,
  };
}

