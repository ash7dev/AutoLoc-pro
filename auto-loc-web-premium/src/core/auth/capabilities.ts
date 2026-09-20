import { UserProfile, UserCapabilities } from '../../types/user';

/**
 * Calculateur centralisé des capacités et permissions utilisateur (Standard Big Tech)
 * Permet d'évaluer de manière déterministe ce qu'un utilisateur a le droit d'effectuer.
 */
export function computeUserCapabilities(user: UserProfile | null): UserCapabilities {
  if (!user) {
    return {
      isAuthenticated: false,
      isGuest: true,
      isPhoneVerified: false,
      isKycVerified: false,
      isKycPending: false,
      isKycRejected: false,
      isOwner: false,
      isAdmin: false,
      canBookVehicle: false,
      canPublishListing: false,
      canWithdrawPayout: false,
      requiresKycAction: true,
    };
  }

  const isPhoneVerified = Boolean(user.phoneVerified);
  const isKycVerified = user.statutKyc === 'VERIFIE';
  const isKycPending = user.statutKyc === 'EN_ATTENTE';
  const isKycRejected = user.statutKyc === 'REJETE';
  const isOwner = user.role === 'PROPRIETAIRE' || user.role === 'ADMIN';
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPPORT';

  // En Afrique de l'Ouest / AutoLoc, un locataire en 'EN_ATTENTE' peut réserver
  // sous réserve de validation finale avant la prise en main du véhicule.
  const canBookVehicle = isPhoneVerified && (isKycVerified || isKycPending);

  // Un propriétaire doit être impérativement VERIFIE pour que ses annonces soient publiques et qu'il puisse retirer ses fonds.
  const canPublishListing = isOwner && isPhoneVerified && isKycVerified;
  const canWithdrawPayout = isOwner && isKycVerified;

  const requiresKycAction = user.statutKyc === 'NON_VERIFIE' || user.statutKyc === 'REJETE';

  return {
    isAuthenticated: true,
    isGuest: false,
    isPhoneVerified,
    isKycVerified,
    isKycPending,
    isKycRejected,
    isOwner,
    isAdmin,
    canBookVehicle,
    canPublishListing,
    canWithdrawPayout,
    requiresKycAction,
  };
}
