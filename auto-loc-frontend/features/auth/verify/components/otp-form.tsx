'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { useOtp } from '../hooks/use-otp';
import { useAuthFlow } from '../../hooks/use-auth-flow';
import { clearPendingOtp } from '../../register/hooks/use-register';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function OtpForm({
  email,
  phone,
  type,
}: {
  email?: string;
  phone?: string;
  type: 'email' | 'phone';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp, loading, error, counter, canResend } = useOtp();
  const { redirectAfterAuth } = useAuthFlow();

  const next =
    searchParams.get('next') ||
    searchParams.get('redirect') ||
    searchParams.get('redirectTo') ||
    searchParams.get('callbackUrl');

  const slots = 6;
  const [otpValues, setOtpValues] = useState<string[]>(Array(slots).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isSubmittingRef = useRef(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);

  // Prefetch des destinations probables pour gagner du temps
  useEffect(() => {
    router.prefetch('/dashboard/owner');
    router.prefetch('/dashboard/admin');
    router.prefetch('/');
  }, [router]);

  // ── Auto-submit dès que tous les champs sont remplis ──
  const submitCode = useCallback(async (code: string) => {
    if (isSubmittingRef.current || syncing) return;
    if (code.length !== slots) return;

    isSubmittingRef.current = true;
    
    // On lance la vérification
    const { session, error: verifyError } = await verifyOtp({ email, phone, type }, code);
    
    if (!verifyError && session) {
      setSyncing(true);
      clearPendingOtp(); 

      try {
        // Pour le flow téléphone, on a déjà tout dans session.
        // On passe les tokens à redirectAfterAuth qui s'occupera du reste de manière optimisée.
        const success = await redirectAfterAuth(
          type === 'phone' ? null : session,
          type === 'phone' ? {
            accessToken: (session as any).access_token,
            refreshToken: (session as any).refresh_token,
            activeRole: (session as any).active_role || 'LOCATAIRE',
            profile: (session as any).profile
          } : undefined,
          next,
        );

        if (success === false) {
          setSyncError("Connexion impossible. Réessayez.");
          setSyncing(false);
          isSubmittingRef.current = false;
        }
        // Si success, Next.js gère la redirection, on ne reset pas syncing pour éviter un flash UI
      } catch (err) {
        setSyncError("Erreur de synchronisation.");
        setSyncing(false);
        isSubmittingRef.current = false;
      }
    } else {
      // Libérer le lock si le code est expiré pour permettre une nouvelle inscription
      if (verifyError && typeof verifyError === 'string' && /expir/i.test(verifyError)) {
        clearPendingOtp();
      }
      isSubmittingRef.current = false;
    }
  }, [email, phone, type, slots, verifyOtp, redirectAfterAuth, syncing, router]);

  const handleInputChange = (index: number, value: string) => {
    // Gérer le collage d'un code complet
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, slots);
      if (digits.length >= 2) {
        const newValues = Array(slots).fill('');
        for (let i = 0; i < digits.length && i < slots; i++) {
          newValues[i] = digits[i];
        }
        setOtpValues(newValues);

        // Focus sur le dernier champ rempli ou le suivant
        const nextFocus = Math.min(digits.length, slots - 1);
        inputRefs.current[nextFocus]?.focus();

        // Auto-submit si code complet
        if (digits.length === slots) {
          submitCode(digits);
        }
        return;
      }
    }

    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);

    if (value && index < slots - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit si c'était le dernier chiffre
    const code = newOtpValues.join('');
    if (code.length === slots && !newOtpValues.some(v => v === '')) {
      submitCode(code);
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpValues.join('');
    if (code.length === slots) {
      submitCode(code);
    }
  };

  const isFilled = !otpValues.some(v => v === '');

  return (
    <div className="space-y-6">
      <form onSubmit={handleManualSubmit} className="space-y-8">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                "w-full h-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 transition-all outline-none",
                value
                  ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "border-slate-100 bg-slate-50 text-slate-900 focus:border-slate-300 focus:bg-white",
                error && "border-red-200 bg-red-50 text-red-600"
              )}
            />
          ))}
        </div>

        {(error || syncError) && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl text-center">
            {syncError || error}
          </div>
        )}

        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-800">
          Seul le dernier code recu est valide.
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={loading || syncing || !isFilled}
            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {loading || syncing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {syncing ? 'Synchronisation...' : 'Vérification...'}
              </div>
            ) : (
              'Confirmer le compte'
            )}
          </Button>


          <button
            type="button"
            onClick={() => {
              if (!canResend || loading) return;
              const confirmed = window.confirm(
                'Attention : renvoyer un code invalide automatiquement le code précédent.\n\n' +
                'Avez-vous vérifié vos spams / courriers indésirables ?\n\n' +
                'Cliquez OK pour recevoir un nouveau code.'
              );
              if (confirmed) resendOtp({ email, phone, type });
            }}
            disabled={!canResend || loading}
            className={cn(
              "w-full py-2 flex items-center justify-center gap-2 text-[12px] font-bold transition-colors",
              canResend ? "text-emerald-600 hover:text-emerald-700 underline underline-offset-4" : "text-slate-300 pointer-events-none"
            )}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {canResend ? 'Renvoyer un nouveau code' : `Renvoyer dans ${counter}s`}
          </button>
        </div>
      </form>
    </div>
  );
}
