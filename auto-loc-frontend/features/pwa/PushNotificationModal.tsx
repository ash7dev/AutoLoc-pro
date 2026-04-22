'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PushNotificationModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1. Vérifier si le navigateur supporte les notifications
    if (!('Notification' in window)) return;

    // 2. Si déjà accordé ou refusé nativement, on ne montre rien
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return;
    }

    // 3. Vérifier si l'utilisateur a déjà ignoré NOTRE modale
    const dismissedAt = localStorage.getItem('autoloc_push_dismissed');
    if (dismissedAt) return; // S'il a dit non, on le laisse tranquille

    // 4. Déclencher l'affichage de notre modale "Soft Prompt" après 8s
    // (Laisse le temps aux autres éléments comme les cookies de s'afficher)
    const timer = setTimeout(() => {
      setShow(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    // Sauvegarde qu'il a refusé pour ne plus l'embêter
    localStorage.setItem('autoloc_push_dismissed', Date.now().toString());
  };

  const handleAccept = async () => {
    try {
      // 1. Demande la permission native
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        
        // 2. Enregistrement auprès du Service Worker
        const registration = await navigator.serviceWorker.ready;
        
        // Convertir la clé VAPID en Uint8Array
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            console.error('VAPID public key manquante');
            return;
        }
        
        const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
        const base64 = (vapidPublicKey + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const applicationServerKey = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            applicationServerKey[i] = rawData.charCodeAt(i);
        }

        // 3. S'abonner aux notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        const subJson = subscription.toJSON();

        // 4. Envoyer au backend via le proxy Next.js
        await fetch('/api/nest/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
            userAgent: navigator.userAgent,
            deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP',
          }),
        });
      }
    } catch (e) {
      console.error('Erreur lors de la demande de notification', e);
    } finally {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0F172A] border border-white/10 rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Glow de fond */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] pointer-events-none" />

        {/* Croix pour fermer */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors p-1"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2 relative z-10">
          
          {/* Icône Cloche */}
          <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-5 relative">
            <Bell className="w-8 h-8 text-emerald-400" />
            {/* Petit point rouge "nouveau message" */}
            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 border-2 border-[#0F172A] rounded-full animate-pulse" />
          </div>

          <h3 className="text-xl font-black text-white mb-2 tracking-tight">Restez informé</h3>
          <p className="text-[13px] font-medium text-white/50 leading-relaxed mb-8 px-2">
            Activez les notifications pour être alerté instantanément de vos nouvelles réservations et messages.
          </p>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2.5">
            <button
              onClick={handleAccept}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[14px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              Oui, m'avertir
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold text-[13px] transition-all"
            >
              Plus tard
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
