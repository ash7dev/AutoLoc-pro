import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchMe } from '../../../lib/nestjs/auth';
import { ApiError } from '../../../lib/nestjs/api-client';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

/**
 * Guard ADMIN : seul le rôle ADMIN peut accéder à /dashboard/admin/*.
 * Ce layout s'exécute après dashboard/layout.tsx qui a déjà écarté les LOCATAIRES.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const nestToken = cookies().get('nest_access')?.value ?? null;

  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }

  if (!token) {
    redirect('/login');
  }

  let profile;
  try {
    profile = await fetchMe(token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login?expired=1');
    }
    throw err;
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
