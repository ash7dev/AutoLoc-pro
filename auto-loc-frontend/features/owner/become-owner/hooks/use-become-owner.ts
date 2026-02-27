'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '../../../auth/hooks/use-auth-fetch';
import { useRoleStore } from '../../../auth/stores/role.store';

export function useBecomeOwner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setActiveRole = useRoleStore((s) => s.setActiveRole);
  const { authFetch } = useAuthFetch();

  const become = async () => {
    setLoading(true);
    setError(null);
    try {
      await authFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'PROPRIETAIRE' },
      });
      setActiveRole('PROPRIETAIRE');
      router.push('/dashboard/owner');
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
