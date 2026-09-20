import { useQuery } from '@tanstack/react-query';
import { ownerApi, OwnerBooking } from '../api/ownerApi';
import { OWNER_QUERY_KEYS } from './useOwnerDashboard';

/**
 * Hook TanStack Query pour la gestion des réservations du propriétaire.
 * 
 * Partage la même clé de cache `['owner', 'bookings']` que `useOwnerDashboard`.
 * Ainsi, lorsque l'utilisateur bascule du Dashboard vers l'onglet Réservations,
 * les données sont immédiatement disponibles en mémoire à 0ms !
 */
export function useOwnerBookings() {
  const {
    data: bookingsData,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<OwnerBooking[]>({
    queryKey: OWNER_QUERY_KEYS.bookings,
    queryFn: () => ownerApi.getOwnerBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes de fraîcheur
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const bookings = bookingsData ?? [];

  const stats = {
    total: bookings.length,
    pendingCount: bookings.filter((b) => b.statut === 'PENDING_APPROVAL').length,
    inProgressCount: bookings.filter((b) => b.statut === 'IN_PROGRESS' || b.statut === 'CONFIRMED').length,
    completedCount: bookings.filter((b) => b.statut === 'COMPLETED').length,
  };

  return {
    bookings,
    stats,
    loading: isLoading && !bookingsData,
    refreshing: isRefetching,
    error,
    refetch,
  };
}
