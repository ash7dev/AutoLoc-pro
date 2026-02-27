'use client';

import { useCallback } from 'react';
import { apiFetch, ApiError } from '../../../lib/nestjs/api-client';

interface AuthFetchOptions<TBody> {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: TBody;
  headers?: Record<string, string>;
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
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          return await apiFetch<TResponse, TBody>(path, options);
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            if (attempt < 2) {
              await wait(200);
              continue;
            }
            window.location.href = '/login?expired=1';
          }
          throw err;
        }
      }
      // unreachable, but satisfies TS
      throw new Error('Auth fetch failed');
    },
    [],
  );

  return { authFetch };
}
