import { useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { TenantBookingItem } from '../components/TenantBookingCard';

export type BookingStatusFilter = 'ALL' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_BY_FILTER: Record<Exclude<BookingStatusFilter, 'ALL'>, string> = {
  CONFIRMED: 'CONFIRMEE',
  IN_PROGRESS: 'EN_COURS',
  COMPLETED: 'TERMINEE',
  CANCELLED: 'ANNULEE',
};

async function fetchTenantBookingsApi(statusFilter: BookingStatusFilter): Promise<TenantBookingItem[]> {
  const response = await apiClient.get('/reservations/tenant', {
    params: { page: 1, ...(statusFilter === 'ALL' ? {} : { statut: STATUS_BY_FILTER[statusFilter] }) },
  });
  const data = response.data?.data ?? response.data ?? [];
  return Array.isArray(data) ? data : [];
}

/**
 * Hook de chargement des réservations locataire avec mise en cache TanStack React Query :
 * - `staleTime`: 2 minutes -> Aucun appel inutile si l'utilisateur bascule d'onglet ou navigue dans l'app.
 * - `placeholderData`: `keepPreviousData` -> Maintient l'affichage des réservations lors du changement de filtre de statut sans clignotement ni skeleton !
 */
export function useTenantBookings(statusFilter: BookingStatusFilter = 'ALL') {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: reactQueryRefetch,
  } = useQuery<TenantBookingItem[]>({
    queryKey: ['tenantBookings', statusFilter],
    queryFn: () => fetchTenantBookingsApi(statusFilter),
    staleTime: 2 * 60 * 1000, // 2 minutes de fraîcheur
    gcTime: 24 * 60 * 60 * 1000, // 24 heures en mémoire
    placeholderData: keepPreviousData, // Zéro clignotement au changement de filtre
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const refetch = useCallback(() => {
    reactQueryRefetch();
  }, [reactQueryRefetch]);

  return {
    bookings: data || [],
    loading: isLoading && !data,
    refreshing: isRefetching,
    error: error ? (error as Error).message || 'Impossible de charger vos réservations.' : null,
    refetch,
  };
}

