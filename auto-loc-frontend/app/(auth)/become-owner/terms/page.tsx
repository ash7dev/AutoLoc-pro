import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { fetchMe } from '../../../../lib/nestjs/auth';
import { headers } from 'next/headers';

/**
 * /become-owner/terms — Page de validation des conditions propriétaire
 * - Non connecté → /login
 * - ADMIN → /dashboard/admin
 * - PROPRIETAIRE ou LOCATAIRE → affiche les termes (la validation se fait côté client)
 */
export default async function OwnerTermsPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  if (!token) {
    redirect('/login?next=/become-owner/terms');
  }

  const profile = await fetchMe(token);

  if (profile.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  // Pour PROPRIETAIRE et LOCATAIRE, on affiche toujours la page des termes
  // La logique de redirection sera gérée côté client dans le composant
  // Import dynamique pour éviter les problèmes de SSR
  const { OwnerTermsValidation } = await import('../../../../features/owner/become-owner/components/owner-terms-validation');
  return <OwnerTermsValidation />;
}
