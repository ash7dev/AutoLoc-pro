'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '../../auth/hooks/use-auth-fetch';
import { useRoleStore } from '../../auth/stores/role.store';

export function useSwitchToLocataire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const { authFetch } = useAuthFetch();
  const switchToLocataire = async () => {
    setLoading(true);
    setError(null);
    try {
      await authFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'LOCATAIRE' },
      });
      try {
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
      } catch {
        // ignore
      }
      setActiveRole('LOCATAIRE');
      router.push('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { switchToLocataire, loading, error };
}
