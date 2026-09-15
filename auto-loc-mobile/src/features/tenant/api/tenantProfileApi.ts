import { apiClient } from '../../../core/api/apiClient';

export type TenantKycStatus = 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';

export interface TenantProfile {
  id: string;
  userId: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  avatarUrl: string | null;
  dateNaissance: string | null;
  phoneVerified: boolean;
  profileCompleted: boolean;
  statutKyc: TenantKycStatus;
  kycRejectionReason?: string | null;
  permisUrl: string | null;
  noteLocataire: number;
  totalAvis: number;
  creeLe: string;
  role: string;
}

export async function fetchTenantProfile(): Promise<TenantProfile> {
  const response = await apiClient.get<TenantProfile>('/users/me/profile');
  return response.data;
}

export async function updateTenantProfile(input: Pick<TenantProfile, 'prenom' | 'nom'> & { dateNaissance?: string | null }) {
  const body = {
    prenom: input.prenom,
    nom: input.nom,
    ...(input.dateNaissance ? { dateNaissance: input.dateNaissance } : {}),
  };
  const response = await apiClient.patch<Partial<TenantProfile>>('/users/me/profile', body);
  return response.data;
}

export async function uploadTenantAvatar(uri: string): Promise<string> {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const body = new FormData();
  body.append('file', { uri, name: `avatar.${extension}`, type: mimeType } as unknown as Blob);
  const response = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.avatarUrl;
}

export async function becomeAutoLocHost() {
  const response = await apiClient.patch<{
    role: 'PROPRIETAIRE';
    accessToken: string;
    refreshToken: string;
    profile: TenantProfile;
  }>('/auth/switch-role', { role: 'PROPRIETAIRE' });
  return response.data;
}

export async function updateLoginSecurity(input: { email?: string; password?: string }) {
  const response = await apiClient.patch<{
    success: boolean;
    emailUpdated: boolean;
    passwordUpdated: boolean;
    email: string;
    message: string;
  }>('/users/me/security', input);
  return response.data;
}
