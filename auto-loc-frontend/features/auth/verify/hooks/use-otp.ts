import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { mapSupabaseError } from '../../utils/supabase-errors';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counter, setCounter] = useState(120);

  useEffect(() => {
    if (counter <= 0) return;
    const id = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [counter]);

  const canResend = useMemo(() => counter <= 0, [counter]);

  const verifyOtp = async (target: { email?: string; phone?: string; type: 'email' | 'phone' }, token: string) => {
    setLoading(true);
    setError(null);

    if (target.type === 'phone') {
      try {
        const res = await fetch(`${API_BASE}/auth/phone-login/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: target.phone, code: token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Le code saisi est incorrect.');
          setLoading(false);
          return { session: null, error: data.message || 'error' };
        }
        setLoading(false);
        // On renvoie un objet compatible "session" pour OtpForm
        return { 
          session: { 
            access_token: data.accessToken, 
            refresh_token: data.refreshToken,
            user: data.profile,
            active_role: data.activeRole,
          }, 
          error: null 
        };
      } catch (err) {
        setError('Connexion impossible. Vérifiez votre réseau et réessayez.');
        setLoading(false);
        return { session: null, error: 'connection_error' };
      }
    } else {
      const payload = { email: target.email ?? '', token, type: 'signup' as const };
      const { data, error } = await supabase.auth.verifyOtp(payload);
      if (error) {
        setError(mapSupabaseError(error.message));
      }
      setLoading(false);
      return { session: data.session, error };
    }
  };

  const resendOtp = async (target: { email?: string; phone?: string; type: 'email' | 'phone' }) => {
    setLoading(true);
    setError(null);

    if (target.type === 'phone') {
      try {
        const res = await fetch(`${API_BASE}/auth/phone-login/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: target.phone }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Impossible d’envoyer un nouveau code pour le moment.');
          setLoading(false);
          return false;
        }
        setCounter(120);
        setLoading(false);
        return true;
      } catch (err) {
        setError('Connexion impossible. Vérifiez votre réseau et réessayez.');
        setLoading(false);
        return false;
      }
    } else {
      const payload = { type: 'signup' as const, email: target.email ?? '' };
      const { error } = await supabase.auth.resend(payload);
      if (error) {
        setError(mapSupabaseError(error.message));
      } else {
        setCounter(120);
      }
      setLoading(false);
      return !error;
    }
  };

  return { verifyOtp, resendOtp, loading, error, counter, canResend };
}
