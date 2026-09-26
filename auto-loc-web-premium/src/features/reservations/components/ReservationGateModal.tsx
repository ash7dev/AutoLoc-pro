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
    <div className="fixed inset-0 z-50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black/60 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Background click overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Central Modal Container */}
      <div className="relative z-10 w-full max-w-lg my-auto flex flex-col items-center">
        {/* En-tête Navigation Modale */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={upgradingRole}
              className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* Indicateur de Progression */}
          {!isPreGate && !isAgeWarning ? (
            <div className="flex items-center gap-2 bg-brand-dark border border-brand-main px-3.5 py-1.5 rounded-full shadow-md text-white">
              <span className="text-[11px] font-semibold text-white">
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
                            ? 'w-1.5 bg-emerald-500'
                            : 'w-1.5 bg-white/30'
                        }`}
                      />
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-brand-dark border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                {isOwnerMode ? 'ESPACE PROPRIÉTAIRE' : 'VÉRIFICATION SÉCURISÉE'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={upgradingRole}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-800 shadow-md border border-slate-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="w-4.5 h-4.5 text-slate-700" strokeWidth={2.5} />
          </button>
        </div>

        {/* Corps de la Modale */}
        <div className="w-full">
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
    </div>
  );
};
