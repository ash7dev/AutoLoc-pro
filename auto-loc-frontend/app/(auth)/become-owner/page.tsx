import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchMe } from '../../../lib/nestjs/auth';
import { BecomeOwnerForm } from '../../../features/owner/become-owner/components/become-owner-form';

/**
 * /become-owner — Accessible à tout utilisateur connecté.
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → affiche le flow de transition
 */
export default async function BecomeOwnerPage() {
  const token = cookies().get('nest_access')?.value;

  if (!token) {
    redirect('/login?next=/become-owner');
  }

  const profile = await fetchMe(token);

  if (profile.role === 'PROPRIETAIRE') {
    redirect('/dashboard/owner');
  }

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  return <BecomeOwnerForm />;
}
