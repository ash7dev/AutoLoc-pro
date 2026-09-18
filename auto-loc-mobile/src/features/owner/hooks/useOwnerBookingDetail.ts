import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../core/api/apiClient';

export interface OwnerLocataireDocs {
  prenom: string;
  nom: string;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycSelfieUrl?: string | null;
  kycStatus?: string | null;
  permisUrl?: string | null;
}

export interface OwnerBookingDetailData {
  id: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  prixParJour: string;
  prixTotal: string;
  commission: string;
  montantProprietaire: string;
  modePaiement: string;
  tauxAcompte?: string | null;
  montantPayeEnLigne: string;
  montantSoldeCheckin: string;
  montantCommissionEnLigne?: string;
  montantProprietaireEnLigne?: string;
  soldeConfirmeLe?: string;
  creeLe: string;
  confirmeeLe?: string;
  checkinProprietaireLe?: string;
  checkinLocataireLe?: string;
  tacitCheckinDeadlineLe?: string;
  checkinLocataireSource?: string;
  checkInLe?: string;
  checkOutLe?: string;
  annuleeLe?: string;
  raisonAnnulation?: string;
  contratUrl?: string;
  adresseLivraison?: string | null;
  fraisLivraison?: string | number | null;
  absenceSignalee?: boolean;
  occupantsSignales?: boolean;
  vehicule?: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    immatriculation?: string;
    ville?: string;
    adresse?: string;
    photoUrl?: string;
    photos?: Array<string | { url: string; estPrincipale?: boolean }>;
    nombrePlaces?: number;
  };
  locataire?: {
    id: string;
    prenom: string;
    nom: string;
    telephone?: string;
    noteLocataire?: number;
    kycStatus?: string;
  };
  photosEtatLieu?: Array<{ id: string; url: string; type: 'CHECKIN' | 'CHECKOUT'; categorie?: string }>;
  historique?: Array<{ id: string; ancienStatut?: string | null; nouveauStatut: string; modifieLe: string }>;
  litige?: { id: string; statut?: string; motif?: string; commentaire?: string; description?: string } | null;
  avis?: Array<{ id: string; note: number; commentaire?: string }>;
}

export function useOwnerBookingDetail(reservationId: string) {
  const [booking, setBooking] = useState<OwnerBookingDetailData | null>(null);
  const [locataireDocs, setLocataireDocs] = useState<OwnerLocataireDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBookingDetail = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [resDetail, resDocs] = await Promise.allSettled([
        apiClient.get<OwnerBookingDetailData>(`/reservations/${reservationId}`),
        apiClient.get<OwnerLocataireDocs>(`/reservations/${reservationId}/locataire-docs`),
      ]);

      if (resDetail.status === 'fulfilled') {
        setBooking(resDetail.value.data);
      } else {
        throw resDetail.reason;
      }

      if (resDocs.status === 'fulfilled') {
        setLocataireDocs(resDocs.value.data);
      } else {
        setLocataireDocs(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger les détails de cette réservation.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reservationId]);

  useEffect(() => {
    void fetchBookingDetail();
  }, [fetchBookingDetail]);

  const runAction = useCallback(async (actionFn: () => Promise<unknown>) => {
    try {
      setSubmitting(true);
      setError(null);
      await actionFn();
      await fetchBookingDetail(true);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Cette action n’a pas pu être effectuée.';
      setError(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchBookingDetail]);

  const confirmBooking = useCallback(
    (heureDebut: string) =>
      runAction(() => apiClient.patch(`/reservations/${reservationId}/confirm`, { heureDebut })),
    [reservationId, runAction]
  );

  const checkinOwner = useCallback(
    (soldeRecu?: number) =>
      runAction(() =>
        apiClient.patch(`/reservations/${reservationId}/checkin`, { soldeRecu }, { params: { role: 'PROPRIETAIRE' } })
      ),
    [reservationId, runAction]
  );

  const checkoutOwner = useCallback(
    () => runAction(() => apiClient.patch(`/reservations/${reservationId}/checkout`)),
    [reservationId, runAction]
  );

  const signalNoshow = useCallback(
    (commentaire?: string) =>
      runAction(() => apiClient.post(`/reservations/${reservationId}/signal-noshow`, { commentaire })),
    [reservationId, runAction]
  );

  const signalOverload = useCallback(
    (nombreOccupantsReel: number, commentaire?: string) =>
      runAction(() => apiClient.post(`/reservations/${reservationId}/signal-overload`, { nombreOccupantsReel, commentaire })),
    [reservationId, runAction]
  );

  const openDispute = useCallback(
    (motif: string, description: string) =>
      runAction(() => apiClient.post(`/reservations/${reservationId}/dispute`, { motif, description })),
    [reservationId, runAction]
  );

  const linkPhotoEtat = useCallback(
    (url: string, publicId: string, type: 'CHECKIN' | 'CHECKOUT', categorie?: string) =>
      runAction(() =>
        apiClient.post(`/reservations/${reservationId}/photos-etat/link`, { url, publicId, type, categorie })
      ),
    [reservationId, runAction]
  );

  return {
    booking,
    locataireDocs,
    loading,
    refreshing,
    error,
    submitting,
    refetch: () => fetchBookingDetail(true),
    confirmBooking,
    checkinOwner,
    checkoutOwner,
    signalNoshow,
    signalOverload,
    openDispute,
    linkPhotoEtat,
  };
}
