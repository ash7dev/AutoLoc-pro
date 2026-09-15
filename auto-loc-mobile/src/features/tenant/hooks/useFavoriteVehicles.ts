import { useCallback, useEffect, useState } from 'react';
import { secureStorage } from '../../../core/storage/secureStore';

export function useFavoriteVehicles() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void secureStorage.getFavoriteVehicleIds().then((ids) => {
      if (isMounted) {
        setFavoriteIds(new Set(ids));
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = useCallback((vehicleId: string) => {
    setFavoriteIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(vehicleId)) {
        nextIds.delete(vehicleId);
      } else {
        nextIds.add(vehicleId);
      }

      void secureStorage.setFavoriteVehicleIds([...nextIds]);
      return nextIds;
    });
  }, []);

  return { favoriteIds, isReady, toggleFavorite };
}
