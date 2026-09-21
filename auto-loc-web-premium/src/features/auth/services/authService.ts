import { fetchApi } from '../../../../lib/config';
import {
  AuthSuccessResponse,
  CheckAvailabilityResponse,
  CompleteProfileRequest,
  PhoneLoginSendOtpResponse,
  ProfileResponse,
} from '../types/auth.types';
import { UserProfile } from '../../../types/user';

export class AuthService {
  /**
   * Envoie un code OTP de connexion par SMS ou WhatsApp via l'API backend NestJS
   */
  public static async sendPhoneLoginOtp(
    phone: string,
    channel: 'sms' | 'whatsapp' | 'email' | 'auto' = 'auto',
    isRegister?: boolean,
    email?: string
  ): Promise<PhoneLoginSendOtpResponse> {
    return await fetchApi<PhoneLoginSendOtpResponse>('/auth/phone-login/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, channel, isRegister, email }),
    });
  }

  /**
   * Connexion par email et mot de passe via l'API backend NestJS
   */
  public static async loginWithEmail(
    email: string,
    password: string
  ): Promise<AuthSuccessResponse> {
    return await fetchApi<AuthSuccessResponse>('/auth/login-email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Vérifie le code OTP réel transmis au backend et retourne la session JWT & profil
   */
  public static async verifyPhoneLoginOtp(
    phone: string,
    code: string
  ): Promise<AuthSuccessResponse> {
    return await fetchApi<AuthSuccessResponse>('/auth/phone-login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  }

  /**
   * Vérifie la disponibilité d'un email ou numéro auprès du backend
   */
  public static async checkAvailability(
    email?: string,
    phone?: string
  ): Promise<CheckAvailabilityResponse> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);

    return await fetchApi<CheckAvailabilityResponse>(`/auth/check-availability?${params.toString()}`);
  }

  /**
   * Complète le profil utilisateur (Prénom, Nom, Date de naissance)
   */
  public static async completeProfile(data: CompleteProfileRequest): Promise<ProfileResponse> {
    return await fetchApi<ProfileResponse>('/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Switche le rôle de l'utilisateur ('PROPRIETAIRE' | 'LOCATAIRE') auprès du backend
   * et récupère les nouveaux JWT tokens mis à jour.
   */
  public static async switchRole(role: 'PROPRIETAIRE' | 'LOCATAIRE'): Promise<{
    role: string;
    accessToken: string;
    refreshToken: string;
    profile: ProfileResponse;
  }> {
    return await fetchApi<{
      role: string;
      accessToken: string;
      refreshToken: string;
      profile: ProfileResponse;
    }>('/auth/switch-role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  /**
   * Récupère le profil complet de l'utilisateur connecté auprès du backend NestJS
   */
  public static async getMe(): Promise<ProfileResponse> {
    return await fetchApi<ProfileResponse>('/auth/me');
  }

  /**
   * Mappe le ProfileResponse NestJS vers notre UserProfile standard
   */
  public static mapProfileResponseToUserProfile(profile: ProfileResponse): UserProfile {
    return {
      id: profile.userId || profile.id || '',
      prenom: profile.prenom || '',
      nom: profile.nom || '',
      email: profile.email || '',
      telephone: profile.telephone || profile.phone || undefined,
      phoneVerified: Boolean(profile.phoneVerified),
      dateNaissance: profile.dateNaissance,
      avatarUrl: profile.avatarUrl,
      permisUrl: profile.permisUrl || (profile.hasPermis ? 'HAS_PERMIS' : null),
      role: profile.role || 'LOCATAIRE',
      statutKyc: profile.statutKyc || profile.kycStatus || 'NON_VERIFIE',
      kycRejectionReason: profile.kycRejectionReason,
      createdAt: profile.createdAt,
    };
  }
}
