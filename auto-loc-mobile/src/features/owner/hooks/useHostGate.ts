import { useAppStore } from '../../../core/store/useAppStore';
import { GateStep, calculateAge } from '../../tenant/hooks/useBookingGate';

export interface HostGateEvaluation {
  canProceed: boolean;
  missingSteps: GateStep[];
  isHost: boolean;
  userAge: number | null;
  isKycPending: boolean;
  isKycVerified: boolean;
  isKycRejected: boolean;
  kycRejectionReason: string | null;
}

export function useHostGate(): HostGateEvaluation {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated || !user) {
    return {
      canProceed: false,
      missingSteps: ['PREGATE', 'PROFILE', 'PHONE', 'KYC', 'PERMIS'],
      isHost: false,
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

  // 3. Statut KYC
  const kyc = user.statutKyc || 'NON_VERIFIE';
  const isKycVerified = kyc === 'VERIFIE';
  const isKycPending = kyc === 'EN_ATTENTE';
  const isKycRejected = kyc === 'REJETE';

  if (kyc === 'NON_VERIFIE' || kyc === 'REJETE') {
    missingSteps.push('KYC');
  }

  // 4. Permis de conduire
  if (!user.permisUrl) {
    missingSteps.push('PERMIS');
  }

  // Insérer PREGATE au début si au moins une étape manque
  if (missingSteps.length > 0) {
    missingSteps.unshift('PREGATE');
  }

  const isHost = user.role === 'PROPRIETAIRE';
  const canProceed = missingSteps.length === 0;
  const userAge = calculateAge(user.dateNaissance || undefined);

  return {
    canProceed,
    missingSteps,
    isHost,
    userAge,
    isKycPending,
    isKycVerified,
    isKycRejected,
    kycRejectionReason: user.kycRejectionReason ?? null,
  };
}
