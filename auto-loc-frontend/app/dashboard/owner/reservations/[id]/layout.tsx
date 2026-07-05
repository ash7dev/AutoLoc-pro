import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe, fetchUserProfile } from '../../../../../lib/nestjs/auth';
import { OwnerSidebar } from '../../../../../features/owner/components/owner-sidebar';

/**
 * Layout spécifique pour les pages de détail de réservation.
 * Masque la bottom navigation mobile pour une meilleure expérience de lecture.
 */
export default async function ReservationDetailLayout({
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

  const cacheKey = ['profile', token, roleSwitchAt];

  try {
    profile = await unstable_cache(
      () => fetchMe(token),
      cacheKey,
      { revalidate: 10 },
    )();
  } catch {
    redirect('/login?expired=1');
  }

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (profile.role !== 'PROPRIETAIRE') {
    redirect('/become-owner');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <OwnerSidebar profile={profile} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-0 lg:pt-0 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
