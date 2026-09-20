import { apiClient } from '../../../core/api/apiClient';

export interface UserProfileResponse {
  id?: string;
  userId: string;
  prenom?: string;
  nom?: string;
  email?: string;
  phone?: string;
  role: string;
  hasUtilisateur?: boolean;
  utilisateurId?: string;
  statutKyc?: string;
  avatarUrl?: string;
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  activeRole: string;
  profile: UserProfileResponse;
}

export interface SendPhoneOtpResponse {
  expiresIn: number;
}

export const authApi = {
  // 1. Demande d'OTP pour connexion rapide téléphone (WhatsApp ou SMS direct)
  async sendPhoneLoginOtp(phone: string, channel?: 'whatsapp' | 'sms' | 'auto'): Promise<SendPhoneOtpResponse> {
    const response = await apiClient.post<SendPhoneOtpResponse>('/auth/phone-login/send-otp', {
      phone,
      channel,
    });
    return response.data;
  },

  // 2. Validation d'OTP pour connexion rapide téléphone
  async verifyPhoneLoginOtp(phone: string, code: string): Promise<AuthSuccessResponse> {
    const response = await apiClient.post<AuthSuccessResponse>('/auth/phone-login/verify-otp', {
      phone,
      code,
    });
    return response.data;
  },

  // 3. Connexion via jeton Supabase / Google OAuth
  async loginWithSupabaseToken(supabaseAccessToken: string): Promise<AuthSuccessResponse> {
    const response = await apiClient.post<AuthSuccessResponse>('/auth/login', {
      accessToken: supabaseAccessToken,
    });
    return response.data;
  },

  // 3b. Connexion directe Email & Mot de passe
  async loginWithEmail(email: string, password: string): Promise<AuthSuccessResponse> {
    const response = await apiClient.post<AuthSuccessResponse>('/auth/login-email', {
      email,
      password,
    });
    return response.data;
  },

  // 4. Vérification de disponibilité Email & Téléphone
  async checkAvailability(email?: string, phone?: string): Promise<{ available: boolean; message?: string }> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    const response = await apiClient.get<{ available: boolean; message?: string }>(
      `/auth/check-availability?${params.toString()}`
    );
    return response.data;
  },

  // 5. Compléter le Profil (Après inscription Supabase)
  async completeProfile(data: {
    prenom: string;
    nom: string;
    telephone: string;
    dateNaissance?: string;
  }): Promise<UserProfileResponse> {
    const response = await apiClient.post<UserProfileResponse>('/auth/complete-profile', data);
    return response.data;
  },

  // 6. Profil actuel
  async getMe(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>('/auth/me');
    return response.data;
  },

  // 7. Déconnexion côté serveur
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
