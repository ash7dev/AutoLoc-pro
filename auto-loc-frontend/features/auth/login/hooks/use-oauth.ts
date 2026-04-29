import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { mapSupabaseError } from '../../utils/supabase-errors';

export function useOAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async (nextPath?: string | null) => {
    setLoading(true);
    setError(null);
    const redirectBase = window.location.origin;
    const callbackUrl = new URL('/api/auth/callback', redirectBase);
    if (nextPath && nextPath.startsWith('/')) {
      callbackUrl.searchParams.set('next', nextPath);
    }

    // Debug local
    // eslint-disable-next-line no-console
    console.log('[OAuth] origin', window.location.origin);
    // eslint-disable-next-line no-console
    console.log('[OAuth] redirectBase', redirectBase);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) setError(mapSupabaseError(error.message));
    setLoading(false);
  };

  return { signInWithGoogle, loading, error };
}
