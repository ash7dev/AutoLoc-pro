'use client';

import { useState, useCallback } from 'react';
import { useAuthFetch } from '../../auth/hooks/use-auth-fetch';
import type { Vehicle, UpdateVehicleInput } from '../../../lib/nestjs/vehicles';
import { VEHICLE_PATHS } from '../../../lib/nestjs/vehicles';

/**
 * Hook de gestion d'un véhicule unique (détail, modification, photos).
 *
 * Usage :
 *   const { vehicle, loading, error, load, update, deletePhoto } = useVehicle(id);
 *   useEffect(() => { load(); }, [load]);
 */
export function useVehicle(vehicleId: string) {
  const { authFetch } = useAuthFetch();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Charge le détail du véhicule depuis le serveur. */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch<Vehicle>(VEHICLE_PATHS.detail(vehicleId));
      setVehicle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [authFetch, vehicleId]);

  /**
   * Met à jour les informations du véhicule.
   * Seuls les champs fournis sont modifiés (PATCH).
   */
  const update = useCallback(
    async (input: UpdateVehicleInput): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await authFetch<Vehicle, UpdateVehicleInput>(
          VEHICLE_PATHS.update(vehicleId),
          { method: 'PATCH', body: input },
        );
        setVehicle(updated);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authFetch, vehicleId],
  );

  /**
   * Supprime une photo côté serveur et met à jour l'état local.
   * Si la photo supprimée était principale, la suivante est promue.
   */
  const deletePhoto = useCallback(
    async (photoId: string): Promise<boolean> => {
      setError(null);
      try {
        await authFetch(VEHICLE_PATHS.deletePhoto(vehicleId, photoId), {
          method: 'DELETE',
        });
        setVehicle((prev) => {
          if (!prev) return prev;
          const deleted = prev.photos.find((p) => p.id === photoId);
          const remaining = prev.photos.filter((p) => p.id !== photoId);
          // Si la photo supprimée était principale, on promeut la première restante
          const updatedPhotos =
            deleted?.estPrincipale && remaining.length > 0
              ? [{ ...remaining[0], estPrincipale: true }, ...remaining.slice(1)]
              : remaining;
          return { ...prev, photos: updatedPhotos };
        });
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
        return false;
      }
    },
    [authFetch, vehicleId],
  );

  return { vehicle, loading, error, load, update, deletePhoto, setVehicle };
}
