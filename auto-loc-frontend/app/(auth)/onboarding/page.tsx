import { OnboardingForm } from '../../../features/auth/onboarding/components/onboarding-form';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { fetchMe } from '../../../lib/nestjs/auth';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? null;

  if (!token) {
    redirect('/login');
  }

  const profile = await fetchMe(token);
  if (profile.hasUtilisateur) {
    redirect('/');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <OnboardingForm />
      </div>
    </div>
  );
}
