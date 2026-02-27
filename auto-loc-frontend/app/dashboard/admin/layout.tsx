import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../../lib/nestjs/auth';
import { ApiError } from '../../../lib/nestjs/api-client';
import { AdminSidebar } from '../../../features/admin/components/admin-sidebar';
import { AdminAutoRefresh } from '../../../features/admin/components/admin-auto-refresh';

/**
 * Guard ADMIN : seul le rôle ADMIN peut accéder à /dashboard/admin/*.
 *
 * fetchMe est mis en cache 30s par token pour éviter un appel NestJS
 * à chaque navigation entre pages admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    redirect('/login');
  }

  let profile;
  try {
    profile = await unstable_cache(
      () => fetchMe(token),
      ['profile', token],
      { revalidate: 30 },
    )();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login?expired=1');
    }
    throw err;
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-[72px] lg:pt-0 lg:pb-0">
        {children}
      </main>
      <AdminAutoRefresh intervalMs={15000} />
    </div>
  );
}
