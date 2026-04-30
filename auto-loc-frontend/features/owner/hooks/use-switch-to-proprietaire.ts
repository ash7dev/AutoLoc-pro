'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/nestjs/api-client';
import { useRoleStore } from '../../auth/stores/role.store';

export function useSwitchToProprietaire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const activeRole = useRoleStore((s) => s.activeRole);
  const setActiveRole = useRoleStore((s) => s.setActiveRole);

  const switchToProprietaire = async () => {
    if (activeRole === 'ADMIN' || activeRole === 'SUPPORT') return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Non connecté');
      }

      await apiFetch('/auth/switch-role', {
        method: 'PATCH',
        body: { role: 'PROPRIETAIRE' },
        accessToken: session.access_token,
      });

      try {
        document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
      } catch {
        // ignore
      }
      setActiveRole('PROPRIETAIRE');
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard/owner';
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur est survenue lors du changement de rôle.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { switchToProprietaire, loading, error };
}
