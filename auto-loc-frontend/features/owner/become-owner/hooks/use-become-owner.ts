'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { switchRole } from '../../../../lib/nestjs/auth';
import { ensureValidNestToken } from '../../../auth/hooks/use-nest-token';
import { useRoleStore } from '../../../auth/stores/role.store';

export function useBecomeOwner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const become = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await ensureValidNestToken();
      if (!token) throw new Error('Session expirée — reconnectez-vous.');
      await switchRole(token, 'PROPRIETAIRE');
      setActiveRole('PROPRIETAIRE');
      router.push('/dashboard/owner/vehicles');
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
