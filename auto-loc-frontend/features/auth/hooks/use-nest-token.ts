import { loginWithSupabase, refreshNestToken, type NestAuthResponse } from '../../../lib/nestjs/auth';
import { useRoleStore } from '../stores/role.store';

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + 10;
}

export async function syncWithNestJS(
  supabaseAccessToken: string,
): Promise<NestAuthResponse> {
  const session = await loginWithSupabase(supabaseAccessToken);
  useRoleStore.getState().setSession(session);
  return session;
}

export async function ensureValidNestToken(): Promise<string | null> {
  const { accessToken, refreshToken, setSession, clearRole } = useRoleStore.getState();
  if (!accessToken) return null;
  if (!isExpired(accessToken)) return accessToken;
  if (!refreshToken) {
    clearRole();
    return null;
  }
  try {
    const next = await refreshNestToken(refreshToken);
    setSession(next);
    return next.accessToken;
  } catch {
    clearRole();
    return null;
  }
}

export function useNestToken() {
  const accessToken = useRoleStore((s) => s.accessToken);
  const activeRole = useRoleStore((s) => s.activeRole);
  const clearRole = useRoleStore((s) => s.clearRole);
  return { accessToken, activeRole, clearRole };
}
