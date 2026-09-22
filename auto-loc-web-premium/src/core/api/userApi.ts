import { apiClient } from './apiClient';

export interface UserProfileData {
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
  statutKyc: 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'VALIDE' | 'REJETE' | 'REFUSE';
  role: 'PROPRIETAIRE' | 'LOCATAIRE' | 'ADMIN';
  noteLocataire: number;
  noteProprietaire: number;
  totalAvis: number;
  creeLe: string;
  permisUrl: string | null;
  kycDocumentUrl: string | null;
  kycDocumentBackUrl: string | null;
  kycSelfieUrl: string | null;
  annoncesCount: number;
  listingsCount: number;
}

export interface UpdateProfileDto {
  prenom?: string;
  nom?: string;
  dateNaissance?: string | null;
  email?: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileResponse {
  id: string;
  prenom: string;
  nom: string;
  avatarUrl: string | null;
  dateNaissance: string | null;
  profileCompleted: boolean;
  misAJourLe: string;
  kycReset?: boolean;
}

export const userApi = {
  /**
   * GET /users/me/profile — Récupère le profil complet
   */
  getProfile: (): Promise<UserProfileData> => {
    return apiClient.get<UserProfileData>('/users/me/profile');
  },

  /**
   * PATCH /users/me/profile — Met à jour le prénom, nom, dateNaissance
   */
  updateProfile: (dto: UpdateProfileDto): Promise<UpdateProfileResponse> => {
    return apiClient.patch<UpdateProfileResponse>('/users/me/profile', dto);
  },

  /**
   * POST /users/me/avatar — Upload une photo d'avatar vers Cloudinary
   */
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ avatarUrl: string; publicId: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * DELETE /users/me/avatar — Supprime la photo de profil
   */
  deleteAvatar: (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/users/me/avatar');
  },

  /**
   * PATCH /users/me/security — Met à jour le mot de passe / e-mail
   */
  updateSecurity: (body: { email?: string; currentPassword?: string; newPassword?: string }): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>('/users/me/security', body);
  },

  /**
   * DELETE /users/me/account — Supprime définitivement le compte
   */
  deleteAccount: (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/users/me/account');
  },
};
