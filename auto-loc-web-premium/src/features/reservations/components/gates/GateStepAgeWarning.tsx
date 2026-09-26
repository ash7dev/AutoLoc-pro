import React from 'react';
import { AlertCircle, CalendarDays, ArrowRight } from 'lucide-react';

interface GateStepAgeWarningProps {
  vehicleMinimumAge?: number;
  userAge: number | null;
  onClose: () => void;
}

export const GateStepAgeWarning: React.FC<GateStepAgeWarningProps> = ({
  vehicleMinimumAge = 21,
  userAge,
  onClose,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Layer 1: Back Accent Card - Decalé 3px à gauche */}
        <div className="absolute inset-0 -left-[3px] top-[3px] rounded-[28px] bg-brand-dark border border-brand-main/80 pointer-events-none shadow-md" />

        {/* Layer 2: Front Glass Card */}
        <div className="relative bg-white border border-white/80 rounded-[28px] p-6 shadow-2xl space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-900">Âge minimum requis</p>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  Ce véhicule nécessite <strong>{vehicleMinimumAge} ans minimum</strong>.
                  {userAge !== null && (
                    <> Vous avez actuellement <strong>{userAge} ans</strong>.</>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarDays className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">Suggestion</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Découvrez nos véhicules éligibles pour votre tranche d'âge dans la recherche.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-12.5 rounded-full bg-brand-dark hover:bg-[#06291e] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/20 active:scale-[0.98] transition-all"
          >
            <span>Retour à la recherche</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
