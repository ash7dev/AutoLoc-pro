'use client';

import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';
import { useProfileStore } from '../stores/profile.store';
import type { ProfileResponse } from '../../../lib/nestjs/auth';

import type { Session } from '@supabase/supabase-js';

/**
 * Ce composant silencieux est monté globalement dans le RootLayout.
 * Il écoute les changements de session Supabase et maintient à jour
 * le store (hasVehicles + profile) de façon transparente.
 *
 * Il agit aussi comme "Healer" : si les cookies backend (nest_access) sont expirés,
 * il les régénère automatiquement en synchronisant le token Supabase.
 */
export function GlobalRoleSync() {
  useEffect(() => {
    let active = true;

    const syncAll = async (session: Session | null, isRetry = false) => {
      if (!session?.access_token) {
        useProfileStore.getState().clearProfile();
        return;
      }

      try {
        const profileRes = await fetch('/api/nest/auth/me', { credentials: 'include' });

        // 🔄 HEALING DE SESSION :
        // Si le backend retourne 401, nos cookies (nest_access/refresh) sont morts.
        // Mais comme on a un token Supabase valide, on relance la synchronisation.
        if (profileRes.status === 401 && !isRetry) {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseToken: session.access_token }),
          });
          if (syncRes.ok) {
            return syncAll(session, true);
          }
          return;
        }

        if (!active) return;

        if (profileRes.ok) {
          const profile = await profileRes.json() as ProfileResponse;
          useProfileStore.getState().setProfile(profile);

          // Fetch vehicles uniquement pour les propriétaires — les autres rôles
          // (ADMIN, LOCATAIRE, SUPPORT) n'ont pas de véhicules et retourneraient 403.
          if (profile.role === 'PROPRIETAIRE') {
            const vehiclesRes = await fetch('/api/nest/vehicles/me', { credentials: 'include' });
            if (vehiclesRes.ok) {
              const data = await vehiclesRes.json() as unknown[];
              useRoleStore.getState().setHasVehicles(Array.isArray(data) && data.length > 0);
            }
          } else {
            // Un utilisateur peut avoir des véhicules même avec le rôle LOCATAIRE actif
            // (il a déjà été propriétaire). On lit profile.hasVehicles au lieu de forcer false.
            useRoleStore.getState().setHasVehicles(profile.hasVehicles ?? false);
          }
        }
      } catch {
        // Ignorer en cas d'erreur réseau
      }
    };

    // 1. Vérification initiale
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      syncAll(data.session);
    });

    // 2. Écoute des changements de session (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      syncAll(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null; // Composant invisible
}
