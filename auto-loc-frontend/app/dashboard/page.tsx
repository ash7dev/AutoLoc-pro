import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { fetchMe } from '../../lib/nestjs/auth';

/**
 * Hub /dashboard : redirige vers le bon espace selon le rôle.
 * Le middleware et le layout parent ont déjà vérifié que nest_access existe.
 */
export default async function DashboardPage() {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    redirect('/login');
  }

  // Inclure role_switch_at dans la clé de cache pour forcer l'invalidation
  // lors d'un changement de rôle (sinon le cache stale peut rediriger vers
  // le mauvais dashboard pendant 30s).
  const roleSwitchAt = cookies().get('role_switch_at')?.value ?? '';

  const profile = await unstable_cache(
    () => fetchMe(token),
    ['profile', token, roleSwitchAt],
    { revalidate: 30 },
  )();

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  if (profile.role === 'LOCATAIRE') {
    redirect('/reservations');
  }

  redirect('/dashboard/owner');
}
