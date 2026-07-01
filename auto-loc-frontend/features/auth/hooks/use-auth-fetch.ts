'use client';

import { useCallback } from 'react';
import { apiFetch, ApiError } from '../../../lib/nestjs/api-client';

interface AuthFetchOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: TBody;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Hook retournant un `authFetch` pré-authentifié.
 *
 * Toutes les requêtes browser passent par le proxy Next.js /api/nest/* qui :
 *  - Lit le cookie `nest_access` (httpOnly) et l'injecte dans Authorization.
 *  - Tente un refresh silencieux sur 401 via le cookie `nest_refresh`.
 *
 * Plus besoin de gérer le token manuellement côté client.
 *
 * Usage dans un feature hook :
 *   const { authFetch } = useAuthFetch();
 *   const data = await authFetch<VehicleList>('/vehicles');
 */
export function useAuthFetch() {
  const authFetch = useCallback(
    async <TResponse, TBody = undefined>(
      path: string,
      options: AuthFetchOptions<TBody> = {},
    ): Promise<TResponse> => {
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
      const isSafeToRetry = !options.method || options.method === 'GET';

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          return await apiFetch<TResponse, TBody>(path, options);
        } catch (err) {
          // On ne re-tente QUE si c'est un GET et une erreur de session (401)
          if (isSafeToRetry && err instanceof ApiError && err.status === 401) {
            if (attempt < 2) {
              // ✅ NEW: Try to refresh tokens before retrying
              try {
                console.log('[useAuthFetch] Token expired, attempting refresh...');
                const refreshRes = await fetch('/api/auth/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });

                if (refreshRes.ok) {
                  console.log('[useAuthFetch] Tokens refreshed successfully');
                  await wait(200);
                  continue; // Retry the original request with new token
                } else {
                  const refreshData = await refreshRes.json();
                  console.warn('[useAuthFetch] Refresh failed:', refreshData);

                  // If refresh token expired, redirect to login immediately
                  if (refreshData.expired) {
                    window.location.href = '/login?expired=1';
                    throw err;
                  }
                }
              } catch (refreshError) {
                console.error('[useAuthFetch] Refresh error:', refreshError);
              }

              // If refresh failed, wait and retry once more
              await wait(200);
              continue;
            }

            // All retries exhausted → dispatch event for toast
            const event = new CustomEvent('session:expired', { detail: { expired: true } });
            window.dispatchEvent(event);

            // Wait a bit for user to potentially click "Continue session"
            await new Promise(resolve => setTimeout(resolve, 500));

            // If still not resolved, redirect
            window.location.href = '/login?expired=1';
          }

          // Pour un POST, PATCH, etc., on lance l'erreur direct après la première tentative
          throw err;
        }
      }
      throw new Error('Auth fetch failed');
    },
    [],
  );

  return { authFetch };
}
