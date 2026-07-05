import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../../lib/nestjs/auth';
import { OwnerSidebar } from '../../../features/owner/components/owner-sidebar';
import { SettingsShell } from '../../../features/settings/components/settings-shell';

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
  let profile: Awaited<ReturnType<typeof fetchMe>>;
  try {
    profile = await unstable_cache(
      () => fetchMe(token),
      ['profile', token, roleSwitchAt],
      { revalidate: 30 },
    )();
  } catch {
    redirect('/login?expired=1');
  }

  if (profile.role === 'LOCATAIRE') redirect('/settings');

  return (
    <div className="flex min-h-screen bg-page">
      <OwnerSidebar profile={profile} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-[90px] lg:pt-0 lg:pb-0">
        <SettingsShell>
          {children}
        </SettingsShell>
      </main>
    </div>
  );
}
