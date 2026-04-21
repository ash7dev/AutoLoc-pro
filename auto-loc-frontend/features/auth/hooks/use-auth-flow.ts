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
  // (ex: déconnexion → navigation vers une autre page → reconnexion).
  useEffect(() => {
    return () => { inFlight.current = false; };
  }, []);

  const redirectAfterAuth = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    // eslint-disable-next-line no-console
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;
    
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] token present', Boolean(token));
    
    if (!token) {
      // Si vraiment pas de token (ex: logout entre temps), on s'arrête
      inFlight.current = false;
      return;
    }

    const provider =
      session?.user?.app_metadata?.provider ??
      (session?.user?.app_metadata as { providers?: string[] })?.providers?.[0];
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] provider', provider);

    let syncOk = false;
    try {
      // On tente une synchro directe. Si ça échoue une fois, on peut logger, 
      // mais on évite les boucles de 3 x 200ms qui créent du lag.
      const sessionNest = await syncWithNestJS(token);
      useRoleStore.getState().setSession(sessionNest);
      syncOk = true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[AuthFlow] Sync failed', err);
    }

    if (!syncOk) {
      inFlight.current = false;
      return;
    }

    let profile = await fetchMe();
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] profile', profile);

    if (!profile.hasUtilisateur) {
      const seededProfile = extractCompleteProfileInput(session);

      if (seededProfile) {
        try {
          await completeProfile(token, seededProfile);
          profile = await fetchMe();
          // eslint-disable-next-line no-console
          console.log('[AuthFlow] profile auto-completed from auth metadata');
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[AuthFlow] Auto-complete profile failed', err);
        }
      }
    }

    // Stocker hasVehicles dans le store pour le menu utilisateur
    if (profile.hasVehicles !== undefined) {
      useRoleStore.getState().setHasVehicles(profile.hasVehicles);
    }

    if (profile.role === 'ADMIN') {
      router.replace('/dashboard/admin');
      inFlight.current = false;
      return;
    }

    // Si un `next` est fourni (ex: depuis un lien email), on le respecte.
    // Si un `role` est aussi demandé et diffère du rôle actuel, on switche d'abord.
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
          // switch échoué — on continue quand même vers next
        }
      }
      router.replace(next);
      inFlight.current = false;
      return;
    }

    if (profile.role === 'PROPRIETAIRE') {
      router.replace('/dashboard/owner');
      inFlight.current = false;
      return;
    }

    router.replace('/');
    inFlight.current = false;
  };

  return { redirectAfterAuth };
}
