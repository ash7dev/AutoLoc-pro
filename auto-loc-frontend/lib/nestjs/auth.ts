import { apiFetch } from './api-client';

const AUTH_ENDPOINTS = {
  me: '/auth/me',
  login: '/auth/login',
  refresh: '/auth/refresh',
  completeProfile: '/auth/complete-profile',
  switchRole: '/auth/switch-role',
} as const;

export interface ProfileResponse {
  id: string;
  userId: string;
  email: string | null;
  phone: string | null;
  role: 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';
  createdAt: string;
  hasUtilisateur: boolean;
  utilisateurId?: string;
}

export interface NestAuthResponse {
  accessToken: string;
  refreshToken: string;
  activeRole: ProfileResponse['role'];
}

export interface CompleteProfileInput {
  prenom: string;
  nom: string;
  telephone: string;
  dateNaissance?: string;
  avatarUrl?: string;
}

export async function fetchMe(accessToken: string): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>(AUTH_ENDPOINTS.me, { accessToken });
}

export async function loginWithSupabase(
  supabaseAccessToken: string,
): Promise<NestAuthResponse> {
  return apiFetch<NestAuthResponse, { accessToken: string }>(AUTH_ENDPOINTS.login, {
    method: 'POST',
    body: { accessToken: supabaseAccessToken },
  });
}

export async function refreshNestToken(
  refreshToken: string,
): Promise<NestAuthResponse> {
  return apiFetch<NestAuthResponse, { refreshToken: string }>(AUTH_ENDPOINTS.refresh, {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function completeProfile(
  accessToken: string,
  input: CompleteProfileInput,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse, CompleteProfileInput>(
    AUTH_ENDPOINTS.completeProfile,
    { method: 'POST', body: input, accessToken },
  );
}

export async function switchRole(
  accessToken: string,
  role: 'LOCATAIRE' | 'PROPRIETAIRE',
): Promise<{ role: ProfileResponse['role'] }> {
  return apiFetch(AUTH_ENDPOINTS.switchRole, {
    method: 'PATCH',
    body: { role },
    accessToken,
  });
}
