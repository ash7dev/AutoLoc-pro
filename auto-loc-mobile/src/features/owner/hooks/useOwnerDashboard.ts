import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerApi, OwnerDashboardStats, OwnerBooking, OwnerVehicle } from '../api/ownerApi';

export const OWNER_QUERY_KEYS = {
  stats: ['owner', 'stats'] as const,
  bookings: ['owner', 'bookings'] as const,
  vehicles: ['owner', 'vehicles'] as const,
  wallet: ['owner', 'wallet'] as const,
  penalties: ['owner', 'penalties'] as const,
};

/**
 * Hook d'agrégation TanStack Query pour le Dashboard Propriétaire (Hôte).
 * 
 * Avantages vs useEffect classique :
 * 1. Zéro requête réseau émise sur retour de navigation si staleTime non expiré.
 * 2. Zéro clignotement / spinner lors des visites ultérieures (Cache-First + SWR).
 * 3. Rafraîchissement automatique en arrière-plan sans bloquer l'UI.
 */
export function useOwnerDashboard() {
  const queryClient = useQueryClient();

  // 1. Requetage des statistiques hôte (staleTime 3 min)
  const {
    data: statsData,
    isLoading: isLoadingStats,
    isRefetching: isRefetchingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery<OwnerDashboardStats>({
    queryKey: OWNER_QUERY_KEYS.stats,
    queryFn: () => ownerApi.getDashboardStats(),
    staleTime: 3 * 60 * 1000, // Données fraîches pendant 3 minutes
    gcTime: 15 * 60 * 1000, // Conservation en mémoire 15 min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 2. Requetage des réservations hôte (staleTime 2 min)
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isRefetching: isRefetchingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery<OwnerBooking[]>({
    queryKey: OWNER_QUERY_KEYS.bookings,
    queryFn: () => ownerApi.getOwnerBookings(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // 3. Requetage de la flotte de véhicules hôte (staleTime 5 min)
  const {
    data: vehiclesData,
    isLoading: isLoadingVehicles,
    isRefetching: isRefetchingVehicles,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useQuery<OwnerVehicle[]>({
    queryKey: OWNER_QUERY_KEYS.vehicles,
    queryFn: () => ownerApi.getOwnerVehicles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = statsData ?? null;
  const allBookings = useMemo(() => bookingsData ?? [], [bookingsData]);
  const pendingBookings = useMemo(
    () => allBookings.filter((b) => b.statut === 'PENDING_APPROVAL'),
    [allBookings]
  );
  const vehicles = useMemo(() => vehiclesData ?? [], [vehiclesData]);

  // Loading initial (seulement si AUCUNE donnée n'est présente en cache)
  const loading = (isLoadingStats && !statsData) || (isLoadingBookings && !bookingsData) || (isLoadingVehicles && !vehiclesData);
  const refreshing = isRefetchingStats || isRefetchingBookings || isRefetchingVehicles;

  // Rafraîchissement manuel complet (ex: Pull-to-Refresh)
  const refetchAll = useCallback(async () => {
    await Promise.all([refetchStats(), refetchBookings(), refetchVehicles()]);
  }, [refetchStats, refetchBookings, refetchVehicles]);

  // Forcer l'invalidation globale de l'univers hôte
  const invalidateAllOwnerQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['owner'] });
  }, [queryClient]);

  return {
    stats,
    allBookings,
    pendingBookings,
    vehicles,
    loading,
    refreshing,
    error: statsError || bookingsError || vehiclesError,
    refetch: refetchAll,
    invalidateAllOwnerQueries,
  };
}
