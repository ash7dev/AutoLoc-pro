'use client';

import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';

/**
 * Ce composant silencieux est monté globalement dans le RootLayout.
 * Il écoute les changements de session Supabase et maintient à jour
 * le store (hasVehicles) de façon transparente, même si on est sur le Dashboard.
 */
export function GlobalRoleSync() {
  useEffect(() => {
    let active = true;

    const checkVehicles = async (isLoggedIn: boolean) => {
      if (!isLoggedIn) return;
      
      try {
        const res = await fetch('/api/nest/vehicles/me', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json() as unknown[];
        if (!active) return;
        
        const hasVehicles = Array.isArray(data) && data.length > 0;
        useRoleStore.getState().setHasVehicles(hasVehicles);
      } catch {
        // Ignorer en cas d'erreur réseau
      }
    };

    // 1. Vérification initiale
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const isLoggedIn = Boolean(data.session?.access_token);
      checkVehicles(isLoggedIn);
    });

    // 2. Écoute des changements de session (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      const isLoggedIn = Boolean(session?.access_token);
      checkVehicles(isLoggedIn);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null; // Composant invisible
}
