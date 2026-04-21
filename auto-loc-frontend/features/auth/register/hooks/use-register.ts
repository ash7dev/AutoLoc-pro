import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { RegisterInput } from '../schema';
import { mapSupabaseError } from '../../utils/supabase-errors';
import { completeProfile, checkAvailability } from '../../../../lib/nestjs/auth';
import { syncWithNestJS } from '../../hooks/use-nest-token';

const PENDING_OTP_KEY = 'autoloc:pending_otp';
const OTP_VALIDITY_MS = 55 * 60 * 1000; // 55 minutes (< TTL Supabase 3600s)

interface PendingOtp {
  email: string;
  sentAt: number;
}

/** Sauvegarde qu'un code a été envoyé pour cet email. */
function savePendingOtp(email: string) {
  try {
    const payload: PendingOtp = { email: email.toLowerCase().trim(), sentAt: Date.now() };
    sessionStorage.setItem(PENDING_OTP_KEY, JSON.stringify(payload));
  } catch { /* sessionStorage indisponible */ }
}

/** Retourne true si un code non expiré a déjà été envoyé pour cet email. */
function hasPendingOtp(email: string): boolean {
  try {
    const raw = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!raw) return false;
    const { email: savedEmail, sentAt } = JSON.parse(raw) as PendingOtp;
    return (
      savedEmail === email.toLowerCase().trim() &&
      Date.now() - sentAt < OTP_VALIDITY_MS
    );
  } catch {
    return false;
  }
}

/** Supprime l'entrée (après vérification réussie ou changement d'email). */
export function clearPendingOtp() {
  try { sessionStorage.removeItem(PENDING_OTP_KEY); } catch { /* noop */ }
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkIsAvailable = async (email: string, phone: string) => {
    try {
      const res = await checkAvailability({ email, phone });
      if (!res.available) {
        setError(res.message ?? 'Email ou téléphone déjà utilisé');
        return false;
      }
      return true;
    } catch {
      return true; // En cas d'erreur API check, on laisse Supabase gérer
    }
  };

  const signUp = async (input: RegisterInput) => {
    setLoading(true);
    setError(null);

    // ── GUARD : si un code a déjà été envoyé pour cet email et n'est pas encore
    // expiré, on redirige SANS appeler signUp() à nouveau.
    // Chaque appel supplémentaire à signUp() génère un NOUVEAU code Supabase et
    // invalide IMMÉDIATEMENT le code précédent — même s'il vient d'être reçu.
    if (hasPendingOtp(input.email)) {
      console.log('[Register] Code déjà envoyé pour cet email, redirection vers vérification sans re-signUp');
      setLoading(false);
      return { success: false, unconfirmed: true, requiresVerification: true };
    }

    // 1. Pré-vérification via NOTRE base de données (Source de vérité)
    try {
      const res = await checkAvailability({ email: input.email, phone: input.telephone });
      
      // Si l'utilisateur existe déjà COMPLÈTEMENT dans notre base
      if (!res.available && res.hasUtilisateur) {
        setError(res.message ?? 'Ce compte existe déjà. Veuillez vous connecter.');
        setLoading(false);
        return { success: false, unconfirmed: false, requiresVerification: false };
      }

      // Si l'utilisateur existe dans notre Profile mais sans Utilisateur (compte partiel),
      // on l'envoie vers l'écran de vérification sans invalider un éventuel code déjà reçu.
      if (!res.available && !res.hasUtilisateur) {
        console.log('[Register] Compte partiel détecté, redirection vers vérification');
        setLoading(false);
        return { success: false, unconfirmed: true, requiresVerification: true };
      }
    } catch (err) {
      console.error('[Register] Availability check failed, continuing with Supabase...', err);
    }

    // 2. Sign up Supabase
    const { data, error: supaError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          prenom: input.prenom,
          nom: input.nom,
          telephone: input.telephone,
        },
      },
    });

    // Cas spécifique : utilisateur déjà présent dans Supabase mais non confirmé.
    // On redirige vers la vérification sans renvoyer automatiquement un nouveau code,
    // pour éviter d'invalider l'OTP potentiellement déjà reçu.
    const isAlreadyRegistered = supaError?.message?.includes('already registered');

    if (isAlreadyRegistered) {
      console.log('[Register] User already exists in Supabase. Redirecting to verify without resend.');
      setLoading(false);
      return { success: false, unconfirmed: true, requiresVerification: true };
    }

    // Si on a une autre erreur, on l'affiche
    if (supaError) {
      setError(mapSupabaseError(supaError.message));
      setLoading(false);
      return { success: false, unconfirmed: false, requiresVerification: false };
    }

    // Ici, signUp a réussi et a envoyé un code (ou a connecté l'utilisateur).
    // On ne fait PAS de resend ici pour éviter d'invalider le code qui vient d'être envoyé.

    // ── VERROU : marquer cet email comme ayant un code en attente.
    // Tout nouvel appel à signUp() pour cet email dans les 55 prochaines minutes
    // sera bloqué par le guard hasPendingOtp() en début de fonction.
    if (!data.session?.user) {
      savePendingOtp(input.email);
    }

    // Si on a déjà une session (email confirmation OFF ou auto-confirm activé), on synchronise.
    if (data.session?.user) {
      try {
        const supaToken = data.session.access_token;
        await syncWithNestJS(supaToken);
        await completeProfile(supaToken, {
          prenom: input.prenom,
          nom: input.nom,
          telephone: input.telephone,
        });
      } catch (err) {
        console.error('[Register] Post-signup sync failed', err);
      }
    }

    setLoading(false);
    return {
      success: true,
      unconfirmed: false,
      requiresVerification: !data.session?.user,
    };
  };

  return { signUp, loading, error };
}
