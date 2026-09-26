'use client';

import React, { useState } from 'react';
import { Bell, BellOff, BellRing, CheckCircle2, ShieldAlert, Loader2, Send } from 'lucide-react';
import { useWebPush } from '../hooks/useWebPush';

export function WebPushNotificationToggle() {
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
    }
  };

  if (!isSupported) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 text-amber-900 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-xs">
          Les notifications Web Push ne sont pas supportées par ce navigateur.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* En-tête & Statut */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
              isSubscribed
                ? 'bg-brand-main text-champagne'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isSubscribed ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-brand-dark">Notifications Web Push VAPID</h4>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                  isSubscribed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : permission === 'denied'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {isSubscribed
                  ? 'Actives'
                  : permission === 'denied'
                  ? 'Bloquées'
                  : 'Inactives'}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
              Recevez des alertes instantanées sur votre téléphone ou ordinateur dès qu'une réservation est mise à jour ou qu'un message important vous est adressé.
            </p>
          </div>
        </div>

        {/* Bouton de bascule */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 ${
            isSubscribed
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              : 'bg-brand-main text-champagne hover:bg-forest-700'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            'Désactiver'
          ) : (
            <>
              <Bell className="h-3.5 w-3.5" />
              <span>Activer les notifications</span>
            </>
          )}
        </button>
      </div>

      {/* Message d'erreur si permission refusée */}
      {permission === 'denied' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            Les notifications ont été bloquées dans votre navigateur. Pour les réactiver, cliquez sur le cadenas à gauche de la barre d'adresse.
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 font-medium px-1">{error}</p>
      )}

      {/* Zone de test si l'utilisateur est abonné */}
      {isSubscribed && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            VAPID Push Subscription actif sur cet appareil
          </span>

          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            {isTesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{testSent ? 'Notification envoyée !' : 'Tester l\'envoi'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
