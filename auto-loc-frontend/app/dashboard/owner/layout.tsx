import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchMe } from '../../../lib/nestjs/auth';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { OwnerSidebar } from '../../../features/owner/components/owner-sidebar';

/**
 * Guard PROPRIETAIRE : seul le rôle PROPRIETAIRE peut accéder à /dashboard/owner/*.
 * - ADMIN → son espace dédié /dashboard/admin
 * - Autre → /become-owner pour démarrer le flow de transition
 */
export default async function OwnerLayout({
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

  const profile = await fetchMe(token);

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (profile.role !== 'PROPRIETAIRE') {
    redirect('/become-owner');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
