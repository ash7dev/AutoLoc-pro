'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import {
  reservationsApi,
  OwnerReservationItem,
  OwnerReservationsResponse,
} from '../../../core/api/reservationsApi';
import { useCacheInvalidator } from '../../../core/hooks/useCacheInvalidator';
import { OwnerReservationStats } from '../components/OwnerReservationsHeader';

const RESERVATIONS_SWR_OPTIONS = {
  dedupingInterval: 3 * 60 * 1000, // 3 minutes de rétention cache
  revalidateIfStale: false, // Ne pas re-fetcher automatiquement au remontage du composant
  revalidateOnFocus: true, // Capturer les réservations créées pendant l'absence de l'hôte
  focusThrottleInterval: 30 * 1000, // Throttlé à 30 secondes max au focus
  refreshInterval: 60 * 1000, // Polling passif d'arrière-plan toutes les 60 secondes
  keepPreviousData: true, // 0ms de clignotement lors de la réhydratation
};

export function useOwnerReservations() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const { invalidateDashboardAll } = useCacheInvalidator();

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

  const {
    data: reservationsResponse,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<OwnerReservationsResponse>(
    'owner-all-reservations',
    () => reservationsApi.getOwnerReservations({ limit: 200 }),
    RESERVATIONS_SWR_OPTIONS
  );

  const allReservations: OwnerReservationItem[] = useMemo(() => {
    return reservationsResponse?.data || [];
  }, [reservationsResponse]);

  // Calcul exact des statistiques en mémoire à partir des données réelles
  const stats: OwnerReservationStats = useMemo(() => {
    let enAttente = 0;
    let confirmees = 0;
    let enCours = 0;
    let terminees = 0;
    let annulees = 0;

    allReservations.forEach((r) => {
      const s = r.statut;
      if (s === 'EN_ATTENTE_PAIEMENT' || s === 'INITIEE' || s === 'PAYEE') {
        enAttente++;
      } else if (s === 'CONFIRMEE') {
        confirmees++;
      } else if (s === 'EN_COURS') {
        enCours++;
      } else if (s === 'TERMINEE') {
        terminees++;
      } else if (s === 'ANNULEE' || s === 'EXPIREE' || s === 'LITIGE') {
        annulees++;
      }
    });

    return {
      total: allReservations.length,
      enAttente,
      confirmees,
      enCours,
      terminees,
      annulees,
    };
  }, [allReservations]);

  // Filtrage combiné par pill de statut et recherche texte full-text
  const filteredReservations = useMemo(() => {
    return allReservations.filter((r) => {
      // 1. Filtre statut
      let matchesStatus = true;
      const s = r.statut;
      if (selectedStatus === 'EN_ATTENTE') {
        matchesStatus = s === 'EN_ATTENTE_PAIEMENT' || s === 'INITIEE' || s === 'PAYEE';
      } else if (selectedStatus === 'CONFIRMEE') {
        matchesStatus = s === 'CONFIRMEE';
      } else if (selectedStatus === 'EN_COURS') {
        matchesStatus = s === 'EN_COURS';
      } else if (selectedStatus === 'TERMINEE') {
        matchesStatus = s === 'TERMINEE';
      } else if (selectedStatus === 'ANNULEE') {
        matchesStatus = s === 'ANNULEE' || s === 'EXPIREE' || s === 'LITIGE';
      }

      if (!matchesStatus) return false;

      // 2. Filtre recherche textuelle
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const locataireName = `${r.locataire?.prenom || ''} ${r.locataire?.nom || ''}`.toLowerCase();
      const vehiculeName = `${r.vehicule?.marque || ''} ${r.vehicule?.modele || ''}`.toLowerCase();
      const codeResa = (r.id || '').toLowerCase();

      return locataireName.includes(q) || vehiculeName.includes(q) || codeResa.includes(q);
    });
  }, [allReservations, selectedStatus, searchQuery]);

  /**
   * Rafraîchissement avec invalidation simultanée du dashboard et du wallet
   */
  const handleRefresh = useCallback(async () => {
    setLastRefreshedAt(new Date());
    await Promise.all([mutate(), invalidateDashboardAll()]);
  }, [mutate, invalidateDashboardAll]);

  return {
    allReservations,
    filteredReservations,
    stats,
    isLoading: isLoading && allReservations.length === 0,
    isRefreshing: isValidating,
    lastRefreshedAt,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    mutate,
  };
}
