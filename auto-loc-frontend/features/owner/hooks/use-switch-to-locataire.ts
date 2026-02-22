'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { switchRole } from '../../../lib/nestjs/auth';
import { ensureValidNestToken } from '../../auth/hooks/use-nest-token';
import { useRoleStore } from '../../auth/stores/role.store';

export function useSwitchToLocataire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const switchToLocataire = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await ensureValidNestToken();
      if (!token) throw new Error('Session expirée — reconnectez-vous.');
      await switchRole(token, 'LOCATAIRE');
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
