'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { BecomeOwnerForm } from './become-owner-form';

export function BecomeOwnerClient() {
  const router = useRouter();
  const [canShowForm, setCanShowForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login?next=/become-owner');
        return;
      }

      try {
        const profile = await apiFetch<ProfileResponse>('/auth/me', {
          accessToken: session.access_token,
          cache: 'no-store',
        });

        if (profile.role === 'PROPRIETAIRE') {
          router.replace('/dashboard/owner');
          return;
        }

        if (profile.role === 'ADMIN' || profile.role === 'SUPPORT') {
          router.replace('/dashboard/admin');
          return;
        }

        setCanShowForm(true);
      } catch {
        router.replace('/login?next=/become-owner');
      }
    };

    checkAuth();
  }, [router]);

  if (!canShowForm) {
    return null;
  }

  return <BecomeOwnerForm />;
}
