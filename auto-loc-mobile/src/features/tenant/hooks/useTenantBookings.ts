import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../core/api/apiClient';
import { TenantBookingItem } from '../components/TenantBookingCard';

export type BookingStatusFilter = 'ALL' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_BY_FILTER: Record<Exclude<BookingStatusFilter, 'ALL'>, string> = {
  CONFIRMED: 'CONFIRMEE',
  IN_PROGRESS: 'EN_COURS',
  COMPLETED: 'TERMINEE',
  CANCELLED: 'ANNULEE',
};

export function useTenantBookings(statusFilter: BookingStatusFilter = 'ALL') {
  const [bookings, setBookings] = useState<TenantBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const response = await apiClient.get('/reservations/tenant', {
        params: { page: 1, ...(statusFilter === 'ALL' ? {} : { statut: STATUS_BY_FILTER[statusFilter] }) },
      });
      const data = response.data?.data ?? response.data ?? [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setBookings([]);
      setError(err?.response?.data?.message || 'Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  return { bookings, loading, refreshing, error, refetch: () => fetchBookings(true) };
}
