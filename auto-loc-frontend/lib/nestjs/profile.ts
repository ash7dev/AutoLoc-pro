import { apiFetch } from './api-client';

const PROFILE_ENDPOINTS = {
  profile: '/users/me/profile',
  avatar: '/users/me/avatar',
} as const;

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
  statutKyc: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';
  role: 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';
  noteLocataire: number;
  noteProprietaire: number;
  totalAvis: number;
  creeLe: string;
  permisUrl: string | null;
  kycDocumentUrl: string | null;
  kycDocumentBackUrl: string | null;
  kycSelfieUrl: string | null;
}

export interface UpdateProfileDto {
  prenom?: string;
  nom?: string;
  avatarUrl?: string;
  dateNaissance?: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
  publicId: string;
}

export interface DeleteAvatarResponse {
  message: string;
}

/**
 * Récupère le profil complet de l'utilisateur connecté
 */
export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(PROFILE_ENDPOINTS.profile, {
    accessToken,
    next: { revalidate: 60 },
  });
}

/**
 * Met à jour le profil de l'utilisateur
 */
export async function updateUserProfile(
  accessToken: string,
  data: UpdateProfileDto
): Promise<Partial<UserProfile>> {
  return apiFetch<Partial<UserProfile>, UpdateProfileDto>(PROFILE_ENDPOINTS.profile, {
    accessToken,
    method: 'PATCH',
    body: data,
  });
}

/**
 * Upload une photo de profil (avatar) - Server-side avec token explicite
 */
export async function uploadAvatarServer(
  accessToken: string,
  file: File
): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NEST_API_BASE_URL}${PROFILE_ENDPOINTS.avatar}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload avatar');
  }

  return response.json();
}

/**
 * Upload une photo de profil (avatar) - Client-side via proxy
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const BASE_URL = typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? '')
    : '/api/nest';

  const response = await fetch(`${BASE_URL}${PROFILE_ENDPOINTS.avatar}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload avatar');
  }

  return response.json();
}

/**
 * Supprime la photo de profil (avatar) - Server-side avec token explicite
 */
export async function deleteAvatarServer(accessToken: string): Promise<DeleteAvatarResponse> {
  return apiFetch<DeleteAvatarResponse>(PROFILE_ENDPOINTS.avatar, {
    accessToken,
    method: 'DELETE',
  });
}

/**
 * Supprime la photo de profil (avatar) - Client-side via proxy
 */
export async function deleteAvatar(): Promise<DeleteAvatarResponse> {
  return apiFetch<DeleteAvatarResponse>(PROFILE_ENDPOINTS.avatar, {
    method: 'DELETE',
  });
}
