'use client';

import React, { useEffect } from 'react';
import { useUserStore } from '@/src/core/store/useUserStore';
import { TenantProfileView } from '@/src/features/profile/components/TenantProfileView';
import Link from 'next/link';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isInitialized = useUserStore((s) => s.isInitialized);

  // Scroll restoration logic
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-6 sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-12 w-64 bg-slate-200/80 animate-pulse rounded-2xl" />
          <div className="h-64 bg-white border border-slate-200/80 rounded-3xl animate-pulse p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-6 sm:pt-8 lg:pt-36 pb-32 lg:pb-24 px-4 sm:px-6 lg:px-8">
      {!isAuthenticated ? (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl border border-slate-200 bg-white text-center space-y-5 shadow-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669]">
            <ShieldAlert className="w-7 h-[#059669]" />
          </div>
          <h2 className="font-fraunces text-2xl font-normal text-[#041912]">
            Connexion Requise
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Veuillez vous connecter à votre compte AutoLoc pour accéder à votre profil, vos informations personnelles et vos paramètres de sécurité.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#041912] hover:bg-[#0A3D2E] text-[#F1DFB6] font-semibold text-xs transition-colors shadow-md cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#4ADE80]" />
              <span>Se connecter à mon compte</span>
            </Link>
          </div>
        </div>
      ) : (
        <TenantProfileView />
      )}
    </div>
  );
}
