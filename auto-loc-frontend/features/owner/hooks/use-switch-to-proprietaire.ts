'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/nestjs/api-client';
import { useRoleStore } from '../../auth/stores/role.store';

export function useSwitchToProprietaire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeRole = useRoleStore((s) => s.activeRole);
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const switchToProprietaire = async () => {
    console.log('switchToProprietaire called, activeRole:', activeRole);
    if (activeRole === 'ADMIN' || activeRole === 'SUPPORT') {
      console.log('Switch blocked: activeRole is ADMIN or SUPPORT');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log('Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Non connecté');
      }
      console.log('Session found, calling API...');

      const result = await apiFetch<{ role: string; accessToken: string; refreshToken: string }, { role: string }>(
        '/auth/switch-role',
        { method: 'PATCH', body: { role: 'PROPRIETAIRE' }, accessToken: session.access_token },
      );
      console.log('API result:', result);

      // Rafraîchir immédiatement le cookie httpOnly nest_access avec le nouveau JWT
      // (rôle PROPRIETAIRE). Évite que le middleware voie un rôle stale au prochain load.
      console.log('Syncing auth...');
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          activeRole: result.role,
        }),
      });

      try {
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
      } catch {
        // ignore
      }
      console.log('Setting active role to PROPRIETAIRE');
      setActiveRole('PROPRIETAIRE');
      console.log('Redirecting to /dashboard/owner');
      window.location.href = '/dashboard/owner';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue lors du changement de rôle.';
      console.error('Switch error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { switchToProprietaire, loading, error };
}
