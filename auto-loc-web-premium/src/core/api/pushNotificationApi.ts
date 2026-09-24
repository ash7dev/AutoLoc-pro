import { apiClient } from './apiClient';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface SubscribePushDto {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
  deviceType?: string;
}

export const pushNotificationApi = {
  /**
   * POST /notifications/subscribe — Enregistre un abonnement Web Push VAPID
   */
  subscribe: (dto: SubscribePushDto): Promise<{ success: boolean }> => {
    return apiClient.post('/notifications/subscribe', dto);
  },

  /**
   * DELETE /notifications/unsubscribe — Supprime un abonnement Push
   */
  unsubscribe: (endpoint: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/notifications/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`);
  },

  /**
   * POST /notifications/test — Envoie une notification de test VAPID
   */
  sendTestNotification: (): Promise<any> => {
    return apiClient.post('/notifications/test', {});
  },
};
