'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { RegisterForm } from '@/src/features/auth/components/RegisterForm';
import { LoginHeroCard } from '@/src/features/auth/components/LoginHeroCard';
import { useUserStore } from '@/src/core/store/useUserStore';

export default function RegisterPage() {
  const router = useRouter();
  const clearPendingIntent = useUserStore((s) => s.clearPendingIntent);
  const closeGuestModal = useUserStore((s) => s.closeGuestModal);

  useEffect(() => {
    closeGuestModal();
  }, [closeGuestModal]);

  const handleRegisterSuccess = () => {
    closeGuestModal();
    router.push('/');
  };

  const handleNavigateToLogin = () => {
    closeGuestModal();
    router.push('/login');
  };

  const handleClose = () => {
    clearPendingIntent();
    closeGuestModal();
    router.push('/');
  };

  return (
    <main className="fixed inset-0 z-50 bg-[#04150F] flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto lg:overflow-hidden">
      {/* Bouton de Fermeture / Retour à l'accueil en haut à droite */}
      <button
        onClick={handleClose}
        title="Retour à l'accueil"
        aria-label="Retour à l'accueil"
        className="absolute top-5 right-5 sm:top-8 sm:right-8 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
      >
        <X className="w-5 h-5 text-emerald-300" />
      </button>

      {/* 1. Fond Sombre Émeraude Deep */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#062017] via-[#04150F] to-[#020B08] pointer-events-none" />
      
      {/* 2. GIANT AURA GLOW RADIAL */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-[650px] aspect-square rounded-full bg-[#10B981]/28 blur-[90px] sm:blur-[130px] pointer-events-none animate-pulse" />
      
      {/* Halo secondaire sous la carte */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[500px] aspect-square rounded-full bg-[#34D399]/18 blur-[100px] pointer-events-none" />

      {/* 3. Disposition Responsive 2-Colonnes Desktop */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center gap-12 lg:gap-16 xl:gap-20 my-auto">
        {/* Colonne Gauche (Desktop Uniquement) : Carte Hero Ivoire Lumineuse */}
        <div className="hidden lg:flex w-full max-w-md items-center justify-center">
          <LoginHeroCard />
        </div>

        {/* Colonne Droite : Formulaire d'Inscription Décalé à Droite */}
        <div className="w-full max-w-md flex flex-col justify-center">
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </div>
      </div>
    </main>
  );
}
