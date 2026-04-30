'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useLoginOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Envoie un OTP au numéro via le backend (WhatsApp + SMS fallback).
   * Retourne true si le code a été envoyé avec succès.
   */
  const sendCode = async (phone: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/phone-login/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || 'Impossible d’envoyer le code de connexion.';
        console.error('[Login OTP] Backend error:', msg);
        setError(msg);
        setLoading(false);
        return false;
      }

      setLoading(false);
      return true;
    } catch (err) {
      console.error('[Login OTP] Network error:', err);
      setError('Connexion impossible. Vérifiez votre réseau et réessayez.');
      setLoading(false);
      return false;
    }
  };

  /**
   * Vérifie le code OTP et retourne les tokens JWT si valide.
   */
  const verifyCode = async (phone: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/phone-login/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.message || 'Le code saisi est incorrect.';
        setError(msg);
        setLoading(false);
        return null;
      }

      setLoading(false);
      return data as {
        accessToken: string;
        refreshToken: string;
        activeRole: string;
        profile: unknown;
      };
    } catch (err) {
      console.error('[Login OTP] Verify error:', err);
      setError('Connexion impossible. Vérifiez votre réseau et réessayez.');
      setLoading(false);
      return null;
    }
  };

  return { sendCode, verifyCode, loading, error, setError };
}
