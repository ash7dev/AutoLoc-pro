'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { completeProfile, fetchMe, type CompleteProfileInput, type ProfileResponse } from '@/lib/nestjs/auth';
import { syncWithNestJS } from './use-nest-token';
import { useRoleStore } from '../stores/role.store';

function extractCompleteProfileInput(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']): CompleteProfileInput | null {
  const user = session?.user;
  if (!user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const prenom = typeof metadata.prenom === 'string' ? metadata.prenom.trim() : '';
  const nom = typeof metadata.nom === 'string' ? metadata.nom.trim() : '';
  const metadataPhone = typeof metadata.telephone === 'string' ? metadata.telephone : '';
  const phone = (user.phone ?? metadataPhone).replace('whatsapp:', '').trim();

  if (!prenom || !nom || !phone) {
    return null;
  }

  return { prenom, nom, telephone: phone };
}

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inFlight = useRef(false);

  // Reset le guard anti-double-appel si le composant est démonté
  useEffect(() => {
    return () => { inFlight.current = false; };
  }, []);

  const redirectAfterAuth = async (
    explicitSession?: any,
    directTokens?: { accessToken: string; refreshToken: string; activeRole: string; profile: any },
    explicitNext?: string | null,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;

    let profile: ProfileResponse;
    let currentSession = explicitSession ?? null;
    let token: string | undefined;

    try {
      if (directTokens) {
        // Cas Direct (Login Téléphone Backend)
        token = directTokens.accessToken;
        const sessionNest = await syncWithNestJS(undefined, directTokens);
        // On récupère le profil directement de la synchro s'il existe
        profile = sessionNest.profile || await fetchMe();
      } else {
        // Cas Supabase (Email / Google)
        if (!currentSession) {
          const { data } = await supabase.auth.getSession();
          currentSession = data.session;
        }

        token = currentSession?.access_token;
        if (!token) {
          inFlight.current = false;
          return;
        }

        const sessionNest = await syncWithNestJS(token);
        // On récupère le profil directement de la synchro s'il existe
        profile = sessionNest.profile || await fetchMe();
      }
    } catch (err) {
      console.error('[AuthFlow] Sync error:', err);
      inFlight.current = false;
      return false;
    }

    // Stocker hasVehicles dans le store pour le menu utilisateur (rapide, synchrone)
    if (profile.hasVehicles !== undefined) {
      useRoleStore.getState().setHasVehicles(profile.hasVehicles);
    }

    // ── Redirection Rapide (sans attendre les tâches de fond) ──
    if (profile.role === 'ADMIN' || profile.role === 'SUPPORT') {
      window.location.href = '/dashboard/admin';
      inFlight.current = false;
      return true;
    }

    const next = explicitNext ?? searchParams.get('next');
    const requiredRole = searchParams.get('role') as 'PROPRIETAIRE' | 'LOCATAIRE' | null;

    if (next && next.startsWith('/')) {
      // Rediriger immédiatement
      window.location.href = next;
      inFlight.current = false;

      // Switch de rôle en tâche de fond si nécessaire
      if (
        requiredRole &&
        requiredRole !== profile.role &&
        (requiredRole === 'PROPRIETAIRE' || requiredRole === 'LOCATAIRE')
      ) {
        fetch('/api/nest/auth/switch-role', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: requiredRole }),
        }).catch(e => console.warn('[AuthFlow] Role switch failed after redirect'));
      }

      return true;
    }

    // Redirection par défaut selon le rôle
    const target = profile.role === 'PROPRIETAIRE' ? '/dashboard/owner' : '/';
    window.location.href = target;

    inFlight.current = false;

    // ── Tâches de fond (Non bloquantes, lancées APRÈS la redirection) ──
    const backgroundTasks = async () => {
      // 1. Compléter le profil si nécessaire
      if (!profile.hasUtilisateur) {
        const seededProfile = extractCompleteProfileInput(currentSession);
        if (seededProfile && token) {
          try {
            await completeProfile(token, seededProfile);
          } catch (err) {
            console.warn('[AuthFlow] Lazy profile completion failed:', err);
          }
        }
      }
    };

    // On lance les tâches de fond sans les attendre (Fire and Forget)
    backgroundTasks().catch(console.error);

    return true;
  };

  return { redirectAfterAuth };
}
