import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { MobileFeedResponse, VehicleFeedItem } from '../types';

/**
 * Charge le fil d'actualité du Feed Mobile pour l'espace locataire.
 * Utilise TanStack React Query pour mettre en cache les résultats :
 * - `staleTime`: 5 minutes -> Aucun appel réseau relancé si l'utilisateur quitte et revient sur l'accueil dans ce délai.
 * - `gcTime`: 24 heures -> Les données restent en mémoire.
 * - SWR (Stale-While-Revalidate) -> Si les 5 min sont dépassées, ré-affiche immédiatement le cache et rafraîchit en arrière-plan.
 */
async function fetchMobileFeedApi(): Promise<MobileFeedResponse | null> {
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

  const totalItems = countFeedItems(feed);

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

  return feed;
}

export function useMobileFeed() {
  const {
    data,
    isLoading,
    isRefetching,
    error,
    refetch: reactQueryRefetch,
  } = useQuery<MobileFeedResponse | null>({
    queryKey: ['mobileTenantFeed'],
    queryFn: fetchMobileFeedApi,
    staleTime: 5 * 60 * 1000, // 5 minutes de fraîcheur
    gcTime: 24 * 60 * 60 * 1000, // 24 heures en mémoire
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const refetch = useCallback(async () => {
    await reactQueryRefetch();
  }, [reactQueryRefetch]);

  return {
    data: data || null,
    loading: isLoading && !data,
    refreshing: isRefetching,
    error: error ? (error as Error).message || 'Impossible de charger le fil d’annonces.' : null,
    refetch,
  };
}

