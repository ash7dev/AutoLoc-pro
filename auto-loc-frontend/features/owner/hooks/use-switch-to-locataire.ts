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
      await authFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'LOCATAIRE' },
      });

      // Cookie pour que le middleware ignore le JWT stale (encore PROPRIETAIRE)
      document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;

      // Vider le profileStore (stale PROPRIETAIRE) AVANT la navigation.
      // Sans ça, HomeSessionRedirect Tier 2 lit l'ancien profil et redirige
      // vers /dashboard/owner dès que la home page monte.
      clearProfile();
      setActiveRole('LOCATAIRE');

      // Reload complet (comme signOut) : élimine tout state client stale.
      // router.push('/') laisse GlobalRoleSync avec l'ancien profil en mémoire,
      // ce qui peut provoquer un rebond visible avant la re-synchro.
      window.location.href = '/';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(message);
      setLoading(false);
    }
    // Pas de finally setLoading(false) : le reload détruit le composant de toute façon
  };

  return { switchToLocataire, loading, error };
}
