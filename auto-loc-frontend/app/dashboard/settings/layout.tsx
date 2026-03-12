import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../../lib/nestjs/auth';
import { ApiError } from '../../../lib/nestjs/api-client';
import { OwnerSidebar } from '../../../features/owner/components/owner-sidebar';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    redirect('/login');
  }

  const roleSwitchAt = cookies().get('role_switch_at')?.value ?? '';
  try {
    const profile = await unstable_cache(
      () => fetchMe(token),
      ['profile', token, roleSwitchAt],
      { revalidate: 30 },
    )();

    if (profile.role === 'ADMIN') {
      redirect('/dashboard/admin');
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect('/login?expired=1');
    }
    throw err;
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
