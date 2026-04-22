'use client';

import React, { useState, useEffect } from 'react';
import { CookieBanner } from '@/features/cookies/CookieBanner';
import { PwaInstallPrompt } from './PwaInstallPrompt';
import { PushNotificationModal } from './PushNotificationModal';
import { getConsent } from '@/features/cookies/cookie-consent';

export function GlobalModals() {
  const [hasResolvedCookies, setHasResolvedCookies] = useState(false);

  useEffect(() => {
    // On vérifie initialement
    if (getConsent() !== null) {
      setHasResolvedCookies(true);
      return;
    }

    // Sinon, on met en place un petit intervalle pour détecter quand l'utilisateur répond
    // (Puisque le composant CookieBanner ne gère pas d'état global partagé via context)
    const interval = setInterval(() => {
      if (getConsent() !== null) {
        setHasResolvedCookies(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Le bandeau des cookies gère son propre affichage */}
      <CookieBanner />

      {/* On ne monte les composants PWA et Notifications QUE si les cookies sont gérés */}
      {hasResolvedCookies && (
        <>
          <PwaInstallPrompt />
          <PushNotificationModal />
        </>
      )}
    </>
  );
}
