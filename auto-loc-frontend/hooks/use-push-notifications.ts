'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiFetch } from '@/lib/nestjs/api-client';

/**
 * Utilitaire pour convertir la clé VAPID publique (Base64) en Uint8Array
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(true);

  // Vérifier le support et l'état actuel au montage
  useEffect(() => {
    const checkSupport = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        setPermission(Notification.permission);
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          setSubscription(sub);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'abonnement push:', error);
        }
      } else {
        setPermission('unsupported');
      }
      setLoading(false);
    };

    checkSupport();
  }, []);

  /**
   * S'abonner aux notifications push
   */
  const subscribe = useCallback(async () => {
    const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    
    if (!VAPID_KEY) {
      throw new Error('La clé publique VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY) est absente des variables d\'environnement.');
    }

    if (!isSupported) return null;

    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });

      setSubscription(sub);
      setPermission(Notification.permission);
      
      const subJSON = sub.toJSON();

      // Sauvegarder l'abonnement dans le backend Nest.js
      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: {
          endpoint: subJSON.endpoint,
          keys: subJSON.keys,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'MOBILE' : 'DESKTOP',
        },
      });
      
      return sub;
    } catch (error) {
      console.error('Échec de l\'abonnement aux notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  /**
   * Se désabonner des notifications push
   */
  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      
      // Informer le backend de la suppression avant de se désabonner localement
      await apiFetch(`/notifications/unsubscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
        method: 'DELETE',
      });

      await subscription.unsubscribe();
      setSubscription(null);
      
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  return {
    subscription,
    isSupported,
    permission,
    loading,
    subscribe,
    unsubscribe,
  };
}
