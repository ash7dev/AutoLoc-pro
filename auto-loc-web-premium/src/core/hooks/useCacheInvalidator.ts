'use client';

import { useSWRConfig } from 'swr';
import { useCallback } from 'react';

/**
 * Hook central d'invalidation du cache SWR par domaine métier (Pattern Big Tech).
 * Permet d'invalider de manière ciblée les sous-ensembles de clés après une action d'écriture.
 */
export function useCacheInvalidator() {
  const { mutate } = useSWRConfig();

  /**
   * Invalide les données analytiques (Analytics Overview, Revenue, Occupancy, Fleet, Insights)
   */
  const invalidateAnalytics = useCallback(() => {
    return mutate(
      (key) => {
        if (typeof key === 'string') return key.startsWith('analytics-');
        if (Array.isArray(key)) return typeof key[0] === 'string' && key[0].startsWith('analytics-');
        return false;
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  /**
   * Invalide les données du portefeuille (Solde wallet, transactions, comptes bancaires, pénalités)
   */
  const invalidateWallet = useCallback(() => {
    return mutate(
      (key) => {
        if (typeof key === 'string') return key.startsWith('wallet-');
        if (Array.isArray(key)) return typeof key[0] === 'string' && key[0].startsWith('wallet-');
        return false;
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  /**
   * Invalide les notifications et réservations
   */
  const invalidateReservations = useCallback(() => {
    return mutate(
      (key) => {
        if (typeof key === 'string') return key.startsWith('owner-') || key.includes('reservation');
        if (Array.isArray(key)) return typeof key[0] === 'string' && (key[0].startsWith('owner-') || key[0].includes('reservation'));
        return false;
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  /**
   * Invalide les véhicules (liste, détails, indisponibilités, réservations liées) et les métriques de flotte analytiques
   */
  const invalidateVehicles = useCallback(() => {
    invalidateAnalytics();
    return mutate(
      (key) => {
        if (typeof key === 'string') return key.startsWith('owner-vehicle') || key.includes('vehicle');
        if (Array.isArray(key)) return typeof key[0] === 'string' && (key[0].startsWith('owner-vehicle') || key[0].includes('vehicle'));
        return false;
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate, invalidateAnalytics]);

  /**
   * Invalide tout le cache Dashboard d'un coup
   */
  const invalidateDashboardAll = useCallback(() => {
    invalidateAnalytics();
    invalidateWallet();
    invalidateReservations();
    invalidateVehicles();
  }, [invalidateAnalytics, invalidateWallet, invalidateReservations, invalidateVehicles]);

  return {
    invalidateAnalytics,
    invalidateWallet,
    invalidateReservations,
    invalidateVehicles,
    invalidateDashboardAll,
  };
}

