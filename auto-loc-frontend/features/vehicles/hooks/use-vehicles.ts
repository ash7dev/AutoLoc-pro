'use client';

import { useState, useCallback } from 'react';
import { useAuthFetch } from '../../auth/hooks/use-auth-fetch';
import type { Vehicle, CreateVehicleInput } from '../../../lib/nestjs/vehicles';
import { VEHICLE_PATHS } from '../../../lib/nestjs/vehicles';

/**
 * Hook de gestion de la liste des véhicules du propriétaire.
 *
 * Usage :
 *   const { vehicles, loading, error, load, create, archive } = useVehicles();
 *   useEffect(() => { load(); }, [load]);
 */
export function useVehicles() {
  const { authFetch } = useAuthFetch();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Charge tous les véhicules du propriétaire connecté. */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch<Vehicle[]>(VEHICLE_PATHS.me);
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  /**
   * Crée un véhicule et l'ajoute en tête de liste.
   * @returns Le véhicule créé, ou null en cas d'erreur.
   */
  const create = useCallback(
    async (input: CreateVehicleInput): Promise<Vehicle | null> => {
      setLoading(true);
      setError(null);
      try {
        const vehicle = await authFetch<Vehicle, CreateVehicleInput>(
          VEHICLE_PATHS.create,
          { method: 'POST', body: input },
        );
        setVehicles((prev) => [vehicle, ...prev]);
        return vehicle;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la création');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authFetch],
  );

  /**
   * Archive un véhicule (statut → ARCHIVE).
   * Le véhicule reste dans la liste avec le statut mis à jour.
   */
  const archive = useCallback(
    async (vehicleId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await authFetch(VEHICLE_PATHS.archive(vehicleId), { method: 'DELETE' });
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicleId ? { ...v, statut: 'ARCHIVE' as const } : v,
          ),
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors de l'archivage");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [authFetch],
  );

  /** Retire un véhicule de la liste locale sans appel réseau. */
  const removeFromList = useCallback((vehicleId: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  }, []);

  return { vehicles, loading, error, load, create, archive, removeFromList };
}
