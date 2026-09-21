import { apiClient } from './apiClient';

export interface WalletTransactionItem {
  id: string;
  type: string;
  sens: 'CREDIT' | 'DEBIT';
  montant: string;
  soldeApres: string;
  creeLe: string;
  reservationId?: string;
  fournisseur?: 'WAVE' | 'ORANGE_MONEY';
}

export interface WalletData {
  balance: {
    soldeDisponible: string;
    soldeRetirable: string;
    soldeWave: string;
    soldeOrangeMoney: string;
    enAttente: string;
    totalGagne: string;
  };
  transactions: WalletTransactionItem[];
  totalPenalites: number;
  penaltiesCount: number;
}

export interface OwnerPenaltyItem {
  id: string;
  montant: number;
  raison: string;
  creeLe: string;
  reservationId: string;
  vehicule: string;
  dateLocation: string;
}

export interface OwnerPenaltiesResponse {
  penalites: OwnerPenaltyItem[];
  totalDette: number;
  count: number;
}

export const walletApi = {
  /**
   * GET /wallet/me — Détails du portefeuille, solde disponible/retirable et transactions
   */
  getWallet: (): Promise<WalletData> => {
    return apiClient.get<WalletData>('/wallet/me');
  },

  /**
   * GET /wallet/penalties/me — Pénalités en attente du propriétaire
   */
  getPenalties: (): Promise<OwnerPenaltiesResponse> => {
    return apiClient.get<OwnerPenaltiesResponse>('/wallet/penalties/me');
  },

  /**
   * POST /wallet/retrait — Demander un retrait vers Wave ou Orange Money
   */
  requestWithdrawal: (body: {
    montant: number;
    methode: 'WAVE' | 'ORANGE_MONEY';
    numeroDestinataire: string;
  }): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post<{ success: boolean; message?: string }>('/wallet/retrait', body);
  },
};
