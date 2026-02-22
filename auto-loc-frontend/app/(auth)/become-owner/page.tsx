import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { fetchMe } from '../../../lib/nestjs/auth';
import { BecomeOwnerForm } from '../../../features/owner/become-owner/components/become-owner-form';

/**
 * /become-owner — Accessible à tout utilisateur connecté.
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner/vehicles
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → affiche le flow de transition
 */
export default async function BecomeOwnerPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  if (!token) {
    redirect('/login?next=/become-owner');
  }

  const profile = await fetchMe(token);

  if (profile.role === 'PROPRIETAIRE') {
    redirect('/dashboard/owner/vehicles');
  }

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  return <BecomeOwnerForm />;
}
