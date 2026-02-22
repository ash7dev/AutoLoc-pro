import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { mapSupabaseError } from '../../utils/supabase-errors';

export function useOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(60);

  useEffect(() => {
    if (counter <= 0) return;
    const id = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [counter]);

  const canResend = useMemo(() => counter <= 0, [counter]);

  const verifyOtp = async (target: { email?: string; phone?: string; type: 'email' | 'phone' }, token: string) => {
    setLoading(true);
    setError(null);

    const payload =
      target.type === 'phone'
        ? { phone: target.phone ?? '', token, type: 'sms' as const }
        : { email: target.email ?? '', token, type: 'email' as const };

    const { error } = await supabase.auth.verifyOtp(payload);

    if (error) {
      setError(mapSupabaseError(error.message));
    }

    setLoading(false);
    return !error;
  };

  const resendOtp = async (target: { email?: string; phone?: string; type: 'email' | 'phone' }) => {
    setLoading(true);
    setError(null);

    const payload =
      target.type === 'phone'
        ? { type: 'sms' as const, phone: target.phone ?? '' }
        : { type: 'signup' as const, email: target.email ?? '' };

    const { error } = await supabase.auth.resend(payload);

    if (error) {
      setError(mapSupabaseError(error.message));
    } else {
      setCounter(60);
    }

    setLoading(false);
    return !error;
  };

  return { verifyOtp, resendOtp, loading, error, counter, canResend };
}
