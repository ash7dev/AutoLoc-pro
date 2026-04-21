'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCw } from 'lucide-react';
import { otpSchema, OtpInput } from '../schema';
import { useOtp } from '../hooks/use-otp';
import { useAuthFlow } from '../../hooks/use-auth-flow';
import { cn } from '@/lib/utils';
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
  const { verifyOtp, resendOtp, loading, error, counter, canResend } = useOtp();
  const { redirectAfterAuth } = useAuthFlow();
  
  const slots = type === 'email' ? 8 : 6;
  const [otpValues, setOtpValues] = useState<string[]>(Array(slots).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '' }
  });

  // Synchronise le code fusionné avec react-hook-form
  useEffect(() => {
    setValue('code', otpValues.join(''), { shouldValidate: true });
  }, [otpValues, setValue]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    // Prendre le dernier caractère si on tape plusieurs trucs
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);

    // Focus suivant
    if (value && index < slots - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: OtpInput) => {
    const ok = await verifyOtp({ email, phone, type }, data.code);
    if (ok) {
      await redirectAfterAuth();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between gap-2 sm:gap-3">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-full h-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 transition-all outline-none",
                value 
                    ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "border-slate-100 bg-slate-50 text-slate-900 focus:border-slate-300 focus:bg-white",
                errors.code && "border-red-200 bg-red-50 text-red-600"
              )}
            />
          ))}
        </div>

        {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl text-center">
                {error}
            </div>
        )}

        <div className="space-y-3">
            <Button
                type="submit"
                disabled={loading || otpValues.some(v => v === '')}
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    'Confirmer le compte'
                )}
            </Button>

            <button
                type="button"
                onClick={() => resendOtp({ email, phone, type })}
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
