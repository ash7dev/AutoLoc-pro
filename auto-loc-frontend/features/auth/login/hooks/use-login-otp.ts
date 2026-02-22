import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { mapSupabaseError } from '../../utils/supabase-errors';

export function useLoginOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async (phone: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: false },
    });

    if (error) setError(mapSupabaseError(error.message));
    setLoading(false);
    return !error;
  };

  return { sendCode, loading, error };
}
