'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * ✅ NEW: Session expiry warning toast
 *
 * Shows a toast notification when the session is about to expire,
 * with a "Continue session" button to refresh the token.
 *
 * Automatically redirects to login after 10 seconds if no action taken.
 */
export function SessionExpiryToast() {
  const router = useRouter();
  const [toastId, setToastId] = useState<string | number | null>(null);

  useEffect(() => {
    const handleSessionExpiry = async (event: CustomEvent<{ expired?: boolean }>) => {
      const { expired } = event.detail;

      if (expired) {
        // Session already expired → show toast with countdown
        let countdown = 10;
        const countdownInterval = setInterval(() => {
          countdown -= 1;
          if (countdown === 0) {
            clearInterval(countdownInterval);
            router.push('/login?expired=1');
          }
        }, 1000);

        const id = toast.error('Session expirée', {
          description: `Vous serez déconnecté dans ${countdown} secondes`,
          duration: 10000,
          action: {
            label: 'Continuer la session',
            onClick: async () => {
              clearInterval(countdownInterval);
              // Try to refresh the token
              try {
                const refreshRes = await fetch('/api/auth/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });

                if (refreshRes.ok) {
                  toast.success('Session renouvelée', {
                    description: 'Vous pouvez continuer à utiliser l\'application',
                  });
                  // Reload the current page to apply the new token
                  router.refresh();
                } else {
                  toast.error('Impossible de renouveler la session', {
                    description: 'Veuillez vous reconnecter',
                  });
                  setTimeout(() => {
                    router.push('/login?expired=1');
                  }, 2000);
                }
              } catch (error) {
                console.error('[SessionExpiryToast] Refresh error:', error);
                toast.error('Erreur réseau', {
                  description: 'Veuillez vérifier votre connexion',
                });
                setTimeout(() => {
                  router.push('/login?expired=1');
                }, 2000);
              }
            },
          },
        });

        setToastId(id);
      }
    };

    // Listen for session expiry events
    window.addEventListener('session:expired' as any, handleSessionExpiry);

    return () => {
      window.removeEventListener('session:expired' as any, handleSessionExpiry);
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [router, toastId]);

  return null; // Invisible component
}
