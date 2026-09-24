import { apiClient } from './apiClient';

export type TargetAudience = 'TOUS' | 'HOTES' | 'LOCATAIRES' | 'KYC_VALIDE';
export type BroadcastChannel = 'PUSH_MOBILE' | 'WEB_PUSH' | 'EMAIL' | 'WHATSAPP';

export interface AdminAudienceStats {
  totalUsers: number;
  totalHotes: number;
  totalLocataires: number;
  totalKycVerifies: number;
  reach: {
    pushMobileExpo: number;
    webPushVapid: number;
    totalPushSubscriptions: number;
    emailDeliverable: number;
    smsWhatsappDeliverable: number;
  };
  channelHealth: {
    pushStatus: 'ACTIVE' | 'READY';
    emailStatus: 'ACTIVE' | 'READY';
    whatsappStatus: 'ACTIVE' | 'READY';
  };
}

export interface BroadcastHistoryItem {
  id: string;
  title: string;
  message: string;
  targetAudience: TargetAudience;
  channels: BroadcastChannel[];
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  sentAt: string;
  sentBy: string;
  status: 'DELIVERED' | 'PARTIAL' | 'FAILED';
}

export interface SendBroadcastDto {
  title: string;
  message: string;
  targetAudience: TargetAudience;
  channels: BroadcastChannel[];
  url?: string;
  imageUrl?: string;
}

export interface SendBroadcastResponse {
  success: boolean;
  broadcastId: string;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  channelBreakdown: Record<BroadcastChannel, number>;
  sentAt: string;
  message: string;
}

export const adminBroadcastApi = {
  /**
   * GET /admin/broadcast/audience-stats — Métriques de portée d'audience
   */
  getAudienceStats: (): Promise<AdminAudienceStats> => {
    return apiClient.get<AdminAudienceStats>('/admin/broadcast/audience-stats');
  },

  /**
   * GET /admin/broadcast/history — Historique des diffusions passées
   */
  getHistory: (): Promise<BroadcastHistoryItem[]> => {
    return apiClient.get<BroadcastHistoryItem[]>('/admin/broadcast/history');
  },

  /**
   * POST /admin/broadcast/send — Envoyer une notification broadcast multi-canale
   */
  sendBroadcast: (dto: SendBroadcastDto): Promise<SendBroadcastResponse> => {
    return apiClient.post<SendBroadcastResponse>('/admin/broadcast/send', dto);
  },
};
