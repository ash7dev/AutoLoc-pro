import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { apiClient } from '../../../core/api/apiClient';
import { VehicleFeedItem, MobileFeedResponse } from '../types';

export interface SearchFiltersState {
  zone?: string;
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  prixMin?: number;
  prixMax?: number;
  carburant?: string;
  transmission?: string;
  sort?: 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING';
  bbox?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

interface PageResult {
  items: VehicleFeedItem[];
  total: number | null;
  hasMore: boolean;
}

/**
 * Fonction API qui exécute la recherche ou l'exploration paginée.
 */
async function fetchExplorePageApi(
  filters: SearchFiltersState,
  targetPage: number
): Promise<PageResult> {
  const isSearchActive = Boolean(
    filters.zone ||
    (filters.type && filters.type !== 'ALL' && filters.type !== 'TOUS') ||
    filters.dateDebut ||
    filters.dateFin ||
    filters.prixMin ||
    filters.prixMax ||
    filters.carburant ||
    filters.transmission ||
    (filters.sort && filters.sort !== 'RELEVANCE') ||
    filters.bbox
  );

  let newItems: VehicleFeedItem[] = [];
  let canLoadNext = true;
  let totalResult: number | null = null;

  if (isSearchActive) {
    const params: Record<string, any> = {
      page: targetPage,
      limit: 10,
    };

    if (filters.bbox) {
      params.minLat = filters.bbox.minLat;
      params.maxLat = filters.bbox.maxLat;
      params.minLng = filters.bbox.minLng;
      params.maxLng = filters.bbox.maxLng;
    }

    if (filters.zone && typeof filters.zone === 'string' && filters.zone.trim() !== '') {
      const rawZone = filters.zone.trim();
      if (rawZone === 'HorsDakar') {
        params.horsDakar = true;
        params.allowsOutsideDakar = true;
      } else if (rawZone === 'AIBD') {
        params.livraisonAeroport = true;
        params.hasDeliveryFee = true;
      } else if (rawZone !== 'Tout Dakar') {
        params.ville = rawZone;
      }
    }

    if (
      filters.type &&
      typeof filters.type === 'string' &&
      filters.type !== 'ALL' &&
      filters.type !== 'TOUS' &&
      filters.type.trim() !== ''
    ) {
      const rawType = filters.type.toUpperCase().trim();
      if (rawType === 'PREMIUM') {
        params.type = 'LUXE';
      } else if (rawType === 'DAKAR') {
        params.ville = 'Dakar';
      } else if (rawType === 'TOP_RATED') {
        params.sortBy = 'note';
        params.sortOrder = 'desc';
      } else if (rawType === 'ECONOMIC') {
        params.sortBy = 'prixParJour';
        params.sortOrder = 'asc';
      } else if (
        [
          'BERLINE',
          'SUV',
          'PICKUP',
          'MINIVAN',
          'UTILITAIRE',
          'CITADINE',
          'MONOSPACE',
          'MINIBUS',
          'LUXE',
          'FOUR_X_FOUR',
        ].includes(rawType)
      ) {
        params.type = rawType;
      }
    }

    if (filters.dateDebut && typeof filters.dateDebut === 'string' && filters.dateDebut.trim() !== '') {
      params.dateDebut = filters.dateDebut.trim();
    }
    if (filters.dateFin && typeof filters.dateFin === 'string' && filters.dateFin.trim() !== '') {
      params.dateFin = filters.dateFin.trim();
    }
    if (typeof filters.prixMin === 'number' && !isNaN(filters.prixMin) && filters.prixMin > 0) {
      params.prixMin = filters.prixMin;
    }
    if (typeof filters.prixMax === 'number' && !isNaN(filters.prixMax) && filters.prixMax > 0) {
      params.prixMax = filters.prixMax;
    }
    if (filters.carburant && typeof filters.carburant === 'string' && filters.carburant.trim() !== '') {
      params.carburant = filters.carburant.trim();
    }
    if (filters.transmission && typeof filters.transmission === 'string' && filters.transmission.trim() !== '') {
      params.transmission = filters.transmission.trim();
    }

    if (filters.sort === 'PRICE_ASC') {
      params.sortBy = 'prixParJour';
      params.sortOrder = 'asc';
    } else if (filters.sort === 'PRICE_DESC') {
      params.sortBy = 'prixParJour';
      params.sortOrder = 'desc';
    } else if (filters.sort === 'RATING') {
      params.sortBy = 'note';
      params.sortOrder = 'desc';
    }

    const res = await apiClient.get('/vehicles/search', { params });
    const searchData = res.data;

    if (Array.isArray(searchData)) {
      newItems = searchData;
      canLoadNext = searchData.length >= 10;
      totalResult = searchData.length;
    } else if (searchData?.data && Array.isArray(searchData.data)) {
      newItems = searchData.data;
      totalResult = typeof searchData.total === 'number' ? searchData.total : null;
      canLoadNext = totalResult !== null ? targetPage * 10 < totalResult : newItems.length >= 10;
    }
  } else {
    // Mode exploration continu sans filtres
    if (targetPage === 1) {
      const res = await apiClient.get<MobileFeedResponse>('/vehicles/feed/mobile');
      const feedData = res.data;

      if (feedData) {
        const combined: VehicleFeedItem[] = [
          ...(feedData.premium || []),
          ...(feedData.topNotes || []),
          ...(feedData.nouveautes || []),
          ...(feedData.economiques || []),
          ...(feedData.luxe || []),
          ...(feedData.dakar || []),
          ...(feedData.suvMoment || []),
          ...(feedData.berlinesPopulaires || []),
          ...(feedData.recommended?.items || []),
        ];

        const seen = new Set<string>();
        newItems = combined.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
      }
      canLoadNext = true;
      totalResult = newItems.length;
    } else {
      const res = await apiClient.get('/vehicles/search', {
        params: { page: targetPage, limit: 10 },
      });
      const searchData = res.data;
      const fetched = Array.isArray(searchData) ? searchData : searchData?.data || [];
      newItems = fetched;
      canLoadNext = fetched.length >= 10;
      totalResult = fetched.length;
    }
  }

  return {
    items: newItems,
    total: totalResult,
    hasMore: canLoadNext,
  };
}

/**
 * Hook d'exploration paginée avec cache intelligent TanStack React Query :
 * - Empreinte de clé unique par combinaison de filtres (`queryKey: ['exploreVehiclesFeed', filters]`)
 * - Caching pendant 3 minutes par combinaison de filtre
 * - Zero-Flash UI (`placeholderData: keepPreviousData`) : Maintient les résultats actuels pendant l'application d'un nouveau filtre
 */
export function useExploreFeed(filters: SearchFiltersState) {
  // État de géolocalisation utilisateur
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    'undetermined' | 'granted' | 'denied'
  >('undetermined');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    error,
    fetchNextPage,
    hasNextPage,
    refetch: reactQueryRefetch,
  } = useInfiniteQuery({
    queryKey: ['exploreVehiclesFeed', filters],
    queryFn: ({ pageParam = 1 }) => fetchExplorePageApi(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.hasMore || lastPage.items.length === 0) {
        return undefined;
      }
      return allPages.length + 1;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes par combinaison de filtre
    gcTime: 30 * 60 * 1000, // 30 minutes en mémoire
    placeholderData: keepPreviousData, // Zero-flash UI au changement de filtre !
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Aplatir et dédoublonner les éléments issus de toutes les pages paginées
  const vehicles = useMemo(() => {
    if (!data?.pages) return [];
    const allItems = data.pages.flatMap((page) => page.items);
    const seen = new Set<string>();
    return allItems.filter((v) => {
      if (!v || !v.id) return false;
      if (seen.has(v.id)) return false;
      seen.add(v.id);
      return true;
    });
  }, [data]);

  const total = useMemo(() => {
    return data?.pages[0]?.total ?? vehicles.length;
  }, [data, vehicles.length]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const refetch = useCallback(() => {
    reactQueryRefetch();
  }, [reactQueryRefetch]);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermissionStatus('granted');
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      } else {
        setLocationPermissionStatus('denied');
        return null;
      }
    } catch (err) {
      console.warn('Erreur géolocalisation:', err);
      setLocationPermissionStatus('denied');
      return null;
    }
  }, []);

  return {
    vehicles,
    loading: isLoading && vehicles.length === 0,
    loadingMore: isFetchingNextPage,
    refreshing: isRefetching && !isFetchingNextPage,
    hasMore: Boolean(hasNextPage),
    total,
    error: error ? (error as Error).message || 'Impossible de charger les véhicules.' : null,
    refetch,
    loadMore,
    userLocation,
    locationPermissionStatus,
    requestLocationPermission,
  };
}

