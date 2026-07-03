import { apiFetch } from './api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WalletBalance {
    soldeDisponible: string;
    soldeWave: string;
    soldeOrangeMoney: string;
    enAttente: string;
    totalGagne: string;
}

export type TransactionType = 'CREDIT_LOCATION' | 'DEBIT_PENALITE' | 'DEBIT_RETRAIT';
export type TransactionSens = 'CREDIT' | 'DEBIT';

export interface WalletTransaction {
    id: string;
    type: TransactionType;
    sens: TransactionSens;
    montant: string;
    soldeApres: string;
    creeLe: string;
    reservationId?: string;
    fournisseur?: 'WAVE' | 'ORANGE_MONEY';
}

export interface WalletData {
    balance: WalletBalance;
    transactions: WalletTransaction[];
}

export interface PenaltyItem {
    id: string;
    montant: number;
    raison: string;
    creeLe: string;
    reservationId: string;
    vehicule: string;
    dateLocation: string;
}

export interface PenaltiesData {
    penalites: PenaltyItem[];
    totalDette: number;
    count: number;
}

// ── API Functions ──────────────────────────────────────────────────────────────

/**
 * Fetch wallet balance + recent transactions (server-side).
 */
export async function fetchWallet(token: string): Promise<WalletData> {
    return apiFetch<WalletData>('/wallet/me', { accessToken: token });
}

/**
 * Fetch pending penalties for the owner (server-side).
 */
export async function fetchPenalties(token: string): Promise<PenaltiesData> {
    return apiFetch<PenaltiesData>('/wallet/penalites', { accessToken: token });
}

/**
 * Request a withdrawal (client-side).
 */
export async function requestWithdrawal(
    montant: number,
    methode: 'WAVE' | 'ORANGE_MONEY',
    numeroDestinataire: string,
): Promise<void> {
    await apiFetch('/wallet/withdraw', {
        method: 'POST',
        body: { montant, methode, numeroDestinataire },
    });

    // ✅ OPTIMISATION: Invalider les caches du wallet après retrait
    const { revalidateTag } = await import('next/cache');
    revalidateTag('owner-wallet');
    revalidateTag('owner-transactions');
}
