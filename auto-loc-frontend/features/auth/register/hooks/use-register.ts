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

    // 1. Pré-vérification via NOTRE base de données (Source de vérité)
    try {
      const res = await checkAvailability({ email: input.email, phone: input.telephone });
      
      // Si l'utilisateur existe déjà COMPLÈTEMENT dans notre base
      if (!res.available && res.hasUtilisateur) {
        setError(res.message ?? 'Ce compte existe déjà. Veuillez vous connecter.');
        setLoading(false);
        return { success: false, unconfirmed: false, requiresVerification: false };
      }

      // Si l'utilisateur existe dans notre Profile mais sans Utilisateur (Onboarding interrompu)
      if (!res.available && !res.hasUtilisateur) {
        console.log('[Register] Compte partiel détecté, redirection vers vérification/onboarding');
        // On tente quand même un resend au cas où l'email n'est pas confirmé côté Supabase
        await supabase.auth.resend({ type: 'signup', email: input.email });
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

    // Cas spécifique : Utilisateur existe déjà dans Supabase mais n'est pas encore confirmé.
    // Si supaError dit "already registered", on déclenche le resend pour "toujours avoir un code".
    const isAlreadyRegistered = supaError?.message?.includes('already registered');

    if (isAlreadyRegistered) {
      console.log('[Register] User already exists in Supabase. Triggering resend...');
      const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: input.email,
      });

      if (resendError) {
        setError(mapSupabaseError(resendError.message));
        setLoading(false);
        return { success: false, unconfirmed: false, requiresVerification: false };
      }

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
