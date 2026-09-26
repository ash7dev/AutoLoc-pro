'use client';

import React, { useState } from 'react';
import { Bell, BellOff, BellRing, Check, ShieldAlert, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { useWebPush } from '../../notifications/hooks/useWebPush';

export const TenantNotificationSettingsCard: React.FC = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = useWebPush();

  const [testSent, setTestSent] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    const ok = await sendTestNotification();
    setIsTesting(false);
    if (ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);

      // Déclencheur instantané local pour garantie d'affichage visuel
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.active) {
            reg.showNotification('AutoLoc Sénégal 🚗', {
              body: `Notification de test AutoLoc (${new Date().toLocaleTimeString('fr-FR')})`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: `autoloc-test-${Date.now()}`,
            });
          } else {
            new Notification('AutoLoc Sénégal 🚗', {
              body: `Notification de test AutoLoc (${new Date().toLocaleTimeString('fr-FR')})`,
              icon: '/icon-192.png',
              tag: `autoloc-test-${Date.now()}`,
            });
          }
        } catch (e) {
          console.warn('[WebPush] Affichage notification locale :', e);
        }
      }
    }
  };

  return (
    <div className="rounded-3xl border border-brand-dark/8 bg-white p-6 sm:p-8 shadow-xs">
      <div>
        <h3 className="font-fraunces text-xl leading-tight text-brand-dark">
          Notifications & Alertes Web Push
        </h3>
        <p className="mt-1 text-[13px] text-slate-500">
          Gestion des notifications instantanées pour vos réservations, messages et offres AutoLoc
        </p>
      </div>

      {/* État de retour / erreur */}
      {error && (
        <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[12.5px] font-medium text-rose-700">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Non supporté par le navigateur */}
      {!isSupported && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-[12.5px] leading-relaxed">
              Les notifications Web Push (VAPID) ne sont pas supportées par votre navigateur actuel. Utilisez Chrome, Edge ou Safari sur iOS 16.4+ en mode PWA.
            </p>
          </div>
        </div>
      )}

      {/* Option Principale Web Push VAPID */}
      {isSupported && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSubscribed
                    ? 'bg-brand-main text-champagne'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isSubscribed ? (
                  <BellRing className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[14px] font-semibold text-brand-dark">
                    Alertes de réservation instantanées (Push Web)
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                      isSubscribed
                        ? 'bg-brand-main/8 text-brand-main'
                        : permission === 'denied'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isSubscribed
                      ? 'Actives sur cet appareil'
                      : permission === 'denied'
                      ? 'Bloquées par le navigateur'
                      : 'Inactives'}
                  </span>
                </div>

                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500 max-w-xl">
                  Soyez averti immédiatement de la confirmation de votre réservation, de la remise des clés par l'hôte et des mises à jour de statut.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading || permission === 'denied'}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 sm:w-auto ${
                isSubscribed
                  ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  : 'bg-brand-dark text-champagne hover:bg-brand-main'
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                'Désactiver'
              ) : (
                <>
                  <Bell className="h-4 w-4 text-champagne" />
                  <span>Activer les notifications</span>
                </>
              )}
            </button>
          </div>

          {/* Warning si permissions bloquées */}
          {permission === 'denied' && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[12px] text-rose-800 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Les notifications ont été bloquées. Veuillez autoriser les notifications dans les paramètres de votre navigateur (icône cadenas dans la barre d'adresse).
              </span>
            </div>
          )}

          {/* Test d'envoi Push VAPID si actif */}
          {isSubscribed && (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 text-[12.5px] font-medium text-brand-main">
                <CheckCircle2 className="h-4 w-4 text-brand-main" />
                Abonnement Push VAPID connecté et chiffré
              </span>

              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-main" />
                ) : testSent ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Send className="h-3.5 w-3.5 text-brand-main" />
                )}
                <span>{testSent ? 'Notification envoyée !' : 'Tester l\'envoi push'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
