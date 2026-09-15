import { useState, useEffect, useCallback, useRef } from 'react';
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
}

export function useExploreFeed(filters: SearchFiltersState) {
  const [vehicles, setVehicles] = useState<VehicleFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User Geolocation state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

  const isSearchActive = Boolean(
    filters.zone ||
    (filters.type && filters.type !== 'ALL' && filters.type !== 'TOUS') ||
    filters.dateDebut ||
    filters.dateFin ||
    filters.prixMin ||
    filters.prixMax ||
    filters.carburant ||
    filters.transmission
    || (filters.sort && filters.sort !== 'RELEVANCE')
  );

  // Request location permission contextually when requested (e.g. user toggles Map view)
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
    } catch (error) {
      console.warn('Erreur demande permission géolocalisation:', error);
      setLocationPermissionStatus('denied');
      return null;
    }
  }, []);

  // Fetch initial feed or search results
  const fetchFeedData = useCallback(
    async (isRefresh = false, targetPage = 1) => {
      try {
        setError(null);
        if (targetPage === 1) {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
        } else {
          setLoadingMore(true);
        }

        let newItems: VehicleFeedItem[] = [];
        let canLoadNext = true;

        if (isSearchActive) {
          // MODE 1: Search Endpoint with Active Filters
          const params: Record<string, any> = {
            page: targetPage,
            limit: 10,
          };

          if (filters.zone && typeof filters.zone === 'string' && filters.zone.trim() !== '') {
            params.ville = filters.zone.trim();
          }

          if (filters.type && typeof filters.type === 'string' && filters.type !== 'ALL' && filters.type !== 'TOUS' && filters.type.trim() !== '') {
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
            } else if ([
              'BERLINE', 'SUV', 'PICKUP', 'MINIVAN', 'UTILITAIRE',
              'CITADINE', 'MONOSPACE', 'MINIBUS', 'LUXE', 'FOUR_X_FOUR'
            ].includes(rawType)) {
              params.type = rawType;
            }
          }

          // Transmettre les dates lorsqu'elles sont renseignées
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
            if (targetPage === 1) setTotal(searchData.length);
          } else if (searchData?.data && Array.isArray(searchData.data)) {
            newItems = searchData.data;
            const resultTotal = typeof searchData.total === 'number' ? searchData.total : null;
            if (targetPage === 1) setTotal(resultTotal);
            canLoadNext = resultTotal !== null
              ? targetPage * 10 < resultTotal
              : newItems.length >= 10;
          }
        } else {
          // MODE 2: Filters Empty -> Instagram-style continuous stream
          if (targetPage === 1) {
            // Page 1: Fetch mobile feed with 10 curated sections
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

              // Deduplicate by vehicle ID
              const seen = new Set<string>();
              newItems = combined.filter((item) => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
            }
            canLoadNext = true;
            if (targetPage === 1) setTotal(newItems.length);
          } else {
            // Page 2+: Fetch general paginated search to continue infinite scroll
            const res = await apiClient.get('/vehicles/search', {
              params: { page: targetPage, limit: 10 },
            });
            const searchData = res.data;
            const fetched = Array.isArray(searchData) ? searchData : searchData?.data || [];
            newItems = fetched;
            canLoadNext = fetched.length >= 10;
            if (targetPage === 1) setTotal(fetched.length);
          }
        }

        if (targetPage === 1) {
          setVehicles(newItems);
        } else {
          setVehicles((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const filteredNew = newItems.filter((v) => !existingIds.has(v.id));
            return [...prev, ...filteredNew];
          });
        }

        setPage(targetPage);
        setHasMore(canLoadNext);
      } catch (err) {
        console.error('Erreur chargement feed explorer:', err);
        setError('Impossible de charger les véhicules. Vérifiez votre connexion puis réessayez.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [isSearchActive, filters]
  );

  useEffect(() => {
    fetchFeedData(false, 1);
  }, [fetchFeedData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      fetchFeedData(false, page + 1);
    }
  }, [loadingMore, loading, hasMore, fetchFeedData, page]);

  const refetch = useCallback(() => {
    fetchFeedData(true, 1);
  }, [fetchFeedData]);

  return {
    vehicles,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    total,
    error,
    refetch,
    loadMore,
    userLocation,
    locationPermissionStatus,
    requestLocationPermission,
  };
}
