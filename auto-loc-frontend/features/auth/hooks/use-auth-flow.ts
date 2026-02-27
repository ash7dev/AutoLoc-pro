'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { fetchMe, type ProfileResponse } from '../../../lib/nestjs/auth';
import { ensureValidNestToken } from './use-nest-token';
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

    let nestToken = await ensureValidNestToken();
    if (!nestToken) {
      // /api/auth/sync : échange le token Supabase contre un JWT NestJS,
      // pose le cookie httpOnly (RSC) et retourne les tokens pour le Zustand store.
      let syncOk = false;
      for (let i = 0; i < 3 && !syncOk; i += 1) {
        const syncRes = await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseToken: token }),
        });
        if (syncRes.ok) {
          const session = await syncRes.json() as {
            accessToken: string;
            refreshToken: string;
            activeRole: ProfileResponse['role'];
          };
          useRoleStore.getState().setSession(session);
          nestToken = session.accessToken;
          syncOk = true;
        } else {
          await wait(200);
        }
      }
      if (!syncOk) {
        inFlight.current = false;
        return;
      }
    }

    const profile = await fetchMe(nestToken);
    // eslint-disable-next-line no-console
    console.log('[AuthFlow] profile', profile);

    if (profile.role === 'ADMIN') {
      router.push('/dashboard/admin');
      inFlight.current = false;
      return;
    }

    if (profile.role === 'PROPRIETAIRE') {
      router.push('/dashboard/owner');
      inFlight.current = false;
      return;
    }

    const next = searchParams.get('next');
    if (next && next.startsWith('/')) {
      router.push(next);
      inFlight.current = false;
      return;
    }
    router.push('/');
    inFlight.current = false;
  };

  return { redirectAfterAuth };
}
