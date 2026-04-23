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
      // Faire le switch de rôle
      await authFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'PROPRIETAIRE' },
      });
      
      // Marquer le changement de rôle pour invalider les caches
      try {
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
      } catch {
        // ignore
      }
      
      // Mettre à jour le store immédiatement
      setActiveRole('PROPRIETAIRE');
      
      // Petit délai pour assurer la consistance de la DB avant le rechargement serveur
      await new Promise(resolve => setTimeout(resolve, 500));

      // Utiliser window.location pour forcer un rechargement complet de la session serveur
      // Cela évite les boucles infinies de redirection du routeur Next.js
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
