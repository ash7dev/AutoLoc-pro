import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { mapSupabaseError } from '../../utils/supabase-errors';

export function useOAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const redirectBase = window.location.origin;

    // Debug local
    // eslint-disable-next-line no-console
    console.log('[OAuth] origin', window.location.origin);
    // eslint-disable-next-line no-console
    console.log('[OAuth] redirectBase', redirectBase);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectBase}/api/auth/callback`,
      },
    });

    if (error) setError(mapSupabaseError(error.message));
    setLoading(false);
  };

  return { signInWithGoogle, loading, error };
}
