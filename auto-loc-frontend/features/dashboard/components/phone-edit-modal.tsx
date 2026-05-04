'use client';

import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, Loader2, Phone, ArrowRight, RotateCcw, ChevronLeft } from 'lucide-react';
import { ModalShell } from '@/features/shared/ModalShell';
import { PhoneInput } from '@/components/ui/phone-input';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { ApiError } from '@/lib/nestjs/api-client';
import { cn } from '@/lib/utils';

type Stage = 'phone' | 'otp' | 'success';

const RESEND_DELAY = 60; // secondes

// ── OTP input box ─────────────────────────────────────────────────────────────
function OtpInput({
  values,
  onChange,
  onKeyDown,
  onPaste,
  inputRefs,
  error,
  disabled,
}: {
  values: string[];
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  error: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onPaste={onPaste}
          autoFocus={i === 0}
          className={cn(
            'w-full h-13 aspect-square text-center text-[22px] font-black rounded-2xl border-2 outline-none transition-all',
            'min-w-0 max-w-[52px]',
            disabled && 'opacity-50 cursor-not-allowed',
            error
              ? 'border-red-300 bg-red-50 text-red-600'
              : val
                ? 'border-emerald-400 bg-emerald-50/40 text-emerald-700 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
                : 'border-slate-150 bg-slate-50 text-slate-900 focus:border-slate-300 focus:bg-white',
          )}
        />
      ))}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────
export function PhoneEditModal({
  currentPhone,
  onClose,
  onSuccess,
}: {
  currentPhone: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { authFetch } = useAuthFetch();

  const [stage, setStage] = useState<Stage>('phone');
  const [phone, setPhone] = useState(currentPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startResendTimer() {
    setResendCountdown(RESEND_DELAY);
    timerRef.current = setInterval(() => {
      setResendCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  // ── Stage 1 : envoyer le nouveau numéro ───────────────────────────
  async function handleSendOtp() {
    const normalized = phone.replace(/\s/g, '');
    if (!normalized || normalized.length < 8) {
      setError('Saisissez un numéro de téléphone valide.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch('/auth/phone/update', {
        method: 'POST',
        body: { telephone: normalized },
      });
      setStage('otp');
      startResendTimer();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.message || "Impossible d'envoyer le code.")
          : 'Connexion impossible. Réessayez.',
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Renvoi OTP ───────────────────────────────────────────────────
  async function handleResend() {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch('/auth/phone/send-otp', { method: 'POST' });
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
      startResendTimer();
    } catch (err) {
      setError(err instanceof ApiError ? (err.message || 'Erreur lors du renvoi.') : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  }

  // ── Stage 2 : vérifier le code OTP ───────────────────────────────
  async function handleVerifyOtp(code: string) {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch('/auth/phone/verify-otp', {
        method: 'POST',
        body: { code },
      });
      setStage('success');
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.message || 'Code incorrect ou expiré.')
          : 'Connexion impossible. Réessayez.',
      );
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handlers ────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    // Gestion du paste multi-chiffres dans une seule box
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const next = Array(6).fill('');
      for (let i = 0; i < digits.length; i++) next[i] = digits[i];
      setOtpValues(next);
      const focus = Math.min(digits.length, 5);
      inputRefs.current[focus]?.focus();
      if (digits.length === 6) handleVerifyOtp(digits);
      return;
    }
    if (!/^\d*$/.test(value)) return;
    const next = [...otpValues];
    next[index] = value.slice(-1);
    setOtpValues(next);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    const full = next.join('');
    if (full.length === 6 && !next.some(v => v === '')) handleVerifyOtp(full);
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = Array(6).fill('');
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setOtpValues(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    if (digits.length === 6) handleVerifyOtp(digits);
  }

  const isFilled = otpValues.every(v => v !== '');

  // ─────────────────────────────────────────────────────────────────
  return (
    <ModalShell
      title="Modifier le numéro"
      subtitle="Entrez votre nouveau numéro et vérifiez-le par SMS / WhatsApp."
      tag="Auto Loc · Sécurité"
      onClose={onClose}
      contentClassName="px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-6 overflow-y-auto"
    >

      {/* ── Success ── */}
      {stage === 'success' && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[15px] font-black text-slate-900">Numéro vérifié !</p>
            <p className="text-[12.5px] text-slate-400 mt-1">Votre nouveau numéro est actif.</p>
          </div>
        </div>
      )}

      {/* ── Stage phone ── */}
      {stage === 'phone' && (
        <div className="space-y-5">

          {/* Info */}
          <div className="flex items-start gap-3 px-3.5 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
            </div>
            <p className="text-[12.5px] text-slate-500 leading-relaxed pt-1">
              Un code de vérification sera envoyé par <strong className="text-slate-700">SMS ou WhatsApp</strong> sur ce numéro.
            </p>
          </div>

          {/* Phone input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
              Nouveau numéro
            </label>
            <PhoneInput
              value={phone}
              onChange={v => { setPhone(v); setError(null); }}
              disabled={loading}
              error={Boolean(error)}
            />
          </div>

          {error && (
            <p className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-[12px] font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading || phone.replace(/\s/g, '').length < 8}
            className={cn(
              'w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200',
              !loading && phone.replace(/\s/g, '').length >= 8
                ? 'bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            }
            {loading ? 'Envoi en cours…' : 'Envoyer le code'}
          </button>
        </div>
      )}

      {/* ── Stage OTP ── */}
      {stage === 'otp' && (
        <div className="space-y-5">

          {/* Numéro cible */}
          <div className="text-center space-y-0.5">
            <p className="text-[13px] text-slate-500">Code envoyé par SMS / WhatsApp au</p>
            <p className="text-[16px] font-black text-slate-900 tracking-wide">{phone}</p>
          </div>

          {/* OTP boxes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-400">
              Code à 6 chiffres
            </label>
            <OtpInput
              values={otpValues}
              onChange={handleOtpChange}
              onKeyDown={handleOtpKeyDown}
              onPaste={handleOtpPaste}
              inputRefs={inputRefs}
              error={Boolean(error)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-[12px] font-semibold text-red-600">
              {error}
            </p>
          )}

          {/* Verify button */}
          <button
            type="button"
            onClick={() => handleVerifyOtp(otpValues.join(''))}
            disabled={loading || !isFilled}
            className={cn(
              'w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200',
              isFilled && !loading
                ? 'bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
            }
            {loading ? 'Vérification…' : 'Vérifier le code'}
          </button>

          {/* Resend + back */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { setStage('phone'); setOtpValues(Array(6).fill('')); setError(null); }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
              Modifier le numéro
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0 || loading}
              className={cn(
                'flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                resendCountdown > 0 || loading
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-emerald-600 hover:text-emerald-700',
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
              {resendCountdown > 0 ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer le code'}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
