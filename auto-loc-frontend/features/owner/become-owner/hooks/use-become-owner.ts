'use client';

import { useState } from 'react';
import { useAuthFetch } from '../../../auth/hooks/use-auth-fetch';
import { useRoleStore } from '../../../auth/stores/role.store';

export function useBecomeOwner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setActiveRole = useRoleStore((s) => s.setActiveRole);
  const { authFetch } = useAuthFetch();

  const become = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authFetch<{ role: string; accessToken: string; refreshToken: string }>(
        '/auth/switch-role',
        { method: 'PATCH', body: { role: 'PROPRIETAIRE' } },
      );

      // Rafraîchir immédiatement le cookie httpOnly nest_access avec le nouveau JWT.
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeRole: result.role,
        }),
      });

      try {
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
      } catch {
        // ignore
      }

      setActiveRole('PROPRIETAIRE');
      window.location.href = '/dashboard/owner';

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { become, loading, error };
}
