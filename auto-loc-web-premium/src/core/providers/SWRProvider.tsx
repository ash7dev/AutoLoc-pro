'use client';

import React from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export const SWRProvider: React.FC<SWRProviderProps> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        // Ne pas re-fetcher systématiquement lors du focus de la fenêtre/onglet (évite le request spam)
        revalidateOnFocus: false,
        // Throttle pour prévenir le spam si revalidateOnFocus est activé ponctuellement (1 minute)
        focusThrottleInterval: 60_000,
        // Conserver les données précédentes en mémoire lors des revalidations pour 0ms de clignotement visuel
        keepPreviousData: true,
        // Ne pas forcer la revalidation si les données en cache sont valides
        revalidateIfStale: false,
        // Revalider automatiquement en cas de perte/reconnexion réseau
        revalidateOnReconnect: true,
        // Fenêtre de déduplication & cache frais par défaut (5 minutes = 300 000 ms)
        dedupingInterval: 300_000,
        // Nombre d'essais max en cas d'erreur
        errorRetryCount: 2,
        // Délai minimal entre deux tentatives d'erreur
        errorRetryInterval: 5_000,
      }}
    >
      {children}
    </SWRConfig>
  );
};
