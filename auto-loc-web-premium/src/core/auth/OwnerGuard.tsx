'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

interface OwnerGuardProps {
  children: React.ReactNode;
  autoSwitchOnAccess?: boolean;
}

export const OwnerGuard: React.FC<OwnerGuardProps> = ({
  children,
  autoSwitchOnAccess = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useUserStore((s) => s.isInitialized);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const capabilities = useUserStore((s) => s.capabilities);
  const switchRole = useUserStore((s) => s.switchRole);

  const [isSwitching, setIsSwitching] = useState(false);

  // Redirection automatique vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push(`/login?redirectUrl=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  // Si l'option autoSwitchOnAccess est activée et que le locataire accède au portail,
  // déclencher silencieusement la bascule vers le rôle PROPRIETAIRE
  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      user &&
      !capabilities.isOwner &&
      autoSwitchOnAccess &&
      !isSwitching
    ) {
      setIsSwitching(true);
      switchRole('PROPRIETAIRE').finally(() => {
        setIsSwitching(false);
      });
    }
  }, [isInitialized, isAuthenticated, user, capabilities.isOwner, autoSwitchOnAccess, isSwitching, switchRole]);

  // 1. Écran de chargement pendant l'initialisation de la session
  if (!isInitialized || isSwitching) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3D2E]/[0.08] text-[#0A3D2E]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Chargement de l&apos;Espace Hôte AutoLoc...
        </p>
      </div>
    );
  }

  // 2. Non authentifié : écran d'attente pendant la redirection vers la page de connexion
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A3D2E]" />
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  // 3. Connecté mais pas encore Propriétaire (cas d'attente ou si autoSwitchOnAccess est désactivé)
  if (!capabilities.isOwner) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rounded-3xl border border-emerald-900/20 bg-slate-900 p-8 text-white shadow-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Espace Hôte AutoLoc ⚡️
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Cet espace est réservé aux hôtes et propriétaires de véhicules. Activez votre espace hôte en un clic pour gérer vos véhicules, vos réservations et vos revenus.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={async () => {
                setIsSwitching(true);
                await switchRole('PROPRIETAIRE');
                setIsSwitching(false);
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-98"
            >
              <Sparkles className="h-4 w-4" />
              Activer mon Espace Hôte
            </button>

            <button
              type="button"
              onClick={() => router.push('/vehicles')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retourner à l&apos;exploration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authentifié & Propriétaire (ou Admin) : Accès autorisé au portail
  return <>{children}</>;
};
