import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { fetchMe } from '../../../../lib/nestjs/auth';

/**
 * /become-owner/terms — Page de validation des conditions propriétaire
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → affiche les termes (le switch sera fait côté client)
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

  // Pour les LOCATAIRE, on affiche directement la page des termes
  // Le switch vers PROPRIETAIRE sera géré côté client dans le composant
  // Import dynamique pour éviter les problèmes de SSR
  const { OwnerTermsValidation } = await import('../../../../features/owner/become-owner/components/owner-terms-validation');
  return <OwnerTermsValidation />;
}
