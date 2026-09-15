import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../core/api/apiClient';
import { TenantBookingItem } from '../components/TenantBookingCard';

export interface BookingDetail extends TenantBookingItem {
  checkinProprietaireLe?: string;
  checkinLocataireLe?: string;
  checkInLe?: string;
  checkOutLe?: string;
  raisonAnnulation?: string;
  adresseLivraison?: string | null;
  contratUrl?: string;
  paymentUrl?: string;
  tacitCheckinDeadlineLe?: string;
  checkinLocataireSource?: 'USER' | 'SYSTEM_TACIT' | string;
  avis?: Array<{ id: string; note: number; commentaire?: string }>;
  fraisLivraison?: string | number | null;
  photosEtatLieu?: Array<{ id: string; url: string; type: 'CHECKIN' | 'CHECKOUT'; categorie?: string }>;
  historique?: Array<{ id: string; ancienStatut?: string | null; nouveauStatut: string; modifieLe: string }>;
  litige?: { id: string; statut?: string; motif?: string; commentaire?: string; description?: string } | null;
}

export function useTenantBookingDetail(reservationId: string) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooking = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const response = await apiClient.get<BookingDetail>(`/reservations/${reservationId}`);
      setBooking(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger cette réservation.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reservationId]);

  useEffect(() => { void fetchBooking(); }, [fetchBooking]);

  const runAction = useCallback(async (request: () => Promise<unknown>) => {
    try {
      setSubmitting(true);
      await request();
      await fetchBooking(true);
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cette action n’a pas pu être effectuée.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchBooking]);

  return {
    booking, loading, refreshing, error, submitting,
    refetch: () => fetchBooking(true),
    cancel: (raison: string) => runAction(() => apiClient.patch(`/reservations/${reservationId}/cancel`, { raison })),
    confirmCheckin: () => runAction(() => apiClient.patch(`/reservations/${reservationId}/checkin`, {}, { params: { role: 'LOCATAIRE' } })),
    refuseCheckin: (motif: string, commentaire: string) => runAction(() => apiClient.post(`/reservations/${reservationId}/refus-checkin`, { motif, commentaire })),
  };
}
