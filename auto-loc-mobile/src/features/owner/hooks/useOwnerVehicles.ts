import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ownerApi, OwnerVehicle } from '../api/ownerApi';
import { OWNER_QUERY_KEYS } from './useOwnerDashboard';

/**
 * Hook TanStack Query pour la gestion de la flotte de véhicules du propriétaire.
 * 
 * Partage la même clé de cache `['owner', 'vehicles']` que `useOwnerDashboard`.
 * Ainsi, lorsque l'utilisateur navigue du Dashboard vers l'onglet Véhicules,
 * la liste est déjà disponible en mémoire à 0ms !
 */
export function useOwnerVehicles() {
  const queryClient = useQueryClient();

  const {
    data: vehiclesData,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<OwnerVehicle[]>({
    queryKey: OWNER_QUERY_KEYS.vehicles,
    queryFn: () => ownerApi.getOwnerVehicles(),
    staleTime: 5 * 60 * 1000, // 5 minutes de fraîcheur
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const vehicles = vehiclesData ?? [];

  return {
    vehicles,
    loading: isLoading && !vehiclesData,
    refreshing: isRefetching,
    error,
    refetch,
  };
}
