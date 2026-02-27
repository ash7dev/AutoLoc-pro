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

  const profile = await unstable_cache(
    () => fetchMe(token),
    ['profile', token],
    { revalidate: 30 },
  )();

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  redirect('/dashboard/owner');
}
