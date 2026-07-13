import { apiFetch } from './api-client';
import { CACHE_TAGS, getOwnerScopedTag } from '@/lib/cache-config';

// ── Types ──────────────────────────────────────────────────────────────────────

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

export interface OwnerStats {
    revenusMois: number;
    reservationsActives: number;
    tauxOccupation: number;
    litigesOuverts: number;
}

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
    kycStatus?: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
}

export interface PhotoEtatLieu {
    id: string;
    type: 'CHECKIN' | 'CHECKOUT';
    url: string;
    categorie?: string;
    position: number;
}

export interface Reservation {
    id: string;
    statut: ReservationStatut;
    dateDebut: string;
    dateFin: string;
    nbJours: number;
    prixTotal: string;
    prixParJour: string;
    commission: string;
    montantProprietaire: string;
    creeLe: string;
    confirmeeLe?: string;
    checkInLe?: string;
    checkOutLe?: string;
    annuleeLe?: string;
    checkinProprietaireLe?: string;
    checkinLocataireLe?: string;
    tacitCheckinDeadlineLe?: string | null;
    checkinLocataireSource?: 'USER' | 'SYSTEM_TACIT' | null;
    raisonAnnulation?: string | null;
    contratUrl?: string;
    vehicule: ReservationVehicle;
    locataire: ReservationUser;
    proprietaire: ReservationUser;
    proprietaireId: string;
    adresseLivraison?: string | null;
    fraisLivraison?: string | null;
    paiement?: {
        statut: string;
        fournisseur: string;
        rembourseLe?: string | null;
        montantRembourse?: string | null;
    };
    photosEtatLieu?: PhotoEtatLieu[];
}

export interface ReservationsResponse {
    data: Reservation[];
    total: number;
}

// ── API Functions ──────────────────────────────────────────────────────────────

/**
 * Fetch owner's reservations (server-side).
 */
export async function fetchOwnerReservations(
    token: string,
    params?: { statut?: string; page?: number; limit?: number; vehiculeId?: string },
): Promise<ReservationsResponse> {
    const query = new URLSearchParams();
    if (params?.statut) query.set('statut', params.statut);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.vehiculeId) query.set('vehiculeId', params.vehiculeId);
    const qs = query.toString();

    // ✅ OPTIMISATION: Retirer cache: 'no-store' pour permettre unstable_cache() de fonctionner
    const res = await apiFetch<ReservationsResponse | Reservation[]>(
        `/reservations/owner${qs ? `?${qs}` : ''}`,
        { accessToken: token },
    );
    if (Array.isArray(res)) {
        return { data: res, total: res.length };
    }
    return res;
}

/**
 * Fetch a single reservation by ID (server-side).
 * ✅ OPTIMISATION: Cache activé, sera invalidé par revalidateTag après mutations
 */
export async function fetchReservation(
    token: string,
    id: string,
): Promise<Reservation> {
    return apiFetch<Reservation>(`/reservations/${id}`, { accessToken: token });
}

/**
 * Confirm a reservation (owner action).
 */
export async function confirmReservation(id: string, accessToken?: string): Promise<void> {
    await apiFetch(`/reservations/${id}/confirm`, { method: 'PATCH' });

    // ✅ OPTIMISATION: Invalider les caches après confirmation
    if (typeof window === 'undefined') {
        try {
            const { revalidateTag } = await import('next/cache');
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_reservations, accessToken) : CACHE_TAGS.owner_reservations);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_stats, accessToken) : CACHE_TAGS.owner_stats);
            if (accessToken) revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_analytics, accessToken));
            revalidateTag(`reservation-${id}`);
        } catch (e) {
            console.warn('revalidateTag skipped on client:', e);
        }
    }
}

/**
 * Cancel a reservation.
 */
export async function cancelReservation(
    id: string,
    raison?: string,
    accessToken?: string,
): Promise<void> {
    await apiFetch(`/reservations/${id}/cancel`, {
        method: 'PATCH',
        body: raison ? { raison } : undefined,
    });

    // ✅ OPTIMISATION: Invalider les caches après annulation (wallet + pénalités possibles)
    if (typeof window === 'undefined') {
        try {
            const { revalidateTag } = await import('next/cache');
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_reservations, accessToken) : CACHE_TAGS.owner_reservations);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_wallet, accessToken) : CACHE_TAGS.owner_wallet);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_penalties, accessToken) : CACHE_TAGS.owner_penalties);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_stats, accessToken) : CACHE_TAGS.owner_stats);
            if (accessToken) revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_analytics, accessToken));
            revalidateTag(`reservation-${id}`);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_vehicles, accessToken) : CACHE_TAGS.owner_vehicles); // Disponibilité affectée
            revalidateTag(CACHE_TAGS.vehicle_search);
        } catch (e) {
            console.warn('revalidateTag skipped on client:', e);
        }
    }
}

/**
 * Check-in a reservation.
 */
export async function checkinReservation(id: string, accessToken?: string): Promise<void> {
    await apiFetch(`/reservations/${id}/checkin`, { method: 'PATCH' });

    // ✅ OPTIMISATION: Invalider les caches après check-in
    if (typeof window === 'undefined') {
        try {
            const { revalidateTag } = await import('next/cache');
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_reservations, accessToken) : CACHE_TAGS.owner_reservations);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_stats, accessToken) : CACHE_TAGS.owner_stats);
            if (accessToken) revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_analytics, accessToken));
            revalidateTag(`reservation-${id}`);
        } catch (e) {
            console.warn('revalidateTag skipped on client:', e);
        }
    }
}

/**
 * Check-out a reservation.
 */
export async function checkoutReservation(id: string, accessToken?: string): Promise<void> {
    await apiFetch(`/reservations/${id}/checkout`, { method: 'PATCH' });

    // ✅ OPTIMISATION: Invalider les caches après check-out (wallet + versement)
    if (typeof window === 'undefined') {
        try {
            const { revalidateTag } = await import('next/cache');
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_reservations, accessToken) : CACHE_TAGS.owner_reservations);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_wallet, accessToken) : CACHE_TAGS.owner_wallet);
            revalidateTag(accessToken ? getOwnerScopedTag(CACHE_TAGS.owner_stats, accessToken) : CACHE_TAGS.owner_stats);
            if (accessToken) revalidateTag(getOwnerScopedTag(CACHE_TAGS.owner_analytics, accessToken));
            revalidateTag(`reservation-${id}`);
        } catch (e) {
            console.warn('revalidateTag skipped on client:', e);
        }
    }
}

// ── Tenant functions ──────────────────────────────────────────────────────────

/**
 * Fetch tenant's reservations (server-side).
 */
export async function fetchTenantReservations(
    token?: string,
    params?: { statut?: string },
): Promise<ReservationsResponse> {
    const query = new URLSearchParams();
    if (params?.statut) query.set('statut', params.statut);
    const qs = query.toString();

    return apiFetch<ReservationsResponse>(
        `/reservations/tenant${qs ? `?${qs}` : ''}`,
        { accessToken: token },
    );
}

/**
 * Fetch a single reservation by ID (server-side).
 */
export async function fetchReservationById(
    token: string,
    id: string,
): Promise<Reservation> {
    return apiFetch<Reservation>(`/reservations/${id}`, { accessToken: token });
}

// ── Client-side functions (via proxy) ─────────────────────────────────────────

export interface CreateReservationInput {
    vehiculeId: string;
    dateDebut: string;
    dateFin: string;
    fournisseur: 'WAVE' | 'ORANGE_MONEY';
    idempotencyKey?: string;
    adresseLivraison?: string;
    fraisLivraison?: number;
}

export interface CreateReservationResult {
    reservationId: string;
    paymentUrl: string;
}

/**
 * Create a reservation (client-side via proxy).
 */
export async function createReservation(
    input: CreateReservationInput,
): Promise<CreateReservationResult> {
    return apiFetch<CreateReservationResult, CreateReservationInput>(
        '/reservations',
        { method: 'POST', body: input },
    );
}

/**
 * Simulate payment confirmation (dev/test — client-side via proxy).
 */
export async function confirmPaymentSimulation(
    reservationId: string,
): Promise<void> {
    await apiFetch(`/reservations/${reservationId}/confirm-payment`, {
        method: 'PATCH',
    });
}

// ── Owner stats ────────────────────────────────────────────────────────────────

/**
 * Fetch owner dashboard stats (server-side).
 */
export async function fetchOwnerStats(token: string): Promise<OwnerStats> {
    return apiFetch<OwnerStats>('/reservations/owner/stats', { accessToken: token });
}

// ── Vehicle reservations ───────────────────────────────────────────────────────

/**
 * Fetch reservations for a specific vehicle (server-side, owner only).
 */
export async function fetchVehicleReservations(
    token: string,
    vehicleId: string,
): Promise<ReservationsResponse> {
    const res = await apiFetch<ReservationsResponse | Reservation[]>(
        `/reservations/owner?vehiculeId=${encodeURIComponent(vehicleId)}`,
        { accessToken: token },
    );
    if (Array.isArray(res)) {
        return { data: res, total: res.length };
    }
    return res;
}

// ── Dispute ────────────────────────────────────────────────────────────────────

export interface CreateDisputeInput {
    description: string;
    coutEstime?: number;
}

export interface DisputeResult {
    disputeId: string;
    statut: string;
    creeLe: string;
}

/**
 * Declare a dispute on a reservation (client-side via proxy).
 */
export async function declareDispute(
    reservationId: string,
    dto: CreateDisputeInput,
): Promise<DisputeResult> {
    return apiFetch<DisputeResult, CreateDisputeInput>(
        `/reservations/${reservationId}/dispute`,
        { method: 'POST', body: dto },
    );
}

// ── Photos État des Lieux ──────────────────────────────────────────────────────

export async function fetchPhotosUploadSignature(): Promise<any> {
    return apiFetch('/reservations/photos-etat/upload-signature');
}

export async function linkReservationPhoto(
    reservationId: string,
    body: { url: string; publicId: string; type: 'CHECKIN' | 'CHECKOUT'; categorie?: string },
): Promise<PhotoEtatLieu> {
    return apiFetch<PhotoEtatLieu, any>(`/reservations/${reservationId}/photos-etat/link`, {
        method: 'POST',
        body,
    });
}
