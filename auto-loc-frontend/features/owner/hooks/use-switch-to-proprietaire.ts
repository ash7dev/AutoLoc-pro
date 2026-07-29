'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/nestjs/api-client';
import { useRoleStore } from '../../auth/stores/role.store';

export function useSwitchToProprietaire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRole = useRoleStore((s) => s.activeRole);
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const switchToProprietaire = async () => {
    if (activeRole === 'ADMIN' || activeRole === 'SUPPORT') {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<{ role: string; accessToken: string; refreshToken: string }, { role: string }>(
        '/auth/switch-role',
        { method: 'PATCH', body: { role: 'PROPRIETAIRE' } },
      );

      // Rafraîchir immédiatement le cookie httpOnly nest_access avec le nouveau JWT
      // (rôle PROPRIETAIRE). Évite que le middleware voie un rôle stale au prochain load.
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeRole: result.role,
        }),
      });

      // Ajouter un délai de 300ms pour que le backend finisse de mettre à jour
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        // Timestamp unique pour forcer l'invalidation du cache Next.js
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300; SameSite=Lax`;
      } catch {
        // ignore
      }
      setActiveRole('PROPRIETAIRE');

      // Hard reload pour forcer Next.js à re-fetch le profil sans cache
      window.location.href = '/dashboard/owner?_=' + Date.now();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue lors du changement de rôle.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { switchToProprietaire, loading, error };
}
