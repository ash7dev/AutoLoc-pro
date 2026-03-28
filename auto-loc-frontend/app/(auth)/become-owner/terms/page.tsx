import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { fetchMe } from '../../../../lib/nestjs/auth';

/**
 * /become-owner/terms — Page de validation des conditions propriétaire
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → redirige vers dashboard/owner (le switch a déjà été fait)
 */
export default async function OwnerTermsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  if (!token) {
    redirect('/login?next=/become-owner/terms');
  }

  const profile = await fetchMe(token);

  if (profile.role === 'PROPRIETAIRE') {
    redirect('/dashboard/owner');
  }

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  // Si on arrive ici en tant que LOCATAIRE, c'est que le switch n'a pas été fait
  // On redirige vers /become-owner pour faire le switch d'abord
  if (profile.role === 'LOCATAIRE') {
    redirect('/become-owner');
  }

  // Import dynamique pour éviter les problèmes de SSR
  const { OwnerTermsValidation } = await import('../../../../features/owner/become-owner/components/owner-terms-validation');
  return <OwnerTermsValidation />;
}
