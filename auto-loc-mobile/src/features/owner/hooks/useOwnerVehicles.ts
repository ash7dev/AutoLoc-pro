import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ownerApi, OwnerVehicle } from '../api/ownerApi';
import { OWNER_QUERY_KEYS } from './useOwnerDashboard';

/**
 * Hook TanStack Query pour la gestion de la flotte de véhicules du propriétaire
 * avec support de pagination infinie (Instagram Smart Scroll).
 */
export function useOwnerVehicles(pageSize = 10) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...OWNER_QUERY_KEYS.vehicles, 'infinite', pageSize],
    queryFn: ({ pageParam = 0 }) => ownerApi.getOwnerVehiclesPaginated(pageSize, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.offset + lastPage.limit;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes de fraîcheur
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const vehicles = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const total = data?.pages[0]?.total ?? vehicles.length;

  return {
    vehicles,
    total,
    loading: isLoading && !data,
    refreshing: isRefetching,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    error,
    refetch,
  };
}
