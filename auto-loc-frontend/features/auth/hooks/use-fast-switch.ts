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
      const result = await authFetch<
        { role: string; accessToken: string; refreshToken: string },
        { role: string }
      >('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'PROPRIETAIRE' },
      });

      // 2. Sync avec les nouveaux tokens
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeRole: result.role,
        }),
      });

      // 3. Délai pour que le backend finisse de mettre à jour
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. Invalidation du cache pour le SSR
      document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300; SameSite=Lax`;

      // 5. Mise à jour du store local
      setActiveRole('PROPRIETAIRE');

      // 6. Navigation avec hard reload
      window.location.href = '/dashboard/owner?_=' + Date.now();
    } catch (err) {
      console.error('[FastSwitch] Failed to switch role:', err);
      // ✅ SÉCURITÉ: Ne pas rediriger en cas d'erreur, retourner à la page d'accueil
      // pour éviter que l'utilisateur accède au mauvais dashboard avec le mauvais rôle
      setLoading(false);
      router.push('/?error=switch_failed');
    }
  };

  return { switchToOwner, loading };
}
