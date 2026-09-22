import { apiClient } from './apiClient';

export type ReservationStatut =
  | 'INITIEE'
  | 'EN_ATTENTE_PAIEMENT'
  | 'PAYEE'
  | 'CONFIRMEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE'
  | 'EXPIREE'
  | 'LITIGE';

export interface ReservationVehicle {
  id: string;
  marque: string;
  modele: string;
  annee?: number;
  type?: string;
  ville?: string;
  adresse?: string;
  immatriculation?: string;
  photoUrl?: string;
  photos?: { url: string; estPrincipale?: boolean }[];
}

export interface ReservationUser {
  id: string;
  prenom: string;
  nom: string;
  telephone?: string;
  email?: string;
  noteLocataire?: number;
  statutKyc?: string;
}

export interface PhotoEtatLieu {
  id: string;
  type: 'CHECKIN' | 'CHECKOUT';
  url: string;
  categorie?: string | null;
  position: number;
  creeLe: string;
}

export interface OwnerReservationItem {
  id: string;
  statut: ReservationStatut;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  prixTotal: string;
  prixParJour: string;
  commission: string;
  netProprietaire: string;
  montantProprietaire?: string;
  creeLe: string;
  confirmeeLe?: string;
  checkinProprietaireLe?: string;
  checkinLocataireLe?: string;
  tacitCheckinDeadlineLe?: string;
  checkInLe?: string;
  checkOutLe?: string;
  annuleeLe?: string;
  raisonAnnulation?: string;
  modePaiement?: 'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN';
  montantPayeEnLigne?: string;
  montantSoldeCheckin?: string;
  contratUrl?: string;
  paymentUrl?: string;
  adresseLivraison?: string | null;
  fraisLivraison?: string | null;
  vehicule: ReservationVehicle;
  locataire: ReservationUser;
  proprietaire?: { id: string; prenom: string; nom: string; telephone?: string };
  photosEtatLieu?: PhotoEtatLieu[];
  litige?: unknown;
  historique?: {
    id: string;
    ancienStatut: string;
    nouveauStatut: string;
    modifiePar?: string;
    modifieLe: string;
  }[];
  avis?: {
    id: string;
    note: number;
    commentaire?: string;
    creeLe: string;
  }[];
}

export interface OwnerReservationsResponse {
  data: OwnerReservationItem[];
  total: number;
  page: number;
  limit: number;
}

export interface OwnerNotificationsCount {
  pendingConfirmations: number;
  pendingConfirmationsIds: string[];
  pendingLitiges: number;
  pendingLitigesIds: string[];
  total: number;
}

export interface OwnerReservationsQueryParams {
  vehiculeId?: string;
  statut?: string;
  page?: number;
  limit?: number;
}

export interface LocataireDocsResponse {
  prenom: string;
  nom: string;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycSelfieUrl?: string | null;
  kycStatus?: string | null;
  permisUrl?: string | null;
}

export interface CancellationQuoteResponse {
  canCancel: boolean;
  isOwner: boolean;
  refundPercentage: number;
  refundAmount: string;
  commissionRetained: string;
  ownerPenaltyAmount: string;
  ownerPenaltyPercentage: number;
  warnings?: string[];
}

export interface ContractAccessResponse {
  viewUrl: string;
  downloadUrl: string;
  expiresInSeconds: number;
}

export interface CloudinarySignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface RefusCheckinPayload {
  motif: string;
  commentaire?: string;
  raison?: string;
}

export interface LinkPhotoEtatPayload {
  url: string;
  publicId: string;
  type: 'CHECKIN' | 'CHECKOUT';
  categorie?: string;
}

export interface CreateDisputePayload {
  motif: string;
  description: string;
  coutEstime?: number;
}

export interface SignalOverloadPayload {
  nombreOccupantsReel: number;
  commentaire?: string;
  preuveUrl?: string;
}

export const reservationsApi = {
  /**
   * GET /reservations/owner — Liste paginée des réservations propriétaire
   */
  getOwnerReservations: (params?: OwnerReservationsQueryParams): Promise<OwnerReservationsResponse> => {
    return apiClient.get<OwnerReservationsResponse>('/reservations/owner', {
      params: params as Record<string, unknown>,
    });
  },

  /**
   * GET /reservations/owner/notifications — Notifications et alertes propriétaire
   */
  getOwnerNotifications: (): Promise<OwnerNotificationsCount> => {
    return apiClient.get<OwnerNotificationsCount>('/reservations/owner/notifications');
  },

  /**
   * GET /reservations/owner/stats — Métriques et statistiques propriétaire
   */
  getOwnerStats: (): Promise<{
    revenus7Jours: number;
    revenusMois: number;
    revenusAnnee: number;
    variationMoisPourcentage: number;
    reservationsActives: number;
    demandesEnAttenteCount: number;
    tauxOccupation: number;
    noteMoyenneFlotte: number;
    totalVehiculesCount: number;
    litigesOuverts: number;
  }> => {
    return apiClient.get('/reservations/owner/stats');
  },

  /**
   * GET /reservations/:id — Détails d'une réservation
   */
  getReservationDetail: (id: string): Promise<OwnerReservationItem> => {
    return apiClient.get<OwnerReservationItem>(`/reservations/${id}`);
  },

  /**
   * GET /reservations/:id/locataire-docs — Documents KYC + permis du locataire pour le propriétaire
   */
  getLocataireDocs: (id: string): Promise<LocataireDocsResponse> => {
    return apiClient.get<LocataireDocsResponse>(`/reservations/${id}/locataire-docs`);
  },

  /**
   * GET /reservations/:id/cancellation-quote — Simulation des frais/remboursement avant annulation
   */
  getCancellationQuote: (id: string): Promise<CancellationQuoteResponse> => {
    return apiClient.get<CancellationQuoteResponse>(`/reservations/${id}/cancellation-quote`);
  },

  /**
   * GET /reservations/:id/contract-access — Génération d'un lien temporaire d'accès au contrat PDF
   */
  getContractAccessUrl: (id: string): Promise<ContractAccessResponse> => {
    return apiClient.get<ContractAccessResponse>(`/reservations/${id}/contract-access`);
  },

  /**
   * GET /reservations/photos-etat/upload-signature — Signature Cloudinary pour upload direct
   */
  getEtatLieuUploadSignature: (): Promise<CloudinarySignatureResponse> => {
    return apiClient.get<CloudinarySignatureResponse>('/reservations/photos-etat/upload-signature');
  },

  /**
   * PATCH /reservations/:id/confirm — Propriétaire confirme la réservation
   */
  confirmReservation: (id: string, heureDebut: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/reservations/${id}/confirm`, { heureDebut });
  },

  /**
   * PATCH /reservations/:id/checkin?role=PROPRIETAIRE — Propriétaire valide le check-in
   */
  checkinReservation: (id: string, soldeRecu: boolean = true): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/reservations/${id}/checkin?role=PROPRIETAIRE`, { soldeRecu });
  },

  /**
   * PATCH /reservations/:id/checkout — Propriétaire valide le check-out (fin de location)
   */
  checkoutReservation: (id: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/reservations/${id}/checkout`);
  },

  /**
   * PATCH /reservations/:id/cancel — Annuler la réservation
   */
  cancelReservation: (id: string, raison?: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/reservations/${id}/cancel`, { raison });
  },

  /**
   * POST /reservations/:id/refus-checkin — Signaler une non-conformité véhicule au check-in (passage en LITIGE)
   */
  refuseCheckin: (id: string, payload: RefusCheckinPayload): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/refus-checkin`, payload);
  },

  /**
   * POST /reservations/:id/photos-etat/link — Enregistrer une photo d'état des lieux après upload Cloudinary
   */
  linkPhotoEtatLieu: (id: string, payload: LinkPhotoEtatPayload): Promise<PhotoEtatLieu> => {
    return apiClient.post<PhotoEtatLieu>(`/reservations/${id}/photos-etat/link`, payload);
  },

  /**
   * POST /reservations/:id/dispute — Déclarer un litige (dégradation, retard, non-conformité)
   */
  createDispute: (id: string, payload: CreateDisputePayload): Promise<{ success: boolean; disputeId: string }> => {
    return apiClient.post<{ success: boolean; disputeId: string }>(`/reservations/${id}/dispute`, payload);
  },

  /**
   * POST /reservations/:id/signal-noshow — Propriétaire signale un non-présentation du locataire (T+2h)
   */
  signalTenantNoshow: (id: string, commentaire?: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/signal-noshow`, { commentaire });
  },

  /**
   * POST /reservations/:id/signal-overload — Propriétaire signale un dépassement de capacité d'occupants
   */
  signalOverload: (id: string, payload: SignalOverloadPayload): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/signal-overload`, payload);
  },
};

