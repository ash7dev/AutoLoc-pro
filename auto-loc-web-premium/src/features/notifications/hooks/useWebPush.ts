'use client';

import { useState, useEffect, useCallback } from 'react';
import { urlBase64ToUint8Array } from '../utils/vapidHelper';
import { pushNotificationApi } from '@/src/core/api/pushNotificationApi';
import { useUserStore } from '@/src/core/store/useUserStore';

// Clé VAPID publique par défaut
const DEFAULT_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BJ_nECrIcUYc0DFHmvijRk6OJ-TyqT9iIKGm69bFc5t3-Y927-imSzmarwvx9obLDeW5m8n1qG8gX3G7A9ppSjQ';

// Helper sécurisé pour récupérer l'enregistrement Service Worker sans blocage infini
async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (reg) return reg;

    reg = await navigator.serviceWorker.register('/sw.js');
    if (reg) return reg;
  } catch (err) {
    console.warn('[WebPush] Direct SW registration attempt failed:', err);
  }

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
  const readyPromise = navigator.serviceWorker.ready.catch(() => null);

  return Promise.race([readyPromise, timeoutPromise]);
}

export function useWebPush() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Détection du support navigateur et de l'état actuel de l'abonnement Push
  const checkSubscription = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    try {
      const registration = await getSWRegistration();
      if (!registration) {
        setIsSubscribed(false);
        return;
      }
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (err: any) {
      console.error('[WebPush] Error checking subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // 2. S'abonner aux notifications Web Push VAPID
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Les notifications push ne sont pas supportées par votre navigateur.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Demander l'autorisation à l'utilisateur
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Permission refusée par l\'utilisateur.');
        setIsLoading(false);
        return false;
      }

      // Attendre la préparation du Service Worker
      const registration = await getSWRegistration();
      if (!registration) {
        throw new Error('Service Worker non disponible. Veuillez rafraîchir la page.');
      }

      // Convertir la clé VAPID publique
      const convertedVapidKey = urlBase64ToUint8Array(DEFAULT_VAPID_PUBLIC_KEY);

      // Créer l'abonnement PushManager VAPID
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      }

      // Extraire les clés p256dh et auth au format base64
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');

      if (!p256dhKey || !authKey) {
        throw new Error('Impossible d\'extraire les clés de chiffrement de l\'abonnement push.');
      }

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      // Transmettre l'abonnement VAPID au backend NestJS
      if (isAuthenticated) {
        await pushNotificationApi.subscribe({
          endpoint: subscription.endpoint,
          keys: { p256dh, auth },
          userAgent: navigator.userAgent,
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        });
      }

      setIsSubscribed(true);
      return true;
    } catch (err: any) {
      console.error('[WebPush] Échec abonnement VAPID:', err);
      setError(err?.message || 'Échec de l\'abonnement aux notifications Push.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isAuthenticated]);

  // 3. Se désabonner des notifications Web Push VAPID
  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    setIsLoading(true);
    setError(null);

    try {
      const registration = await getSWRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();

          if (isAuthenticated) {
            await pushNotificationApi.unsubscribe(endpoint);
          }
        }
      }

      setIsSubscribed(false);
      return true;
    } catch (err: any) {
      console.error('[WebPush] Échec désabonnement:', err);
      setError(err?.message || 'Erreur lors du désabonnement.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isAuthenticated]);

  // 4. Tester l'envoi d'une notification push VAPID instantanée
  const sendTestNotification = useCallback(async () => {
    try {
      await pushNotificationApi.sendTestNotification();
      return true;
    } catch (err: any) {
      console.error('[WebPush] Échec test notification:', err);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscription,
  };
}
