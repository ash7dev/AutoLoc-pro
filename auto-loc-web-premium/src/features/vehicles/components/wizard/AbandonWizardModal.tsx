'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Save, Trash2, ArrowLeft } from 'lucide-react';

interface AbandonWizardModalProps {
  visible: boolean;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onContinue: () => void;
}

export const AbandonWizardModal: React.FC<AbandonWizardModalProps> = ({
  visible,
  onSaveAndExit,
  onDiscardAndExit,
  onContinue,
}) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04150F]/80 p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#062017] p-6 shadow-2xl text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">Enregistrer et quitter ?</h3>
              <p className="text-xs text-slate-300">Votre annonce sera conservée dans vos brouillons.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-6">
            <button
              type="button"
              onClick={onSaveAndExit}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] py-3.5 px-4 font-display font-bold text-white shadow-md hover:brightness-110 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              Enregistrer le brouillon et quitter
            </button>
            <button
              type="button"
              onClick={onDiscardAndExit}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 px-4 text-xs font-semibold text-red-300 hover:bg-red-500/20 active:scale-[0.98]"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer le brouillon et quitter
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-xs font-medium text-slate-400 hover:bg-white/10 active:scale-[0.98]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Continuer l'édition
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
