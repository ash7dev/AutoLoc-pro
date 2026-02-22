import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { RegisterInput } from '../schema';
import { mapSupabaseError } from '../../utils/supabase-errors';
import { completeProfile } from '../../../../lib/nestjs/auth';
import { syncWithNestJS } from '../../hooks/use-nest-token';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (input: RegisterInput) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
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

    if (error) {
      setError(mapSupabaseError(error.message));
    }

    const hasFullProfileInput = Boolean(
      input.prenom && input.prenom.trim() &&
      input.nom && input.nom.trim() &&
      input.telephone && input.telephone.trim(),
    );

    const supaToken = data.session?.access_token ?? null;
    if (!error && supaToken && hasFullProfileInput) {
      try {
        const session = await syncWithNestJS(supaToken);
        await completeProfile(session.accessToken, {
          prenom: input.prenom as string,
          nom: input.nom as string,
          telephone: input.telephone as string,
        });
      } catch (err) {
        // Non bloquant: l'onboarding pourra compléter plus tard
        setError('Profil partiellement enregistré. Tu pourras compléter plus tard.');
      }
    }

    setLoading(false);
    return !error;
  };

  return { signUp, loading, error };
}
