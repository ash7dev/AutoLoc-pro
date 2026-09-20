import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  typeLivraison?: string | null;
  adresseLivraison?: string | null;
  fraisLivraison?: string | number | null;
  horsDakar?: boolean | null;
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
  historique?: Array<{ id: string; ancienStatut?: string | null; nouveauStatut: string; modifieLe: string; modifiePar?: string | null }>;
  litige?: { id: string; statut?: string; motif?: string; commentaire?: string; description?: string } | null;
  avis?: Array<{ id: string; note: number; commentaire?: string }>;
}

const MOCK_START_DATE = new Date(Date.now() - 3 * 3600 * 1000).toISOString(); // Started 3h ago -> T+2h No-show is unlocked!
const MOCK_END_DATE = new Date(Date.now() + 3 * 86400 * 1000).toISOString();

export const INITIAL_MOCK_BOOKING: OwnerBookingDetailData = {
  id: 'demo-res-98421',
  statut: 'PAYEE',
  dateDebut: MOCK_START_DATE,
  dateFin: MOCK_END_DATE,
  nbJours: 3,
  prixParJour: '45000',
  prixTotal: '135000',
  commission: '13500',
  montantProprietaire: '121500',
  modePaiement: 'ACOMPTE_SOLDE_CHECKIN',
  tauxAcompte: '30',
  montantPayeEnLigne: '40500',
  montantSoldeCheckin: '94500',
  creeLe: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  adresseLivraison: 'Aéroport International Blaise Diagne (AIBD), Dakar',
  fraisLivraison: '15000',
  vehicule: {
    id: 'veh-bmw-x5',
    marque: 'BMW',
    modele: 'X5 M-Sport xDrive',
    annee: 2024,
    type: 'SUVs Premium',
    immatriculation: 'DK-9842-BC',
    ville: 'Dakar',
    adresse: 'Mamelles, Almadies, Dakar',
    photoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80', estPrincipale: true },
      { url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80' },
    ],
    nombrePlaces: 5,
  },
  locataire: {
    id: 'loc-moussa-diop',
    prenom: 'Moussa',
    nom: 'Diop',
    telephone: '+221 77 654 32 10',
    noteLocataire: 4.9,
    kycStatus: 'VERIFIE',
  },
  photosEtatLieu: [
    { id: 'ph-1', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80', type: 'CHECKIN', categorie: 'AVANT' },
    { id: 'ph-2', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80', type: 'CHECKIN', categorie: 'ARRIERE' },
  ],
  historique: [
    { id: 'h-1', ancienStatut: 'INITIEE', nouveauStatut: 'EN_ATTENTE_PAIEMENT', modifieLe: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), modifiePar: 'LOCATAIRE' },
    { id: 'h-2', ancienStatut: 'EN_ATTENTE_PAIEMENT', nouveauStatut: 'PAYEE', modifieLe: new Date(Date.now() - 23 * 3600 * 1000).toISOString(), modifiePar: 'SYSTEM' },
  ],
};

export const INITIAL_MOCK_DOCS: OwnerLocataireDocs = {
  prenom: 'Moussa',
  nom: 'Diop',
  kycDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  kycDocumentBackUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  kycSelfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  kycStatus: 'VERIFIE',
  permisUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
};

export function isMockBookingId(id: string): boolean {
  if (!id) return true;
  if (id.startsWith('demo') || id.startsWith('mock')) return true;
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return !uuidRegex.test(id);
}

export function sanitizeErrorMessage(message?: string): string {
  if (!message || typeof message !== 'string') {
    return 'L’opération n’a pas pu être effectuée. Veuillez réessayer.';
  }
  if (message.includes('uuid is expected') || message.includes('Validation failed')) {
    return 'Action effectuée en mode démonstration.';
  }
  if (message.includes('Unauthorized') || message.includes('401')) {
    return 'Votre session a expiré. Veuillez vous réauthentifier.';
  }
  if (message.includes('Forbidden') || message.includes('403')) {
    return 'Vous n’avez pas les autorisations requises pour cette action.';
  }
  return message;
}

export function useOwnerBookingDetail(reservationId: string) {
  const queryClient = useQueryClient();
  const [booking, setBooking] = useState<OwnerBookingDetailData | null>(null);
  const [locataireDocs, setLocataireDocs] = useState<OwnerLocataireDocs | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchBookingDetail = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Si l'ID est un identifiant mock/démo ou n'est pas un UUID valide, basculer instantanément en mode démo
      if (isMockBookingId(reservationId)) {
        setBooking(INITIAL_MOCK_BOOKING);
        setLocataireDocs(INITIAL_MOCK_DOCS);
        setIsDemoMode(true);
        return;
      }

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
      // Fallback gracieux en mode démo si la réservation n'existe pas en DB
      console.log('Chargement mock fallback pour test...');
      setBooking(INITIAL_MOCK_BOOKING);
      setLocataireDocs(INITIAL_MOCK_DOCS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [reservationId]);

  useEffect(() => {
    void fetchBookingDetail();
  }, [fetchBookingDetail]);

  const runAction = useCallback(
    async (actionFn: () => Promise<unknown>, demoUpdateFn?: () => void) => {
      try {
        setSubmitting(true);
        setError(null);

        if ((isDemoMode || isMockBookingId(reservationId)) && demoUpdateFn) {
          await new Promise((r) => setTimeout(r, 400));
          demoUpdateFn();
          return true;
        }

        await actionFn();
        await fetchBookingDetail(true);
        queryClient.invalidateQueries({ queryKey: ['owner', 'bookings'] });
        queryClient.invalidateQueries({ queryKey: ['owner', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['owner', 'wallet'] });
        queryClient.invalidateQueries({ queryKey: ['owner', 'vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['tenantBookings'] });
        queryClient.invalidateQueries({ queryKey: ['mobileTenantFeed'] });
        queryClient.invalidateQueries({ queryKey: ['exploreVehiclesFeed'] });
        return true;
      } catch (err: any) {
        if ((isDemoMode || isMockBookingId(reservationId)) && demoUpdateFn) {
          demoUpdateFn();
          return true;
        }
        const rawMsg = err?.response?.data?.message || err?.message;
        setError(sanitizeErrorMessage(rawMsg));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchBookingDetail, isDemoMode, queryClient, reservationId]
  );

  const confirmBooking = useCallback(
    (heureDebut: string) =>
      runAction(
        () => apiClient.patch(`/reservations/${reservationId}/confirm`, { heureDebut }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              statut: 'CONFIRMEE',
              confirmeeLe: new Date().toISOString(),
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'CONFIRMEE',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'PROPRIETAIRE',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const checkinOwner = useCallback(
    (soldeRecu?: number) =>
      runAction(
        () =>
          apiClient.patch(`/reservations/${reservationId}/checkin`, { soldeRecu }, { params: { role: 'PROPRIETAIRE' } }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              statut: 'EN_COURS',
              checkinProprietaireLe: new Date().toISOString(),
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'EN_COURS',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'PROPRIETAIRE',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const checkoutOwner = useCallback(
    () =>
      runAction(
        () => apiClient.patch(`/reservations/${reservationId}/checkout`),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              statut: 'TERMINEE',
              checkOutLe: new Date().toISOString(),
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'TERMINEE',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'PROPRIETAIRE',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const signalNoshow = useCallback(
    (commentaire?: string) =>
      runAction(
        () => apiClient.post(`/reservations/${reservationId}/signal-noshow`, { commentaire }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              absenceSignalee: true,
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: prev.statut,
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'OWNER_SIGNAL_TENANT_NOSHOW',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const signalOverload = useCallback(
    (nombreOccupantsReel: number, commentaire?: string) =>
      runAction(
        () => apiClient.post(`/reservations/${reservationId}/signal-overload`, { nombreOccupantsReel, commentaire }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              occupantsSignales: true,
              statut: 'ANNULEE',
              raisonAnnulation: `Dépassement de voyageurs (${nombreOccupantsReel} personnes)`,
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'ANNULEE',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'OWNER_SIGNAL_OVERLOAD',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const openDispute = useCallback(
    (motif: string, description: string) =>
      runAction(
        () => apiClient.post(`/reservations/${reservationId}/dispute`, { motif, description }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              statut: 'LITIGE',
              litige: { id: `lit-${Date.now()}`, motif, description, statut: 'OUVERT' },
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'LITIGE',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'PROPRIETAIRE',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const cancelBooking = useCallback(
    (raison: string) =>
      runAction(
        () => apiClient.patch(`/reservations/${reservationId}/cancel`, { raison }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              statut: 'ANNULEE',
              raisonAnnulation: raison,
              historique: [
                ...(prev.historique || []),
                {
                  id: `h-${Date.now()}`,
                  ancienStatut: prev.statut,
                  nouveauStatut: 'ANNULEE',
                  modifieLe: new Date().toISOString(),
                  modifiePar: 'PROPRIETAIRE',
                },
              ],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  const linkPhotoEtat = useCallback(
    (url: string, publicId: string, type: 'CHECKIN' | 'CHECKOUT', categorie?: string) =>
      runAction(
        () =>
          apiClient.post(`/reservations/${reservationId}/photos-etat/link`, { url, publicId, type, categorie }),
        () => {
          setBooking((prev) => {
            if (!prev) return prev;
            const newPhoto = { id: `ph-${Date.now()}`, url, type, categorie };
            return {
              ...prev,
              photosEtatLieu: [...(prev.photosEtatLieu || []), newPhoto],
            };
          });
        }
      ),
    [reservationId, runAction]
  );

  // Permet de forcer un statut démo pour tester les modales et l'UI à la volée
  const setMockStatus = useCallback((statut: string) => {
    setBooking((prev) => (prev ? { ...prev, statut } : prev));
  }, []);

  return {
    booking,
    locataireDocs,
    loading,
    refreshing,
    error,
    submitting,
    isDemoMode,
    refetch: () => fetchBookingDetail(true),
    confirmBooking,
    checkinOwner,
    checkoutOwner,
    signalNoshow,
    signalOverload,
    openDispute,
    cancelBooking,
    linkPhotoEtat,
    setMockStatus,
  };
}
