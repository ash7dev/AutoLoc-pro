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
  metaData?: any;
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

export interface SavedAccountsResponse {
  lastWaveNumber: string | null;
  lastOmNumber: string | null;
}

export interface PaginatedTransactionsResponse {
  transactions: WalletTransactionItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const walletApi = {
  /**
   * GET /wallet/me — Détails du portefeuille, solde disponible/retirable et transactions
   */
  getWallet: (): Promise<WalletData> => {
    return apiClient.get<WalletData>('/wallet/me');
  },

  /**
   * GET /wallet/penalites — Pénalités en attente du propriétaire
   */
  getPenalties: (): Promise<OwnerPenaltiesResponse> => {
    return apiClient.get<OwnerPenaltiesResponse>('/wallet/penalites');
  },

  /**
   * GET /wallet/accounts — Derniers numéros de virement (Wave / Orange Money)
   */
  getSavedAccounts: async (): Promise<SavedAccountsResponse> => {
    try {
      return await apiClient.get<SavedAccountsResponse>('/wallet/accounts');
    } catch {
      return { lastWaveNumber: null, lastOmNumber: null };
    }
  },

  /**
   * GET /wallet/transactions — Liste paginée des transactions
   */
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    sens?: string;
  }): Promise<PaginatedTransactionsResponse> => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.type) query.append('type', params.type);
      if (params?.sens) query.append('sens', params.sens);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiClient.get<PaginatedTransactionsResponse>(`/wallet/transactions${queryString}`);
    } catch {
      return { transactions: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  /**
   * POST /wallet/withdraw — Demander un retrait vers Wave ou Orange Money
   */
  requestWithdrawal: (body: {
    montant: number;
    methode: 'WAVE' | 'ORANGE_MONEY';
    numeroDestinataire: string;
  }): Promise<{ ok?: boolean; success?: boolean; message?: string }> => {
    return apiClient.post('/wallet/withdraw', body);
  },
};

