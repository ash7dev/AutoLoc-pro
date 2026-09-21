'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/config';
import { TenantReservation } from '../components/TenantReservationCard';
import { ReservationStatusFilter } from '../components/TenantReservationStatusPills';

interface TenantReservationsResponse {
  data: TenantReservation[];
  total: number;
  page: number;
  limit: number;
}

export function useTenantReservations(statusFilter: ReservationStatusFilter = 'ALL') {
  const [reservations, setReservations] = useState<TenantReservation[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      // Construction du paramètre de requête statut
      const queryParam = statusFilter !== 'ALL' ? `?statut=${encodeURIComponent(statusFilter)}` : '';
      const response = await fetchApi<TenantReservationsResponse>(`/reservations/tenant${queryParam}`);

      setReservations(response.data || []);
      setTotal(response.total || 0);
    } catch (err: any) {
      console.warn('Erreur chargement réservations tenant:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Impossible de charger vos réservations.');
      setReservations([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  return {
    reservations,
    total,
    isLoading,
    isError,
    errorMessage,
    refetch: loadReservations,
  };
}
