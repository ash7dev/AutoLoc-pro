'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '../stores/profile.store';

function getDashboardTarget(role: string): string | null {
  if (role === 'PROPRIETAIRE') return '/dashboard/owner';
  if (role === 'ADMIN' || role === 'SUPPORT') return '/dashboard/admin';
  return null;
}

/**
 * Monté uniquement sur la page `/`.
 *
 * Tier 1 — Synchrone : lit localStorage (roleStore persiste `activeRole`) au premier
 * effet, avant que le browser peigne la landing page. Flash quasi-imperceptible (~16ms).
 *
 * Tier 2 — Fallback réseau : si localStorage est vide (première visite, cache cleared),
 * souscrit au profileStore peuplé par GlobalRoleSync et redirige à l'arrivée du profil.
 */
export function HomeSessionRedirect() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);

  // Tier 1 : localStorage synchrone
  useEffect(() => {
    try {
      const raw = localStorage.getItem('autoloc-role');
      if (!raw) return;
      const { state } = JSON.parse(raw) as { state?: { activeRole?: string } };
      const target = getDashboardTarget(state?.activeRole ?? '');
      if (target) router.replace(target);
    } catch {
      // localStorage inaccessible ou JSON invalide — le tier 2 prend le relais
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tier 2 : fallback sur le profileStore (GlobalRoleSync)
  useEffect(() => {
    if (!profile) return;
    const target = getDashboardTarget(profile.role);
    if (target) router.replace(target);
  }, [profile, router]);

  return null;
}
