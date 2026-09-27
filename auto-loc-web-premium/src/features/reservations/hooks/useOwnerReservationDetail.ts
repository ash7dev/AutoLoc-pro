'use client';

import { useState, useEffect, useCallback } from 'react';
import { reservationsApi, OwnerReservationItem, CreateDisputePayload } from '../../../core/api/reservationsApi';
import { useCacheInvalidator } from '../../../core/hooks/useCacheInvalidator';

export function useOwnerReservationDetail(reservationId: string) {
  const [reservation, setReservation] = useState<OwnerReservationItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { invalidateReservations, invalidateDashboardAll } = useCacheInvalidator();

  const fetchDetail = useCallback(async (isSilent: boolean = false) => {
    if (!reservationId) return;

    if (!isSilent) {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
    }

    try {
      const data = await reservationsApi.getReservationDetail(reservationId);
      setReservation(data);
    } catch (err: any) {
      console.error('Erreur chargement réservation hôte:', err);
      if (!isSilent) {
        setIsError(true);
        setErrorMessage(err?.message || 'Impossible de récupérer la réservation.');
        setReservation(null);
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [reservationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const confirmReservation = async (heureDebut: string = '10:00'): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive (0ms de latence visuelle)
    setReservation((prev) => (prev ? { ...prev, statut: 'CONFIRMEE' } : null));
    try {
      await reservationsApi.confirmReservation(reservationId, heureDebut);
      await Promise.all([fetchDetail(true), invalidateReservations()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors de la confirmation de la réservation');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkinReservation = async (soldeRecu: boolean = true): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive
    setReservation((prev) => (prev ? { ...prev, statut: 'EN_COURS' } : null));
    try {
      await reservationsApi.checkinReservation(reservationId, soldeRecu);
      await Promise.all([fetchDetail(true), invalidateDashboardAll()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors de la validation du check-in');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutReservation = async (): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive
    setReservation((prev) => (prev ? { ...prev, statut: 'TERMINEE' } : null));
    try {
      await reservationsApi.checkoutReservation(reservationId);
      await Promise.all([fetchDetail(true), invalidateDashboardAll()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors de la clôture du check-out');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelReservation = async (raison?: string): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive
    setReservation((prev) => (prev ? { ...prev, statut: 'ANNULEE', raisonAnnulation: raison } : null));
    try {
      await reservationsApi.cancelReservation(reservationId, raison);
      await Promise.all([fetchDetail(true), invalidateReservations()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors de l’annulation de la réservation');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signalNoshow = async (commentaire?: string): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive
    setReservation((prev) => (prev ? { ...prev, statut: 'ANNULEE' } : null));
    try {
      await reservationsApi.signalTenantNoshow(reservationId, commentaire);
      alert('Signalement No-Show enregistré.');
      await Promise.all([fetchDetail(true), invalidateReservations()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors du signalement No-Show');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const createDispute = async (payload: CreateDisputePayload): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    // Mise à jour optimiste réactive
    setReservation((prev) => (prev ? { ...prev, statut: 'LITIGE' } : null));
    try {
      await reservationsApi.createDispute(reservationId, payload);
      await Promise.all([fetchDetail(true), invalidateReservations()]);
      return true;
    } catch (err: any) {
      await fetchDetail(true);
      alert(err?.message || 'Erreur lors de la création du litige');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reservation,
    isLoading,
    isError,
    errorMessage,
    isSubmitting,
    refetch: fetchDetail,
    confirmReservation,
    checkinReservation,
    checkoutReservation,
    cancelReservation,
    signalNoshow,
    createDispute,
  };
}
