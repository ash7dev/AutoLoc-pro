import { apiClient } from './apiClient';

export interface OwnerReviewItem {
  id: string;
  note: number;
  commentaire: string | null;
  creeLe: string;
  auteur: {
    prenom: string;
    nom: string;
    avatarUrl?: string | null;
  };
  reservation: {
    vehicule: {
      marque: string;
      modele: string;
    };
  };
}

export interface OwnerReviewsResponse {
  data: OwnerReviewItem[];
  total: number;
  noteMoyenne: number;
}

export const reviewsApi = {
  /**
   * GET /reviews/user/:userId — Avis reçus par l'utilisateur
   */
  getUserReviews: (userId: string): Promise<OwnerReviewsResponse> => {
    return apiClient.get<OwnerReviewsResponse>(`/reviews/user/${userId}`);
  },
};
