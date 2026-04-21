import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { RegisterInput } from '../schema';
import { mapSupabaseError } from '../../utils/supabase-errors';
import { completeProfile, checkAvailability } from '../../../../lib/nestjs/auth';
import { syncWithNestJS } from '../../hooks/use-nest-token';

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

    // 1. Pré-vérification pour bloquer les doublons proprement
    const isAvailable = await checkIsAvailable(input.email, input.telephone);
    if (!isAvailable) {
      setLoading(false);
      return { success: false, unconfirmed: false, requiresVerification: false };
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

    if (supaError) {
      setError(mapSupabaseError(supaError.message));
      setLoading(false);
      return { success: false, unconfirmed: false, requiresVerification: false };
    }

    // Cas particulier : email déjà dans Supabase mais pas encore confirmé.
    if (data.user && !data.session && (data.user.identities?.length ?? 0) === 0) {
      // Déclencher le renvoi d'OTP pour débloquer l'utilisateur
      await supabase.auth.resend({
          type: 'signup',
          email: input.email,
      });
      setLoading(false);
      return { success: false, unconfirmed: true, requiresVerification: true };
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
