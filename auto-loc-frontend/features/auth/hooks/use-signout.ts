'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const clearRole = useRoleStore((s) => s.clearRole);
  const activeRole = useRoleStore((s) => s.activeRole);

  const signOut = async () => {
    setLoading(true);
    // Efface les cookies NestJS httpOnly avant de déconnecter Supabase.
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});
    await supabase.auth.signOut();
    
    // Rediriger selon le rôle avant de le clear
    if (activeRole === 'PROPRIETAIRE') {
      router.push('/login');
    } else if (activeRole === 'LOCATAIRE') {
      router.push('/');
    } else {
      router.push('/login');
    }
    
    clearRole();
    setLoading(false);
  };

  return { signOut, loading };
}
