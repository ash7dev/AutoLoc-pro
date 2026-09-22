'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';

interface PublishProgressModalProps {
  visible: boolean;
  progress: number;
  statusText: string;
  isSuccess?: boolean;
  onFinish?: () => void;
}

export const PublishProgressModal: React.FC<PublishProgressModalProps> = ({
  visible,
  progress,
  statusText,
  isSuccess = false,
  onFinish,
}) => {
  if (!visible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04150F]/85 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#059669]/40 bg-[#062017] p-8 shadow-2xl text-center text-white"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#10B981]/20 blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#4ADE80]/30 bg-[#041912] shadow-inner">
            {isSuccess ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle2 className="h-10 w-10 text-[#4ADE80]" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <Loader2 className="h-10 w-10 animate-spin text-[#4ADE80]" strokeWidth={2.5} />
            )}
          </div>

          <h3 className="font-display text-xl font-bold tracking-tight text-white mb-2">
            {isSuccess ? 'Annonce Publiée !' : 'Publication en cours...'}
          </h3>

          <p className="text-sm text-emerald-200/80 mb-6 leading-relaxed min-h-[44px]">
            {statusText}
          </p>

          {/* Progress Bar Container */}
          <div className="mb-6 space-y-2">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#4ADE80]"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-emerald-400/70 font-medium">
              <span>{isSuccess ? 'Finalisé' : 'Progression'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Finish Button */}
          {isSuccess && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onFinish}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] py-3.5 px-6 font-display font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              Accéder à mon annonce
            </motion.button>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-200/60">
            <ShieldCheck className="h-4 w-4 text-[#4ADE80]" />
            <span>Sécurité & données vérifiées par AutoLoc</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
