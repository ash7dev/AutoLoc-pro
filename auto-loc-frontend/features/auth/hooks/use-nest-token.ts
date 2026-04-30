import type { NestAuthResponse } from '../../../lib/nestjs/auth';
import { useRoleStore } from '../stores/role.store';

export async function syncWithNestJS(
  supabaseAccessToken?: string,
  directTokens?: { accessToken: string; refreshToken: string; activeRole: string; profile: any }
): Promise<NestAuthResponse> {
  const body = directTokens 
    ? { ...directTokens }
    : { supabaseToken: supabaseAccessToken };

  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Echec de synchronisation NestJS: ${res.status} - ${errorText}`);
  }
  
  const session = await res.json() as NestAuthResponse;
  useRoleStore.getState().setSession(session);
  return session;
}


export function useNestToken() {
  const activeRole = useRoleStore((s) => s.activeRole);
  const clearRole = useRoleStore((s) => s.clearRole);
  return { activeRole, clearRole };
}
