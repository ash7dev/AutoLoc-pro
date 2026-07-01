'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase/client';
import { useRoleStore } from '../stores/role.store';
import { useProfileStore } from '../stores/profile.store';

// ✅ NEW: BroadcastChannel for cross-tab logout synchronization
let logoutChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  logoutChannel = new BroadcastChannel('autoloc_logout');
}

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const clearRole = useRoleStore((s) => s.clearRole);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  // ✅ NEW: Listen for logout events from other tabs
  useEffect(() => {
    if (!logoutChannel) return;

    const handleLogoutMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOGOUT') {
        console.log('[useSignOut] Logout received from another tab');
        // Clear stores immediately
        clearRole();
        clearProfile();
        // Redirect to home
        window.location.href = '/';
      }
    };

    logoutChannel.addEventListener('message', handleLogoutMessage);

    return () => {
      logoutChannel?.removeEventListener('message', handleLogoutMessage);
    };
  }, [clearRole, clearProfile]);

  const signOut = async () => {
    setLoading(true);

    // 1. Vider les stores IMMÉDIATEMENT avant tout le reste.
    //    Évite le flash de rôle si Next.js re-rend un composant pendant le signout.
    clearRole();
    clearProfile();

    // ✅ NEW: Broadcast logout event to other tabs
    if (logoutChannel) {
      try {
        logoutChannel.postMessage({ type: 'LOGOUT', timestamp: Date.now() });
        console.log('[useSignOut] Logout broadcasted to other tabs');
      } catch (error) {
        console.warn('[useSignOut] Failed to broadcast logout:', error);
      }
    }

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

