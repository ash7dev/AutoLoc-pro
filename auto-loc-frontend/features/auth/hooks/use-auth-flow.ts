'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { fetchMe, type ProfileResponse } from '../../../lib/nestjs/auth';
import { syncWithNestJS } from './use-nest-token';
import { useRoleStore } from '../stores/role.store';

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inFlight = useRef(false);

  const redirectAfterAuth = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] start');
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let data = (await supabase.auth.getSession()).data;
    let token = data.session?.access_token ?? null;
    for (let i = 0; i < 5 && !token; i += 1) {
      await wait(200);
      data = (await supabase.auth.getSession()).data;
      token = data.session?.access_token ?? null;
    }
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] token present', Boolean(token));
    if (!token) {
      inFlight.current = false;
      return;
    }

    const provider =
      data.session?.user?.app_metadata?.provider ??
      (data.session?.user?.app_metadata as { providers?: string[] })?.providers?.[0];
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] provider', provider);

    let syncOk = false;
    for (let i = 0; i < 3 && !syncOk; i += 1) {
      try {
        const session = await syncWithNestJS(token);
        useRoleStore.getState().setSession(session);
        syncOk = true;
      } catch {
        await wait(200);
      }
    }
    if (!syncOk) {
      inFlight.current = false;
      return;
    }

    const profile = await fetchMe();
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] profile', profile);

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
