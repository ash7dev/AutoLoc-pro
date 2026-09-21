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
  creeLe: string;
  confirmeeLe?: string;
  checkInLe?: string;
  checkOutLe?: string;
  annuleeLe?: string;
  modePaiement?: 'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN';
  montantPayeEnLigne?: string;
  montantSoldeCheckin?: string;
  vehicule: ReservationVehicle;
  locataire: ReservationUser;
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
   * GET /reservations/:id — Détails d'une réservation
   */
  getReservationDetail: (id: string): Promise<OwnerReservationItem> => {
    return apiClient.get<OwnerReservationItem>(`/reservations/${id}`);
  },

  /**
   * PATCH /reservations/:id/confirm — Confirmer une réservation
   */
  confirmReservation: (id: string, heureDebut?: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/confirm`, { heureDebut });
  },

  /**
   * PATCH /reservations/:id/checkin — Valider le check-in
   */
  checkinReservation: (id: string, soldeRecu: boolean = true): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/checkin?role=PROPRIETAIRE`, { soldeRecu });
  },

  /**
   * PATCH /reservations/:id/checkout — Valider le check-out (clôture)
   */
  checkoutReservation: (id: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/checkout`);
  },

  /**
   * PATCH /reservations/:id/cancel — Annuler une réservation
   */
  cancelReservation: (id: string, raison?: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/reservations/${id}/cancel`, { raison });
  },
};
