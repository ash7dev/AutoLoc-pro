export type KycStatus = 'NON_VERIFIE' | 'EN_ATTENTE' | 'VERIFIE' | 'REJETE';

export type UserRole = 'LOCATAIRE' | 'PROPRIETAIRE' | 'ADMIN' | 'SUPPORT';

export type PendingIntentAction =
  | 'BOOK_VEHICLE'
  | 'ADD_FAVORITE'
  | 'VIEW_PROFILE'
  | 'VIEW_BOOKINGS'
  | 'CONTACT_HOST'
  | 'ADD_VEHICLE'
  | 'WITHDRAW_PAYOUT';

export interface PendingIntent {
  action: PendingIntentAction;
  vehicleId?: string;
  payload?: Record<string, any>;
  redirectToUrl?: string;
}

export interface UserProfile {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  phoneVerified?: boolean;
  dateNaissance?: string;
  avatarUrl?: string;
  permisUrl?: string | null;
  role: UserRole;
  statutKyc: KycStatus;
  kycRejectionReason?: string | null;
  createdAt?: string;
}

export interface UserCapabilities {
  /** Un utilisateur connecté et authentifié avec session valide */
  isAuthenticated: boolean;
  /** Vrai si le compte est en mode invité / non connecté */
  isGuest: boolean;
  /** Vrai si le téléphone a été vérifié par OTP */
  isPhoneVerified: boolean;
  /** Vrai si l'identité et le permis sont pleinement validés par l'admin */
  isKycVerified: boolean;
  /** Vrai si les documents KYC sont envoyés et en cours de traitement admin */
  isKycPending: boolean;
  /** Vrai si le KYC a été rejeté et nécessite une nouvelle soumission */
  isKycRejected: boolean;
  /** Vrai si l'utilisateur a le statut Propriétaire */
  isOwner: boolean;
  /** Vrai si l'utilisateur a des droits d'administration */
  isAdmin: boolean;
  /** Capacité de réserver directement une voiture */
  canBookVehicle: boolean;
  /** Capacité de publier une annonce visible du public */
  canPublishListing: boolean;
  /** Capacité de faire une demande de retrait des gains */
  canWithdrawPayout: boolean;
  /** Détermine si l'utilisateur a besoin d'une action KYC bloquante */
  requiresKycAction: boolean;
}
