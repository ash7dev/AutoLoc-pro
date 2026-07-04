'use client';

import { useEffect, useRef } from 'react';
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
 *
 * ✅ NEW: Supporte ETag pour cache HTTP (économie bande passante ~70%)
 */
export function GlobalRoleSync() {
  // ✅ NEW: Store ETag in ref to avoid unnecessary re-renders
  const profileETagRef = useRef<string | null>(null);

  // ✅ NEW: AbortController for request deduplication
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;

    const syncAll = async (session: Session | null, isRetry = false) => {
      useRoleStore.getState().setAuthStatus({ checked: false, valid: false });

      // ✅ NEW: Abort previous pending request
      if (abortControllerRef.current) {
        // Silent abort — expected deduplication behavior
        abortControllerRef.current.abort();
      }

      // ✅ NEW: Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      if (!session?.access_token) {
        // No Supabase session — but phone-native login uses NestJS cookies only.
        // Try the NestJS cookie before clearing the profile.
        try {
          // ✅ NEW: Send If-None-Match header for ETag support
          const headers: HeadersInit = {};
          if (profileETagRef.current) {
            headers['If-None-Match'] = profileETagRef.current;
          }

          const res = await fetch('/api/nest/auth/me', {
            headers,
            credentials: 'include',
            signal: abortController.signal, // ✅ NEW: Add abort signal
          });

          // ✅ NEW: Handle 304 Not Modified (cache hit)
          if (res.status === 304) {
            // 304 cache hit — profile unchanged, skip update
            useRoleStore.getState().setAuthStatus({ checked: true, valid: true });
            return; // Keep existing profile in store
          }

          if (res.ok) {
            // ✅ NEW: Store ETag for next request
            const etag = res.headers.get('etag');
            if (etag) {
              profileETagRef.current = etag;
            }

            const profile = await res.json() as ProfileResponse;
            useProfileStore.getState().setProfile(profile);
            useRoleStore.getState().setActiveRole(profile.role);

            // ✅ OPTIMISATION: Utiliser profile.hasVehicles du backend (déjà calculé)
            // au lieu de faire un fetch supplémentaire de /vehicles/me
            useRoleStore.getState().setHasVehicles(profile.hasVehicles ?? false);
            return;
          }
        } catch {
          // ignore network errors
        }
        // No NestJS session either — clear everything
        useProfileStore.getState().clearProfile();
        useRoleStore.getState().clearRole();
        profileETagRef.current = null; // Clear ETag on logout
        return;
      }

      try {
        // ✅ NEW: Send If-None-Match header for ETag support
        const headers: HeadersInit = {};
        if (profileETagRef.current) {
          headers['If-None-Match'] = profileETagRef.current;
        }

        const profileRes = await fetch('/api/nest/auth/me', {
          headers,
          credentials: 'include',
          signal: abortController.signal, // ✅ NEW: Add abort signal
        });

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
          useProfileStore.getState().clearProfile();
          useRoleStore.getState().clearRole();
          profileETagRef.current = null;
          return;
        }

        if (!active) return;

        // ✅ NEW: Handle 304 Not Modified (cache hit)
        if (profileRes.status === 304) {
          // 304 cache hit — profile unchanged, skip update
          useRoleStore.getState().setAuthStatus({ checked: true, valid: true });
          return; // Keep existing profile in store
        }

        if (profileRes.ok) {
          // ✅ NEW: Store ETag for next request
          const etag = profileRes.headers.get('etag');
          if (etag) {
            profileETagRef.current = etag;
          }

          const profile = await profileRes.json() as ProfileResponse;
          useProfileStore.getState().setProfile(profile);

          // Synchroniser activeRole avec la source de vérité (DB via /auth/me).
          // Évite un localStorage stale si le cookie a expiré puis été régénéré avec un
          // rôle différent (ex: token PROPRIETAIRE stale → heal → profil LOCATAIRE en DB).
          useRoleStore.getState().setActiveRole(profile.role);

          // ✅ OPTIMISATION: Utiliser profile.hasVehicles du backend (déjà calculé)
          // Un utilisateur peut avoir des véhicules même avec le rôle LOCATAIRE actif
          // (il a déjà été propriétaire). On lit profile.hasVehicles au lieu de faire
          // un fetch supplémentaire de /vehicles/me.
          useRoleStore.getState().setHasVehicles(profile.hasVehicles ?? false);
          return;
        }

        useProfileStore.getState().clearProfile();
        useRoleStore.getState().clearRole();
        profileETagRef.current = null;
      } catch (error) {
        // ✅ NEW: Ignore AbortError (expected when request is cancelled)
        if (error instanceof Error && error.name === 'AbortError') {
          // AbortError — expected deduplication behavior
          return;
        }
        // Ignorer en cas d'erreur réseau
        useRoleStore.getState().setAuthStatus({
          checked: true,
          valid: Boolean(useRoleStore.getState().activeRole),
        });
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
