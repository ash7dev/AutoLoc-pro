import { KycStatus, UserRole } from '../../../types/user';

export interface PhoneLoginSendOtpRequest {
  phone: string;
  channel?: 'whatsapp' | 'sms' | 'auto';
}

export interface PhoneLoginSendOtpResponse {
  expiresIn: number;
}

export interface PhoneLoginVerifyOtpRequest {
  phone: string;
  code: string;
}

export interface ProfileResponse {
  userId: string;
  id?: string;
  prenom: string;
  nom: string;
  email: string;
  phone?: string | null;
  telephone?: string | null;
  phoneVerified?: boolean;
  dateNaissance?: string;
  avatarUrl?: string;
  permisUrl?: string | null;
  role: UserRole;
  statutKyc?: KycStatus;
  kycStatus?: KycStatus;
  kycRejectionReason?: string | null;
  createdAt?: string;
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  activeRole: UserRole;
  profile: ProfileResponse;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface CompleteProfileRequest {
  prenom: string;
  nom: string;
  email?: string;
  dateNaissance?: string;
}
