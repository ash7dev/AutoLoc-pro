import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/apiClient';
import { MobileFeedResponse, VehicleFeedItem } from '../types';

export function useMobileFeed() {
  const [data, setData] = useState<MobileFeedResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let feed: MobileFeedResponse | null = null;

      // 1. Tenter le chargement principal via GET /vehicles/feed/mobile
      try {
        const response = await apiClient.get<MobileFeedResponse>('/vehicles/feed/mobile');
        feed = response.data;
      } catch (err: any) {
        console.warn('GET /vehicles/feed/mobile non disponible, tentative de secours...');
      }

      // Compter le nombre total de véhicules retournés par feed/mobile
      const countFeedItems = (f: MobileFeedResponse | null) => {
        if (!f) return 0;
        return (
          (f.premium?.length || 0) +
          (f.nouveautes?.length || 0) +
          (f.topNotes?.length || 0) +
          (f.economiques?.length || 0) +
          (f.luxe?.length || 0) +
          (f.dakar?.length || 0) +
          (f.suvMoment?.length || 0) +
          (f.berlinesPopulaires?.length || 0) +
          (f.recommended?.items?.length || 0)
        );
      };

      let totalItems = countFeedItems(feed);

      // 2. Si feed/mobile est vide ou a échoué, exécuter le fallback via GET /vehicles/search
      if (totalItems === 0) {
        try {
          const searchRes = await apiClient.get<{ data: VehicleFeedItem[] }>('/vehicles/search');
          const searchItems = searchRes.data?.data || (Array.isArray(searchRes.data) ? searchRes.data : []);

          if (searchItems.length > 0) {
            feed = {
              premium: searchItems.filter((v) => v.isFeatured || v.note >= 4.5),
              nouveautes: searchItems,
              topNotes: searchItems.filter((v) => (v.note || 5) >= 4.0),
              economiques: searchItems,
              luxe: searchItems.filter((v) => ['SUV', 'FOUR_X_FOUR', 'LUXE', 'PICKUP'].includes(v.type)),
              dakar: searchItems.filter((v) => v.ville?.toLowerCase().includes('dakar')),
              suvMoment: searchItems.filter((v) => v.type === 'SUV'),
              berlinesPopulaires: searchItems.filter((v) => v.type === 'BERLINE' || v.type === 'CITADINE'),
              recommended: {
                items: searchItems,
                excludedIds: [],
              },
            };
          }
        } catch (searchErr) {
          console.warn('GET /vehicles/search a échoué également:', searchErr);
        }
      }

      setData(feed);
    } catch (err: any) {
      console.warn('Erreur globale lors du chargement du feed mobile:', err?.message || err);
      setError(err?.response?.data?.message || 'Impossible de charger le fil d’annonces.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const refetch = useCallback(() => {
    return fetchFeed(true);
  }, [fetchFeed]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
  };
}
