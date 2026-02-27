'use client';

import React, { useState, useEffect } from 'react';
import { BadgeCheck, ShieldCheck, Star, Zap, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { KycSubmitForm } from '@/features/kyc/KycSubmitForm';

const STORAGE_KEY = 'autoloc_kyc_nudge';
const SIGNUP_KEY = 'autoloc_signup_at';
const EXPLORER_SEEN_KEY = 'autoloc_signup_explorer_seen';
const REMIND_MS = 3 * 24 * 60 * 60 * 1000;
const SIGNUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface NudgeState {
  dismissedAt: number | null;
  permanent: boolean;
}

function loadNudge(): NudgeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NudgeState;
  } catch {
    // noop
  }
  return { dismissedAt: null, permanent: false };
}

function saveNudge(state: NudgeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // noop
  }
}

type KycStatus = ProfileResponse['kycStatus'];

function useKycNudge(kycStatus: KycStatus) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shouldNudge =
      kycStatus === 'NON_VERIFIE' || kycStatus === undefined || kycStatus === 'REJETE';
    if (!shouldNudge) return;

    let signupAt: number | null = null;
    try {
      const raw = localStorage.getItem(SIGNUP_KEY);
      signupAt = raw ? Number(raw) : null;
    } catch {
      // noop
    }
    if (!signupAt || !Number.isFinite(signupAt)) return;
    if (Date.now() - signupAt > SIGNUP_WINDOW_MS) return;

    let explorerSeen = false;
    try {
      explorerSeen = localStorage.getItem(EXPLORER_SEEN_KEY) === '1';
    } catch {
      // noop
    }
    if (explorerSeen) return;

    try {
      localStorage.setItem(EXPLORER_SEEN_KEY, '1');
    } catch {
      // noop
    }

    const state = loadNudge();
    if (state.permanent) return;
    if (state.dismissedAt && Date.now() - state.dismissedAt < REMIND_MS) return;

    const timer = setTimeout(() => setOpen(true), 110000);
    return () => clearTimeout(timer);
  }, [kycStatus]);

  const dismiss = (permanent = false) => {
    setOpen(false);
    saveNudge({ dismissedAt: Date.now(), permanent });
  };

  return { open, dismiss };
}

export function KycNudgeModal({ kycStatus }: { kycStatus: KycStatus }) {
  const { open, dismiss } = useKycNudge(kycStatus);
  const isRejected = kycStatus === 'REJETE';
  const [step, setStep] = useState<'intro' | 'form'>('intro');

  useEffect(() => {
    if (!open) setStep('intro');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(false); }}>
      <DialogContent
        className={cn(
          'p-0 overflow-hidden gap-0',
          'bg-slate-950 border border-white/8 max-w-md w-full rounded-3xl',
          'shadow-2xl shadow-black/60',
          'max-h-[85vh] overflow-y-auto',
        )}
      >
        <button
          type="button"
          onClick={() => dismiss(false)}
          aria-label="Fermer"
          className={cn(
            'absolute top-4 right-4 z-20 w-8 h-8 rounded-full',
            'bg-white/8 border border-white/10',
            'flex items-center justify-center',
            'hover:bg-white/15 transition-colors',
          )}
        >
          <X className="w-4 h-4 text-white/50" strokeWidth={2} />
        </button>

        <div className="relative overflow-hidden px-7 pt-8 pb-6">
          <div
            className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{
              background: isRejected
                ? 'radial-gradient(circle, #f87171, transparent 70%)'
                : 'radial-gradient(circle, #34d399, transparent 70%)',
            }}
          />

          <div className="relative flex items-start gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border',
                isRejected
                  ? 'bg-red-400/10 border-red-400/20'
                  : 'bg-emerald-400/10 border-emerald-400/20',
              )}
            >
              {isRejected ? (
                <AlertTriangle className="w-6 h-6 text-red-400" strokeWidth={1.75} />
              ) : (
                <BadgeCheck className="w-6 h-6 text-emerald-400" strokeWidth={1.75} />
              )}
            </div>

            <div>
              <p
                className={cn(
                  'text-[10px] font-black uppercase tracking-[0.18em] mb-1.5',
                  isRejected ? 'text-red-400/70' : 'text-emerald-400/70',
                )}
              >
                {isRejected ? 'Action requise' : 'Étape importante'}
              </p>
              <h2 className="text-[19px] font-black text-white leading-tight">
                {isRejected ? 'Vérification refusée' : 'Vérifiez votre identité'}
              </h2>
              <p className="mt-1.5 text-[13px] text-white/45 leading-relaxed">
                {isRejected
                  ? 'Votre dossier a été refusé. Soumettez de nouveaux documents pour débloquer votre compte propriétaire.'
                  : 'Il ne vous reste qu\'une étape pour commencer à recevoir des réservations en tant qu\'hôte certifié.'}
              </p>
            </div>
          </div>
        </div>

        {!isRejected && (
          <div className="px-7 pb-5 space-y-2">
            {[
              { Icon: Zap, label: 'Débloquez la réception de réservations', color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { Icon: ShieldCheck, label: 'Badge \"Hôte certifié\" sur votre profil', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { Icon: Star, label: 'Meilleure visibilité dans les résultats', color: 'text-sky-400', bg: 'bg-sky-400/10' },
            ].map(({ Icon, label, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
                  <Icon className={cn('w-3.5 h-3.5', color)} strokeWidth={2} />
                </div>
                <span className="text-[12.5px] font-medium text-white/55">{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mx-7 h-px bg-white/8" />

        <div className="px-7 py-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setStep('form')}
            className={cn(
              'flex items-center justify-center gap-2 w-full rounded-2xl py-3.5',
              'text-[13px] font-black transition-all duration-200',
              isRejected
                ? 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20'
                : 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-xl shadow-emerald-500/20',
            )}
          >
            <BadgeCheck className="w-4 h-4" strokeWidth={2.5} />
            {isRejected ? 'Resoumettre mes documents' : 'Commencer la vérification'}
          </button>

          <button
            type="button"
            onClick={() => dismiss(false)}
            className="w-full rounded-2xl py-2.5 text-[12px] font-semibold text-white/25 hover:text-white/45 transition-colors"
          >
            Rappeler dans 3 jours
          </button>
        </div>

        {step === 'form' && (
          <div className="px-7 pb-7">
            <div className="rounded-2xl bg-white p-4">
              <KycSubmitForm initialStatus={kycStatus} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
