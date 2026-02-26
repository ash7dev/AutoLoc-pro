import { apiFetch } from './api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WalletBalance {
    soldeDisponible: string;
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
}

export interface WalletData {
    balance: WalletBalance;
    transactions: WalletTransaction[];
}

// ── API Functions ──────────────────────────────────────────────────────────────

/**
 * Fetch wallet balance + recent transactions (server-side).
 */
export async function fetchWallet(token: string): Promise<WalletData> {
    return apiFetch<WalletData>('/wallet/me', { accessToken: token });
}

/**
 * Request a withdrawal (client-side).
 */
export async function requestWithdrawal(montant: number): Promise<void> {
    await apiFetch('/wallet/withdraw', {
        method: 'POST',
        body: { montant },
    });
}
