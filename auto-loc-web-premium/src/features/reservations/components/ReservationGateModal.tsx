import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ShieldCheck } from 'lucide-react';
import { GateStep } from '../../kyc/types/kyc.types';
import { BookingPreGateOverview } from './gates/BookingPreGateOverview';
import { GateStepProfile } from './gates/GateStepProfile';
import { GateStepPhoneOtp } from './gates/GateStepPhoneOtp';
import { GateStepKycIdentity } from './gates/GateStepKycIdentity';
import { GateStepDriverLicense } from './gates/GateStepDriverLicense';
import { GateStepAgeWarning } from './gates/GateStepAgeWarning';
import { useUserStore } from '../../../core/store/useUserStore';
import { fetchApi } from '@/lib/config';

interface ReservationGateModalProps {
  visible: boolean;
  mode?: 'TENANT' | 'OWNER';
  vehicleTitle?: string;
  vehicleMinimumAge?: number;
  missingSteps: GateStep[];
  userAge: number | null;
  onClose: () => void;
  onAllCompleted: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const ReservationGateModal: React.FC<ReservationGateModalProps> = ({
  visible,
  mode = 'TENANT',
  vehicleTitle = 'ce véhicule',
  vehicleMinimumAge,
  missingSteps,
  userAge,
  onClose,
  onAllCompleted,
  customTitle,
  customSubtitle,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [upgradingRole, setUpgradingRole] = useState(false);

  const user = useUserStore((state) => state.user);
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
    }
  }, [visible]);

  if (!visible || missingSteps.length === 0) {
    return null;
  }

  const currentStep = missingSteps[currentStepIndex] || missingSteps[0];
  const totalSteps = missingSteps.length;
  const isPreGate = currentStep === 'PREGATE';
  const isAgeWarning = currentStep === 'AGE_INSUFFICIENT';

  const handleStepSuccess = async () => {
    if (currentStepIndex + 1 < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Si mode proprietaire/hôte, effectuer le passage de rôle si nécessaire
      if (mode === 'OWNER' && user && user.role !== 'PROPRIETAIRE') {
        try {
          setUpgradingRole(true);
          await fetchApi('/auth/become-host', { method: 'POST' });
          updateProfilePartial({ role: 'PROPRIETAIRE' });
        } catch {
          // Fallback dev mode
          updateProfilePartial({ role: 'PROPRIETAIRE' });
        } finally {
          setUpgradingRole(false);
        }
      }
      onAllCompleted();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const isOwnerMode = mode === 'OWNER';
  const defaultTitle = isOwnerMode ? 'Devenir Hôte AutoLoc' : 'Dernière étape avant réservation';
  const defaultSubtitle = isOwnerMode
    ? 'Pour assurer la sécurité des locataires et la couverture d\'assurance de vos véhicules, complétez votre profil hôte.'
    : undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#062017] via-[#04150F] to-[#020B08] flex flex-col animate-in fade-in duration-200">

      {/* 1. Aura Lumineuse Émeraude */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-xl h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* 2. En-tête Navigation Glassmorphism */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={upgradingRole}
              className="w-9.5 h-9.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>
          ) : (
            <div className="w-9.5" />
          )}

          {/* Indicateur de Progression en Pilule Glass */}
          {!isPreGate && !isAgeWarning ? (
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/18 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="text-[11px] font-medium text-white">
                Étape {currentStepIndex} / {totalSteps - 1}
              </span>
              <div className="flex items-center gap-1.5">
                {missingSteps
                  .filter((s) => s !== 'PREGATE')
                  .map((stepItem, idx) => {
                    const activeIdx = currentStepIndex - 1;
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;

                    return (
                      <div
                        key={stepItem}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'w-4 bg-emerald-400'
                            : isCompleted
                            ? 'w-1.5 bg-emerald-600'
                            : 'w-1.5 bg-white/30'
                        }`}
                      />
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/10 border border-emerald-400/30 px-3 py-1.5 rounded-full backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-medium tracking-wider text-emerald-400 uppercase">
                {isOwnerMode ? 'ESPACE PROPRIÉTAIRE' : 'VÉRIFICATION SÉCURISÉE'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={upgradingRole}
            className="w-9.5 h-9.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 3. Corps de la Modale */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        {currentStep === 'PREGATE' && (
          <BookingPreGateOverview
            vehicleTitle={vehicleTitle}
            missingSteps={missingSteps}
            onStart={() => setCurrentStepIndex(1)}
            onCancel={onClose}
            customTitle={customTitle || defaultTitle}
            customSubtitle={customSubtitle || defaultSubtitle}
          />
        )}

        {currentStep === 'PROFILE' && (
          <GateStepProfile onSuccess={handleStepSuccess} />
        )}

        {currentStep === 'PHONE' && (
          <GateStepPhoneOtp onSuccess={handleStepSuccess} />
        )}

        {currentStep === 'KYC' && (
          <GateStepKycIdentity onSuccess={handleStepSuccess} />
        )}

        {currentStep === 'PERMIS' && (
          <GateStepDriverLicense onSuccess={handleStepSuccess} />
        )}

        {currentStep === 'AGE_INSUFFICIENT' && (
          <GateStepAgeWarning
            vehicleMinimumAge={vehicleMinimumAge}
            userAge={userAge}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};
