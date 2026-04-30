'use client';

import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';

import type { Session } from '@supabase/supabase-js';

/**
 * Ce composant silencieux est monté globalement dans le RootLayout.
 * Il écoute les changements de session Supabase et maintient à jour
 * le store (hasVehicles) de façon transparente, même si on est sur le Dashboard.
 * 
 * Il agit aussi comme "Healer" : si les cookies backend (nest_access) sont expirés,
 * il les régénère automatiquement en synchronisant le token Supabase.
 */
export function GlobalRoleSync() {
  useEffect(() => {
    let active = true;

    const checkVehicles = async (session: Session | null, isRetry = false) => {
      if (!session?.access_token) return;
      
      try {
        const res = await fetch('/api/nest/vehicles/me', { credentials: 'include' });
        
        // 🔄 HEALING DE SESSION :
        // Si le backend retourne 401, nos cookies (nest_access/refresh) sont morts.
        // Mais comme on a un token Supabase valide, on relance la synchronisation.
        if (res.status === 401 && !isRetry) {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseToken: session.access_token }),
          });
          if (syncRes.ok) {
            // Synchronisation réussie, on retente la requête initiale
            return checkVehicles(session, true);
          }
          return;
        }

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
      checkVehicles(data.session);
    });

    // 2. Écoute des changements de session (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      checkVehicles(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null; // Composant invisible
}
