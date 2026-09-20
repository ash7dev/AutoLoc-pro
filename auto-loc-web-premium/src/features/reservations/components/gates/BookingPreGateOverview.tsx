import React from 'react';
import { ShieldCheck, Clock, Circle, ArrowRight, UserCheck, PhoneCall, FileText, Award } from 'lucide-react';
import { GateStep } from '../../../kyc/types/kyc.types';

interface BookingPreGateOverviewProps {
  vehicleTitle?: string;
  missingSteps: GateStep[];
  onStart: () => void;
  onCancel: () => void;
  customTitle?: string;
  customSubtitle?: string;
}

export const BookingPreGateOverview: React.FC<BookingPreGateOverviewProps> = ({
  vehicleTitle = 'ce véhicule',
  missingSteps,
  onStart,
  onCancel,
  customTitle,
  customSubtitle,
}) => {
  const actualSteps = missingSteps.filter((step) => step !== 'PREGATE');

  const getStepInfo = (step: GateStep) => {
    switch (step) {
      case 'PROFILE':
        return {
          title: 'Informations personnelles',
          subtitle: 'Prénom, nom et date de naissance',
          icon: UserCheck,
        };
      case 'PHONE':
        return {
          title: 'Vérification téléphone',
          subtitle: 'Confirmation par SMS / WhatsApp',
          icon: PhoneCall,
        };
      case 'KYC':
        return {
          title: 'Pièce d\'identité & Selfie',
          subtitle: 'CNI / Passeport + contrôle biométrique',
          icon: ShieldCheck,
        };
      case 'PERMIS':
        return {
          title: 'Permis de conduire',
          subtitle: 'Photo lisible de votre permis',
          icon: Award,
        };
      default:
        return {
          title: 'Vérification requise',
          subtitle: 'Validation nécessaire',
          icon: FileText,
        };
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Layer 1: Back Accent Card - Decalé 3px à gauche */}
        <div className="absolute inset-0 -left-[3px] top-[3px] rounded-[28px] bg-[#041912] border border-[#0A3D2E]/80 pointer-events-none shadow-md" />

        {/* Layer 2: Front Glass Card */}
        <div className="relative bg-white border border-[rgba(255,255,255,0.80)] rounded-[28px] p-5 sm:p-6 shadow-[0_14px_24px_rgba(0,0,0,0.22)]">
          {/* Header Icon & Badges */}
          <div className="flex flex-col items-center text-center mb-3">
            <div className="w-[60px] h-[60px] rounded-[30px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-[#059669]" strokeWidth={2.2} />
            </div>

            <div className="inline-flex items-center gap-[6px] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-[5px] rounded-full text-[9px] font-medium tracking-[0.8px] text-[#059669] uppercase mb-2">
              <ShieldCheck className="w-3 h-3 text-[#059669]" />
              <span>PRÉ-REQUIS DE RÉSERVATION</span>
            </div>

            <h2 className="text-[22px] leading-[28px] font-normal text-[#041912] font-fraunces tracking-tight">
              {customTitle ? (
                customTitle
              ) : (
                <>
                  Dernière étape avant <span className="italic text-emerald-700">réservation.</span>
                </>
              )}
            </h2>
            <p className="text-[13px] leading-[19px] text-[#64748B] mt-1">
              {customSubtitle || (
                <>
                  Pour votre sécurité et celle du propriétaire, complétez votre profil pour réserver{' '}
                  <strong className="font-medium text-[#041912]">{vehicleTitle}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Time Estimate Card */}
          <div className="flex items-center gap-[8px] bg-[#ECFDF5] border border-[#A7F3D0] px-[14px] py-[10px] rounded-[14px] mb-3">
            <Clock className="w-4 h-4 text-[#059669] flex-shrink-0" />
            <p className="text-[12px] text-[#041912] font-medium">
              Temps estimé : <strong className="font-medium text-[#059669]">~2 minutes</strong> • Valide à vie
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[18px] p-4 mb-3">
            <p className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#041912] mb-3">
              Vérifications à effectuer :
            </p>

            <div className="space-y-3">
              {actualSteps.map((step, index) => {
                const info = getStepInfo(step);
                const Icon = info.icon;
                return (
                  <div key={step} className="flex items-center">
                    <div className="w-[34px] h-[34px] rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center mr-[10px] flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[#059669]" />
                    </div>
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-[13px] font-medium text-[#041912]">
                        {index + 1}. {info.title}
                      </p>
                      <p className="text-[11.5px] text-[#64748B] truncate mt-[1px]">
                        {info.subtitle}
                      </p>
                    </div>
                    <Circle className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" strokeWidth={2} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data protection note */}
          <div className="flex items-center justify-center gap-[6px] text-[#64748B] text-[11px] mb-4 text-center">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Données chiffrées & vérifiées sous la charte de confidentialité AutoLoc.</span>
          </div>

          {/* Action Group */}
          <div className="space-y-[10px]">
            <button
              type="button"
              onClick={onStart}
              className="w-full h-[50px] rounded-[25px] bg-[#041912] border border-[rgba(4,25,18,0.90)] text-white font-medium text-[14.5px] flex items-center justify-center shadow-[0_4px_10px_rgba(4,25,18,0.25)] active:scale-[0.98] transition-all"
            >
              <span>Commencer la vérification</span>
              <div className="w-[26px] h-[26px] rounded-[13px] bg-[rgba(16,185,129,0.22)] border border-[rgba(74,222,128,0.35)] flex items-center justify-center ml-2">
                <ArrowRight className="w-3.5 h-3.5 text-[#4ADE80]" strokeWidth={2.5} />
              </div>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full h-[40px] text-[13px] font-medium text-[#64748B] hover:text-[#041912] transition-colors"
            >
              Annuler pour le moment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
