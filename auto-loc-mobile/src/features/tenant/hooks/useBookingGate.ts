import { useAppStore } from '../../../core/store/useAppStore';

export type GateStep = 
  | 'PREGATE' 
  | 'PROFILE' 
  | 'PHONE' 
  | 'KYC' 
  | 'PERMIS' 
  | 'AGE_INSUFFICIENT';

export interface GateEvaluation {
  canProceed: boolean;
  missingSteps: GateStep[];
  userAge: number | null;
  isKycPending: boolean;
  isKycVerified: boolean;
  isKycRejected: boolean;
  kycRejectionReason: string | null;
}

export function calculateAge(dateNaissanceStr?: string): number | null {
  if (!dateNaissanceStr) return null;
  const birthDate = new Date(dateNaissanceStr);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function useBookingGate(vehicleMinimumAge?: number): GateEvaluation {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !user) {
    return {
      canProceed: false,
      missingSteps: ['PREGATE', 'PROFILE', 'PHONE', 'KYC', 'PERMIS'],
      userAge: null,
      isKycPending: false,
      isKycVerified: false,
      isKycRejected: false,
      kycRejectionReason: null,
    };
  }

  const missingSteps: GateStep[] = [];

  // 1. Profil de base
  const hasProfile = Boolean(user.prenom && user.nom && user.dateNaissance);
  if (!hasProfile) {
    missingSteps.push('PROFILE');
  }

  // 2. Vérification Téléphone
  if (!user.phoneVerified) {
    missingSteps.push('PHONE');
  }

  // 3. Vérification Âge (si véhicule a une contrainte)
  const userAge = calculateAge(user.dateNaissance);
  const isTooYoung = vehicleMinimumAge && userAge !== null && userAge < vehicleMinimumAge;
  if (isTooYoung) {
    missingSteps.push('AGE_INSUFFICIENT');
  }

  // 4. Statut KYC
  const kyc = user.statutKyc || 'NON_VERIFIE';
  const isKycVerified = kyc === 'VERIFIE';
  const isKycPending = kyc === 'EN_ATTENTE';
  const isKycRejected = kyc === 'REJETE';

  if (kyc === 'NON_VERIFIE' || kyc === 'REJETE') {
    missingSteps.push('KYC');
  }

  // 5. Permis de conduire
  if (!user.permisUrl) {
    missingSteps.push('PERMIS');
  }

  // Si au moins une étape manque (hors éligibilité âge qui est bloquante),
  // on insère 'PREGATE' au début pour annoncer le parcours à l'utilisateur
  if (missingSteps.length > 0 && !missingSteps.includes('AGE_INSUFFICIENT')) {
    missingSteps.unshift('PREGATE');
  }

  // L'utilisateur peut passer si aucune étape critique ne manque
  // (Note: EN_ATTENTE est accepté pour réserver, mais la réservation attend la validation de l'admin)
  const canProceed = missingSteps.length === 0 && !isTooYoung;

  return {
    canProceed,
    missingSteps,
    userAge,
    isKycPending,
    isKycVerified,
    isKycRejected,
    kycRejectionReason: user.kycRejectionReason ?? null,
  };
}
