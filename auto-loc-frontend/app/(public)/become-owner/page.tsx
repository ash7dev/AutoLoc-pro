'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { BecomeOwnerForm } from '@/features/owner/become-owner/components/become-owner-form';

/**
 * /become-owner — Accessible à tout utilisateur connecté via Supabase.
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → affiche le flow de transition
 */
export default function BecomeOwnerPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login?next=/become-owner');
        return;
      }

      // Récupérer le profil depuis le backend pour vérifier le rôle
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NESTJS_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const profile = await res.json();
          if (profile.role === 'PROPRIETAIRE') {
            router.push('/dashboard/owner');
          } else if (profile.role === 'ADMIN') {
            router.push('/dashboard/admin');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    checkAuth();
  }, [router]);

  return <BecomeOwnerForm />;
}
