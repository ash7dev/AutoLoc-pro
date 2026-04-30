'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';
import { useProfileStore } from '../stores/profile.store';

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const clearRole = useRoleStore((s) => s.clearRole);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const signOut = async () => {
    setLoading(true);

    // 1. Vider les stores IMMÉDIATEMENT avant tout le reste.
    //    Évite le flash de rôle si Next.js re-rend un composant pendant le signout.
    clearRole();
    clearProfile();

    // 2. Appeler l'API Next.js qui : révoque la session Redis NestJS (via nest_access cookie
    //    httpOnly) ET expire les cookies nest_access / nest_refresh.
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => {});

    // 3. Déconnecter Supabase (invalide le token Supabase côté client).
    await supabase.auth.signOut();

    // 4. Rediriger vers l'accueil (/) au lieu du login.
    //    On utilise window.location.href pour forcer un rechargement propre.
    window.location.href = '/';

    setLoading(false);
  };

  return { signOut, loading };
}

