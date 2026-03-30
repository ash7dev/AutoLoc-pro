import type { NestAuthResponse } from '../../../lib/nestjs/auth';
import { useRoleStore } from '../stores/role.store';

export async function syncWithNestJS(
  supabaseAccessToken: string,
): Promise<NestAuthResponse> {
  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ supabaseToken: supabaseAccessToken }),
  });
  if (!res.ok) {
    throw new Error('Echec de synchronisation NestJS');
  }
  const session = await res.json() as NestAuthResponse;
  useRoleStore.getState().setSession(session);
  return session;
}

export async function ensureValidNestToken(): Promise<boolean> {
  try {
    await fetch('/api/nest/auth/me', { cache: 'no-store' });
    return true;
  } catch {
    return false;
  }
}

export function useNestToken() {
  const activeRole = useRoleStore((s) => s.activeRole);
  const clearRole = useRoleStore((s) => s.clearRole);
  return { activeRole, clearRole };
}
