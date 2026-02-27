import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../../lib/nestjs/auth';
import { ApiError } from '../../../lib/nestjs/api-client';
import { OwnerSidebar } from '../../../features/owner/components/owner-sidebar';

/**
 * Guard PROPRIETAIRE : seul le rôle PROPRIETAIRE peut accéder à /dashboard/owner/*.
 * - ADMIN → son espace dédié /dashboard/admin
 * - Autre → /become-owner pour démarrer le flow de transition
 *
 * fetchMe est mis en cache 30s par token pour éviter un appel NestJS
 * à chaque navigation entre pages owner.
 */
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    redirect('/login');
  }

  let profile;
  const roleSwitchAt = cookies().get('role_switch_at')?.value ?? '';
  try {
    profile = await unstable_cache(
      () => fetchMe(token),
      ['profile', token, roleSwitchAt],
      { revalidate: 30 },
    )();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login?expired=1');
    }
    throw err;
  }

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (profile.role !== 'PROPRIETAIRE') {
    redirect(profile.hasVehicles ? '/become-owner?auto=1' : '/become-owner');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-[72px] lg:pt-0 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
