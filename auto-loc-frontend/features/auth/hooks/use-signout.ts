'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const clearRole = useRoleStore((s) => s.clearRole);

  const signOut = async () => {
    setLoading(true);
    // Efface les cookies NestJS httpOnly avant de déconnecter Supabase.
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut();
    
    // Invalide le cache Next.js puis redirige sans laisser de trace dans l'historique
    router.refresh();
    router.replace('/');
    
    clearRole();
    setLoading(false);
  };

  return { signOut, loading };
}
