import { apiFetch } from './api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type TypeAvis = 'LOCATAIRE_NOTE_PROPRIO' | 'PROPRIO_NOTE_LOCATAIRE';

export interface Review {
    id: string;
    note: number;
    commentaire?: string;
    typeAvis: TypeAvis;
    creeLe: string;
    auteur: {
        prenom: string;
        nom: string;
    };
    reservation?: {
        id: string;
        vehicule?: {
            marque: string;
            modele: string;
        };
    };
}

export interface ReviewStats {
    average: number;
    total: number;
}

export interface ReviewsResponse {
    avis: Review[];
    stats: ReviewStats;
}

// ── API Functions ──────────────────────────────────────────────────────────────

/**
 * Fetch reviews for a user (server-side).
 */
export async function fetchUserReviews(
    token: string,
    userId: string,
): Promise<ReviewsResponse> {
    return apiFetch<ReviewsResponse>(`/reviews/user/${userId}`, {
        accessToken: token,
    });
}

/**
 * Create a review (client-side).
 */
export async function createReview(data: {
    reservationId: string;
    note: number;
    commentaire?: string;
}): Promise<void> {
    await apiFetch('/reviews', { method: 'POST', body: data });
}
