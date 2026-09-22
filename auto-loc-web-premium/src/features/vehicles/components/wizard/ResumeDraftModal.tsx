'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, RotateCcw, PlusCircle, Car } from 'lucide-react';
import { VehicleWizardDraft } from '../../stores/useVehicleDraftStore';

interface ResumeDraftModalProps {
  visible: boolean;
  draft: VehicleWizardDraft | null;
  onResume: () => void;
  onStartFresh: () => void;
}

export const ResumeDraftModal: React.FC<ResumeDraftModalProps> = ({
  visible,
  draft,
  onResume,
  onStartFresh,
}) => {
  if (!visible || !draft) return null;

  const vehicleName = [draft.step1?.marque, draft.step1?.modele]
    .filter(Boolean)
    .join(' ') || 'Véhicule sans nom';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04150F]/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#062017] p-6 shadow-2xl text-white"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#059669]/20 border border-[#4ADE80]/30 text-[#4ADE80]">
              <Bookmark className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Brouillon conservé</h3>
              <p className="text-xs text-emerald-200/70">Vous avez un enregistrement en cours de saisie</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Car className="h-4 w-4 text-[#4ADE80]" />
              <span>{vehicleName}</span>
            </div>
            <p className="text-xs text-slate-300">
              Étape sauvegardée : <strong className="text-white">Étape {draft.currentStep} sur 7</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onResume}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] py-3 px-4 font-display font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Reprendre le brouillon
            </button>
            <button
              type="button"
              onClick={onStartFresh}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 px-4 text-xs font-semibold text-slate-300 hover:bg-white/15 active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Recommencer à zéro
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
