'use client';

import { useState } from 'react';
import { useAuthFetch } from '../../auth/hooks/use-auth-fetch';
import { useRoleStore } from '../../auth/stores/role.store';
import { useProfileStore } from '../../auth/stores/profile.store';

export function useSwitchToLocataire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRole = useRoleStore((s) => s.activeRole);
  const setActiveRole = useRoleStore((s) => s.setActiveRole);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const { authFetch } = useAuthFetch();

  const switchToLocataire = async () => {
    if (activeRole === 'ADMIN' || activeRole === 'SUPPORT') return;
    setLoading(true);
    setError(null);
    try {
      const result = await authFetch<{ role: string; accessToken: string; refreshToken: string }, { role: string }>(
        '/auth/switch-role',
        { method: 'PATCH', body: { role: 'LOCATAIRE' } },
      );

      // Rafraîchir immédiatement le cookie httpOnly nest_access avec le nouveau JWT
      // (rôle LOCATAIRE). Sans ça, le middleware lirait l'ancien JWT (PROPRIETAIRE)
      // après expiry du cookie role_switch_at et redirigerait vers /dashboard/owner.
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeRole: result.role,
        }),
      });

      // Cookie de grâce conservé comme filet de sécurité.
      document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;

      clearProfile();
      setActiveRole('LOCATAIRE');

      window.location.href = '/';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
      setLoading(false);
    }
  };

  return { switchToLocataire, loading, error };
}
