'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Smartphone, ShieldCheck, ArrowRight, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react';

interface OtpStepProps {
  telephone: string;
  onVerify: (code: string) => void;
  onResend: (channel?: 'whatsapp' | 'sms' | 'auto') => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
  slots?: number;
}

export const OtpStep: React.FC<OtpStepProps> = ({
  telephone,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  error = null,
  slots = 6,
}) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(slots).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isSubmittingRef = useRef(false);

  // Timer pour le renvoi de code (60s)
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Focus automatique sur le premier champ au montage
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = (channel: 'whatsapp' | 'sms' | 'auto' = 'auto') => {
    if (isLoading || isResending) return;
    setIsResending(true);
    onResend(channel);
    setCountdown(60);
    setOtpValues(Array(slots).fill(''));
    setTimeout(() => {
      setIsResending(false);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 600);
  };

  const submitCode = useCallback(
    (codeToSubmit: string) => {
      if (isSubmittingRef.current || isLoading) return;
      if (codeToSubmit.length !== slots) return;

      isSubmittingRef.current = true;
      onVerify(codeToSubmit);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000);
    },
    [slots, isLoading, onVerify]
  );

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, slots);
      if (digits.length >= 1) {
        const newValues = Array(slots).fill('');
        for (let i = 0; i < digits.length && i < slots; i++) {
          newValues[i] = digits[i];
        }
        setOtpValues(newValues);

        const nextFocus = Math.min(digits.length, slots - 1);
        inputRefs.current[nextFocus]?.focus();

        if (digits.length === slots) {
          submitCode(digits);
        }
        return;
      }
    }

    if (!/^\d*$/.test(value)) return;

    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    const fullCode = newValues.join('');

    if (value && index < slots - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (fullCode.length === slots && !newValues.some((v) => v === '')) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, slots);
    if (!pasted) return;

    const newValues = Array(slots).fill('');
    for (let i = 0; i < pasted.length && i < slots; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);

    const nextFocus = Math.min(pasted.length, slots - 1);
    inputRefs.current[nextFocus]?.focus();

    if (pasted.length === slots) {
      submitCode(pasted);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpValues.join('');
    if (fullCode.length === slots) {
      submitCode(fullCode);
    }
  };

  const isFilled = !otpValues.some((v) => v === '');

  return (
    <div className="space-y-4 text-left animate-in fade-in duration-200">
      {/* Navigation Retour */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Modifier le numéro</span>
        </button>

        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          ÉTAPE 2/2
        </span>
      </div>

      {/* Header Carte OTP */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center shadow-sm">
          <Smartphone className="w-7 h-7 text-emerald-600 stroke-[2.2]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-emerald-600 text-[9px] font-medium tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>VÉRIFICATION SMS / WHATSAPP</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-normal text-brand-dark font-fraunces tracking-tight">
            Code de <span className="italic text-emerald-700">confirmation.</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Saisissez le code à {slots} chiffres envoyé au{' '}
            <span className="font-medium text-emerald-600">{telephone || '+221 77 000 00 00'}</span>
          </p>
        </div>
      </div>

      {/* Bannière Erreur */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-xs font-medium p-3 rounded-xl shadow-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire OTP 6 Cases */}
      <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {otpValues.map((value, index) => {
            const isFocused = otpValues.findIndex((v) => v === '') === index;
            const hasValue = value.length > 0;

            return (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-9 h-11 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-bold rounded-xl border transition-all outline-none ${
                  hasValue
                    ? 'border-[#059669] bg-emerald-50/40 text-brand-dark shadow-sm'
                    : isFocused
                    ? 'border-[#059669] bg-white ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-[#059669]'
                } ${error ? 'border-red-300 bg-red-50 text-red-600' : ''}`}
              />
            );
          })}
        </div>

        {/* Bouton Valider */}
        <button
          type="submit"
          disabled={isLoading || !isFilled}
          className="w-full h-[50px] rounded-full bg-brand-dark hover:bg-[#06291e] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-dark/20 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Valider le code</span>
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ml-1">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </>
          )}
        </button>
      </form>

      {/* Renvoi de code */}
      <div className="mt-4 pt-3 pb-1 border-t border-slate-100 flex flex-col items-center text-center space-y-2">
        {countdown > 0 ? (
          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              Renvoyer un nouveau code dans <span className="font-medium text-emerald-600">{countdown}s</span>
            </p>
            <button
              type="button"
              onClick={() => handleResend('sms')}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Recevoir par SMS</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleResend('auto')}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Envoi...' : 'Renvoyer par WhatsApp'}</span>
            </button>

            <span className="text-slate-300">•</span>

            <button
              type="button"
              onClick={() => handleResend('sms')}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-emerald-600 hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Par SMS</span>
            </button>
          </div>
        )}
      </div>

      {/* Signature Sécurité */}
      <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Connexion Sécurisée AutoLoc</span>
      </div>
    </div>
  );
};
