import { UserProfile } from '../../types/user';

const CHANNEL_NAME = 'autoloc_auth_cross_tab';

export type AuthBroadcastMessage =
  | { type: 'USER_UPDATED'; payload: UserProfile }
  | { type: 'LOGOUT' }
  | { type: 'KYC_STATUS_CHANGED'; payload: { statutKyc: string; rejectionReason?: string | null } };

let broadcastChannel: BroadcastChannel | null = null;

/**
 * Initialise le canal d'écoute multi-onglets (uniquement côté navigateur)
 */
export function initCrossTabSync(
  onMessage: (event: AuthBroadcastMessage) => void
): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }

  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
      if (event.data) {
        onMessage(event.data);
      }
    };
  } catch (error) {
    console.warn('[CrossTabSync] Failed to initialize BroadcastChannel:', error);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.close();
      broadcastChannel = null;
    }
  };
}

/**
 * Diffuse un événement de mise à jour à tous les autres onglets ouverts
 */
export function broadcastAuthEvent(message: AuthBroadcastMessage): void {
  if (typeof window === 'undefined') return;

  try {
    if (!broadcastChannel && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    }
    broadcastChannel?.postMessage(message);
  } catch (error) {
    console.warn('[CrossTabSync] Broadcast message failed:', error);
  }
}
