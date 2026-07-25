import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../../lib/nestjs/auth';
import { decodeValidNestJwt } from '../../../lib/nestjs/jwt';
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
  const tokenPayload = decodeValidNestJwt(token);
  const tokenRole = tokenPayload?.role;

  if (!token) {
    redirect('/login');
  }

  if (tokenRole === 'ADMIN' || tokenRole === 'SUPPORT') {
    redirect('/dashboard/admin');
  }

  let profile;
  const roleSwitchAt = cookies().get('role_switch_at')?.value ?? '';

  // Inclure le timestamp dans la clé de cache pour forcer l'invalidation
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

  if (profile.role === 'ADMIN' || profile.role === 'SUPPORT') {
    redirect('/dashboard/admin');
  }

  if (profile.role !== 'PROPRIETAIRE' && tokenRole !== 'PROPRIETAIRE') {
    redirect('/become-owner');
  }

  const ownerProfile =
    profile.role === 'PROPRIETAIRE'
      ? profile
      : { ...profile, role: 'PROPRIETAIRE' as const };

  // Note: La redirection vers le profil incomplet a été supprimée car des "gates"
  // sont déjà présentes lors de la création d'annonce.


  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <OwnerSidebar profile={ownerProfile} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-[90px] lg:pt-0 lg:pb-0">
        {children}
      </main>
    </div>
  );
}
