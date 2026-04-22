'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { completeProfile, fetchMe, type CompleteProfileInput, type ProfileResponse } from '@/lib/nestjs/auth';
import { syncWithNestJS } from './use-nest-token';
import { useRoleStore } from '../stores/role.store';

function extractCompleteProfileInput(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']): CompleteProfileInput | null {
  const user = session?.user;
  if (!user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const prenom = typeof metadata.prenom === 'string' ? metadata.prenom.trim() : '';
  const nom = typeof metadata.nom === 'string' ? metadata.nom.trim() : '';
  const metadataPhone = typeof metadata.telephone === 'string' ? metadata.telephone : '';
  const phone = (user.phone ?? metadataPhone).replace('whatsapp:', '').trim();

  if (!prenom || !nom || !phone) {
    return null;
  }

  return { prenom, nom, telephone: phone };
}

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inFlight = useRef(false);

  // Reset le guard anti-double-appel si le composant est démonté
  useEffect(() => {
    return () => { inFlight.current = false; };
  }, []);

  const redirectAfterAuth = async (explicitSession?: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null) => {
    if (inFlight.current) return;
    inFlight.current = true;

    let currentSession = explicitSession ?? null;

    if (!currentSession) {
      const { data } = await supabase.auth.getSession();
      currentSession = data.session;
    }

    const token = currentSession?.access_token;

    if (!token) {
      inFlight.current = false;
      return;
    }

    const provider =
      currentSession?.user?.app_metadata?.provider ??
      (currentSession?.user?.app_metadata as { providers?: string[] })?.providers?.[0];


    let profile: ProfileResponse;

    try {
      const sessionNest = await syncWithNestJS(token);
      useRoleStore.getState().setSession(sessionNest);
      
      if (sessionNest.profile) {
        profile = sessionNest.profile;
      } else {
        profile = await fetchMe();
      }
    } catch (err) {
      inFlight.current = false;
      return false;
    }

    if (!profile.hasUtilisateur) {
      const seededProfile = extractCompleteProfileInput(currentSession);

      if (seededProfile) {
        try {
          await completeProfile(token, seededProfile);
          profile = await fetchMe();
        } catch (err) {
          // ignore error, will redirect anyway
        }
      }
    }

    // Stocker hasVehicles dans le store pour le menu utilisateur
    if (profile.hasVehicles !== undefined) {
      useRoleStore.getState().setHasVehicles(profile.hasVehicles);
    }

    if (profile.role === 'ADMIN' || profile.role === 'SUPPORT') {
      router.replace('/dashboard/admin');
      inFlight.current = false;
      return true;
    }

    const next = searchParams.get('next');
    const requiredRole = searchParams.get('role') as 'PROPRIETAIRE' | 'LOCATAIRE' | null;

    if (next && next.startsWith('/')) {
      if (
        requiredRole &&
        requiredRole !== profile.role &&
        (requiredRole === 'PROPRIETAIRE' || requiredRole === 'LOCATAIRE')
      ) {
        try {
          await fetch('/api/nest/auth/switch-role', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: requiredRole }),
          });
          document.cookie = `role_switch_at=${Date.now()}; path=/; max-age=300`;
        } catch {
          // ignore switch error
        }
      }
      router.replace(next);
      inFlight.current = false;
      return true;
    }

    if (profile.role === 'PROPRIETAIRE') {
      router.replace('/dashboard/owner');
      inFlight.current = false;
      return true;
    }

    router.replace('/');
    inFlight.current = false;
    return true;
  };

  return { redirectAfterAuth };
}
