'use client';

import React, { useEffect } from 'react';
import { PwaInstallPrompt } from './PwaInstallPrompt';

export function PwaManager() {
  useEffect(() => {
    // 1. Enregistrement du Service Worker en environnement navigateur
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker enregistré avec succès :', registration.scope);

            // Vérification périodique des mises à jour du Service Worker
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[PWA] Nouvelle version de l\'application AutoLoc disponible.');
                    } else {
                      console.log('[PWA] Contenu prêt pour une utilisation hors-ligne.');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('[PWA] Échec de l\'enregistrement du Service Worker :', error);
          });
      });
    }
  }, []);

  return <PwaInstallPrompt />;
}
