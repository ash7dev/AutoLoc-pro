'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Monté uniquement dans le bloc `hidden md:block` des pages qui affichent un écran
 * "connexion requise" sur mobile (voir AuthRequiredScreen). Sur desktop, on garde le
 * comportement existant : redirection immédiate vers /login.
 */
export function DesktopAuthRedirect({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectTo);
  }, [redirectTo, router]);

  return null;
}
