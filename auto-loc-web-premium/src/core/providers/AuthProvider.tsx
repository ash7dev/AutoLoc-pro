'use client';

import React, { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const refreshProfileSilently = useUserStore((s) => s.refreshProfileSilently);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Hydratation Instantanée à 0ms depuis le cache local (Pattern Airbnb / Uber)
    const token = localStorage.getItem('autoloc_token');
    const cachedUserRaw = localStorage.getItem('autoloc_user');

    if (token && cachedUserRaw) {
      try {
        const cachedUser = JSON.parse(cachedUserRaw);
        useUserStore.getState().initializeFromSession(cachedUser);
      } catch {
        // Ignorer si JSON invalide
      }
    }

    // 2. Révalidation silencieuse en arrière-plan auprès du serveur NestJS (/auth/me)
    refreshProfileSilently();
  }, [refreshProfileSilently]);

  return <>{children}</>;
};
