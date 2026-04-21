import { useState } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { LoginInput } from '../schema';
import { mapSupabaseError } from '../../utils/supabase-errors';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (input: LoginInput) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      const isUnconfirmed = error.message.toLowerCase().includes('email not confirmed');
      
      if (isUnconfirmed) {
        setLoading(false);
        return { success: false, unconfirmed: true };
      }

      setError(mapSupabaseError(error.message));
      setLoading(false);
      return { success: false, unconfirmed: false };
    }

    setLoading(false);
    return { success: true, unconfirmed: false };
  };

  return { signIn, loading, error };
}
