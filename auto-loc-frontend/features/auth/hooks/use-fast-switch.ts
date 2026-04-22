'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from './use-auth-fetch';
import { useRoleStore } from '../stores/role.store';

export function useFastSwitch() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setActiveRole = useRoleStore((s) => s.setActiveRole);
  const { authFetch } = useAuthFetch();

  const switchToOwner = async () => {
    setLoading(true);
    try {
      // 1. Switch de rôle sur le backend
      await authFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'PROPRIETAIRE' },
      });

      // 2. Invalidation du cache pour le SSR
      document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;

      // 3. Mise à jour du store local
      setActiveRole('PROPRIETAIRE');

      // 4. Navigation
      router.push('/dashboard/owner');
    } catch (err) {
      console.error('[FastSwitch] Failed to switch role:', err);
      // En cas d'erreur, on tente quand même la navigation
      router.push('/dashboard/owner');
    } finally {
      setLoading(false);
    }
  };

  return { switchToOwner, loading };
}
