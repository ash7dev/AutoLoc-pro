import { apiFetch } from './api-client';

const AUTH_ENDPOINTS = {
  me: '/auth/me',
  login: '/auth/login',
  refresh: '/auth/refresh',
  completeProfile: '/auth/complete-profile',
  switchRole: '/auth/switch-role',
  submitKyc: '/auth/kyc/submit',
  submitKycLinks: '/auth/kyc/submit-links',
  kycUploadSignature: '/auth/kyc/upload-signature',
  linkPermis: '/auth/permis/link',
  checkAvailability: '/auth/check-availability',
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
  phoneVerified?: boolean;
  kycStatus?: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  hasVehicles?: boolean;
  hasPermis?: boolean;
  prenom?: string | null;
  nom?: string | null;
  dateNaissance?: string | null;
  bloqueJusqua?: string | null;
}

export interface NestAuthResponse {
  activeRole: ProfileResponse['role'];
  profile?: ProfileResponse;
}


export interface CompleteProfileInput {
  prenom: string;
  nom: string;
  telephone: string;
  dateNaissance?: string;
  avatarUrl?: string;
}

export async function fetchMe(accessToken?: string): Promise<ProfileResponse> {
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
  accessToken: string | undefined,
  input: CompleteProfileInput,
): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse, CompleteProfileInput>(
    AUTH_ENDPOINTS.completeProfile,
    { method: 'POST', body: input, accessToken },
  );
}

export async function switchRole(
  accessToken: string | undefined,
  role: 'LOCATAIRE' | 'PROPRIETAIRE',
): Promise<{ role: ProfileResponse['role'] }> {
  return apiFetch(AUTH_ENDPOINTS.switchRole, {
    method: 'PATCH',
    body: { role },
    accessToken,
  });
}

export async function submitKyc(formData: FormData): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse, FormData>(AUTH_ENDPOINTS.submitKyc, {
    method: 'POST',
    body: formData,
  });
}

export async function fetchKycUploadSignature(detection?: string): Promise<any> {
  const query = detection ? `?detection=${detection}` : '';
  return apiFetch(`${AUTH_ENDPOINTS.kycUploadSignature}${query}`);
}

export async function submitKycLinks(body: {
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl?: string;
}): Promise<ProfileResponse> {
  const result = await apiFetch<ProfileResponse, any>(AUTH_ENDPOINTS.submitKycLinks, {
    method: 'POST',
    body,
  });

  // ✅ OPTIMISATION: Invalider les caches après soumission KYC
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('user-profile');
      revalidateTag('owner-permissions');
    } catch (e) {
      console.warn('revalidateTag skipped on client:', e);
    }
  }

  return result;
}

export async function submitPermisLink(body: {
  url: string;
  publicId: string;
}): Promise<{ url: string }> {
  const result = await apiFetch<{ url: string }, { url: string; publicId: string }>(AUTH_ENDPOINTS.linkPermis, {
    method: 'POST',
    body,
  });

  // ✅ OPTIMISATION: Invalider les caches après upload permis
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('user-profile');
      revalidateTag('tenant-permissions');
    } catch (e) {
      console.warn('revalidateTag skipped on client:', e);
    }
  }

  return result;
}

export async function checkAvailability(params: {
  email?: string;
  phone?: string;
}): Promise<{
  available: boolean;
  message?: string;
  exists?: boolean;
  hasUtilisateur?: boolean;
}> {
  const query = new URLSearchParams();
  if (params.email) query.set('email', params.email);
  if (params.phone) query.set('phone', params.phone);
  return apiFetch(`${AUTH_ENDPOINTS.checkAvailability}?${query.toString()}`);
}

// ── User Profile ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  telephone: string;
  prenom: string;
  nom: string;
  avatarUrl: string | null;
  dateNaissance: string | null;
  phoneVerified: boolean;
  profileCompleted: boolean;
  statutKyc: string;
  role: string;
  noteLocataire: number;
  noteProprietaire: number;
  totalAvis: number;
  creeLe: string;
  permisUrl?: string | null;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycSelfieUrl?: string | null;
}

/**
 * Fetch the authenticated user's full profile.
 */
export async function fetchUserProfile(accessToken?: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/users/me/profile', { accessToken });
}

/**
 * Update the authenticated user's profile (client-side via proxy).
 */
export async function updateUserProfile(
  data: Partial<Pick<UserProfile, 'prenom' | 'nom' | 'email' | 'avatarUrl' | 'dateNaissance'>>,
): Promise<{ kycReset?: boolean;[key: string]: any }> {
  return apiFetch('/users/me/profile', {
    method: 'PATCH',
    body: data,
  });
}
