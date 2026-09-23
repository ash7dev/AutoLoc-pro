'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/lib/config';
import { useCacheInvalidator } from '@/src/core/hooks/useCacheInvalidator';

export interface PhotoEtatLieu {
  id: string;
  url: string;
  type: 'CHECKIN' | 'CHECKOUT';
  categorie?: string;
  creeLe?: string;
}

export interface ReservationEvent {
  id: string;
  titre: string;
  description?: string;
  date: string;
  auteur?: string;
}

export interface TenantReservationDetailData {
  id: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  prixParJour: string | number;
  prixTotal: string | number;
  montantPayeEnLigne?: string | number;
  montantSoldeCheckin?: string | number;
  fraisLivraison?: string | number;
  typeLivraison?: string;
  adresseLivraison?: string;
  horsDakar?: boolean;
  modePaiement?: string;
  paymentUrl?: string;
  checkinProprietaireLe?: string;
  checkinLocataireLe?: string;
  tacitCheckinDeadlineLe?: string;
  raisonAnnulation?: string;
  creeLe?: string;
  vehicule?: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photos?: Array<string | { url: string }>;
    photoUrl?: string;
    immatriculation?: string;
  };
  proprietaire?: {
    id: string;
    prenom: string;
    nom: string;
    telephone?: string;
    email?: string;
    avatarUrl?: string;
  };
  locataire?: {
    id?: string;
    prenom?: string;
    nom?: string;
    telephone?: string;
    email?: string;
  };
  paiement?: {
    statut?: string;
    fournisseur?: string;
    montant?: number;
  };
  photosEtatLieu?: PhotoEtatLieu[];
  litige?: {
    id: string;
    statut: string;
    motif?: string;
    description?: string;
    commentaire?: string;
    creeLe?: string;
  };
  avis?: {
    id?: string;
    note: number;
    commentaire?: string;
    creeLe?: string;
  };
  historique?: ReservationEvent[];
}

export function useTenantReservationDetail(reservationId: string) {
  const [booking, setBooking] = useState<TenantReservationDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { invalidateReservations } = useCacheInvalidator();

  const fetchDetail = useCallback(async () => {
    if (!reservationId) return;

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const data = await fetchApi<TenantReservationDetailData>(`/reservations/${reservationId}`);
      setBooking(data);
    } catch (err: any) {
      console.error('Erreur chargement détail réservation:', err);
      setIsError(true);
      setErrorMessage(err?.message || 'Impossible de récupérer la réservation.');
      setBooking(null);
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const confirmCheckin = async (): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    try {
      await fetchApi(`/reservations/${reservationId}/checkin?role=LOCATAIRE`, {
        method: 'PATCH',
        body: JSON.stringify({ soldeRecu: true }),
      });
      await fetchDetail();
      await invalidateReservations();
      return true;
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la confirmation du check-in');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const refuseCheckin = async (motif: string, commentaire?: string): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    try {
      await fetchApi(`/reservations/${reservationId}/refus-checkin`, {
        method: 'POST',
        body: JSON.stringify({ motif, commentaire: commentaire || '' }),
      });
      await fetchDetail();
      await invalidateReservations();
      return true;
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la déclaration du refus');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelReservation = async (raison: string): Promise<boolean> => {
    if (!reservationId) return false;
    setIsSubmitting(true);
    try {
      await fetchApi(`/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ raison }),
      });
      await fetchDetail();
      await invalidateReservations();
      return true;
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de l’annulation de la réservation');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    booking,
    isLoading,
    isError,
    errorMessage,
    isSubmitting,
    refetch: fetchDetail,
    confirmCheckin,
    refuseCheckin,
    cancelReservation,
  };
}

