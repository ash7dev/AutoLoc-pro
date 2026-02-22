'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpInput } from '../schema';
import { useOtp } from '../hooks/use-otp';
import { useAuthFlow } from '../../hooks/use-auth-flow';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpInput) => {
    const ok = await verifyOtp({ email, phone, type }, data.code);
    if (ok) {
      await redirectAfterAuth();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Code OTP</label>
          <input
            type="text"
            maxLength={6}
            {...register('code')}
            className="w-full rounded border px-3 py-2 tracking-widest"
          />
          {errors.code && (
            <p className="text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => resendOtp({ email, phone, type })}
        disabled={!canResend || loading}
        className="w-full rounded border px-3 py-2 disabled:opacity-60"
      >
        {canResend ? 'Renvoyer le code' : `Renvoyer dans ${counter}s`}
      </button>
    </div>
  );
}
