'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { completeProfile } from '../../../../lib/nestjs/auth';
import { ensureValidNestToken, syncWithNestJS } from '../../hooks/use-nest-token';
import { OnboardingInput } from '../schema';

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<Partial<OnboardingInput>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      const phone =
        (user.phone ?? '').replace('whatsapp:', '') ||
        ((user.user_metadata as Record<string, string>)?.telephone ?? '');

      setDefaults({
        prenom: (user.user_metadata as Record<string, string>)?.prenom ?? '',
        nom: (user.user_metadata as Record<string, string>)?.nom ?? '',
        telephone: phone,
      });
    });
  }, []);

  const submit = async (input: OnboardingInput) => {
    setLoading(true);
    setError(null);

    const { data } = await supabase.auth.getSession();
    const supaToken = data.session?.access_token ?? null;
    if (!supaToken) {
      setError('Session expirée, reconnecte-toi.');
      setLoading(false);
      return false;
    }

    try {
      let nestToken = await ensureValidNestToken();
      if (!nestToken) {
        const session = await syncWithNestJS(supaToken);
        nestToken = session.accessToken;
      }
      await completeProfile(nestToken, input);
      setLoading(false);
      return true;
    } catch (err) {
      setError('Une erreur est survenue');
      setLoading(false);
      return false;
    }
  };

  return { submit, loading, error, defaults };
}
