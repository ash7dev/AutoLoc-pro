import { apiClient } from './apiClient';

export type MethodeRetrait = 'WAVE' | 'ORANGE_MONEY';
export type StatutRetrait = 'EN_ATTENTE' | 'EFFECTUE' | 'REJETE';

export interface AdminWithdrawalItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerKycStatus: string;
  walletBalance: number;
  amount: number;
  method: MethodeRetrait;
  numeroDestinataire: string;
  statut: StatutRetrait;
  raisonRejet: string | null;
  idTransactionFournisseur: string | null;
  demandeeLe: string;
  traiteLe: string | null;
}

export interface AdminPayoutStats {
  totalPendingAmount: number;
  pendingCount: number;
  totalApprovedAmount: number;
  approvedCount: number;
  totalRejectedAmount: number;
  rejectedCount: number;
  wavePendingAmount: number;
  wavePendingCount: number;
  omPendingAmount: number;
  omPendingCount: number;
  refundsPendingCount: number;
}

export interface AdminPayoutsQueueResponse {
  data: AdminWithdrawalItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AdminPayoutStats;
}

export interface GetPayoutsQueryParams {
  statut?: string;
  methode?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminPayoutsApi = {
  /**
   * GET /admin/withdrawals/queue — File d'attente paginée des retraits et reversements
   */
  getPayoutsQueue: (params?: GetPayoutsQueryParams): Promise<AdminPayoutsQueueResponse> => {
    return apiClient.get<AdminPayoutsQueueResponse>('/admin/withdrawals/queue', {
      params: params as Record<string, unknown>,
    });
  },

  /**
   * GET /admin/withdrawals/stats — Métriques et statistiques des reversements
   */
  getPayoutStats: (): Promise<AdminPayoutStats> => {
    return apiClient.get<AdminPayoutStats>('/admin/withdrawals/stats');
  },

  /**
   * PATCH /admin/withdrawals/:id/approve — Approuver et marquer un retrait effectué
   */
  approveWithdrawal: (id: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/admin/withdrawals/${id}/approve`);
  },

  /**
   * PATCH /admin/withdrawals/:id/reject — Rejeter une demande et rembourser le wallet
   */
  rejectWithdrawal: (id: string, raison: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/admin/withdrawals/${id}/reject`, { raison });
  },
};
