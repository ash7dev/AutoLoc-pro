import { redirect } from 'next/navigation';
import { fetchMe } from '../../lib/nestjs/auth';
import { createSupabaseServerClient } from '../../lib/supabase/server';

/**
 * Hub /dashboard : redirige vers le bon espace selon le rôle.
 * Le layout parent a déjà écarté les LOCATAIRES.
 */
export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  if (!token) {
    redirect('/login');
  }

  const profile = await fetchMe(token);

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  // PROPRIETAIRE → espace de gestion des véhicules
  redirect('/dashboard/owner/vehicles');
}
