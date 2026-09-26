'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../../core/store/useUserStore';

export const LoginHeroCard: React.FC = () => {
  const router = useRouter();
  const clearPendingIntent = useUserStore((s) => s.clearPendingIntent);
  const closeGuestModal = useUserStore((s) => s.closeGuestModal);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearPendingIntent();
    closeGuestModal();
    router.push('/');
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col justify-center my-2">
      {/* 1. Card d'arrière-plan en décalé 3D (Back Layer Accent) */}
      <div className="absolute -top-2.5 -bottom-2.5 left-3 right-3 rounded-[32px] bg-emerald-500/20 border-[1.5px] border-emerald-400/35 shadow-xl pointer-events-none" />

      {/* 2. Card Principale White / Light Ivory Glass Sheet */}
      <div className="relative bg-[#FFFFFF] rounded-[28px] p-6 sm:p-7 shadow-2xl border border-white/80 flex flex-col justify-between space-y-6">
        {/* Header Card : Logo AutoLoc */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="inline-block transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Retour à l'accueil"
          >
            <Image
              src="/logo.png"
              alt="AutoLoc Premium"
              width={145}
              height={44}
              className="object-contain"
              priority
            />
          </Link>

          {/* Badge Pilule */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-emerald-600 text-[9px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PREMIUM MOBILITY</span>
          </div>
        </div>

        {/* Corps Central : Titre & Description */}
        <div className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-normal leading-[1.25] text-brand-dark font-fraunces">
            La plateforme des <span className="italic text-emerald-800">passionnés d'auto</span> qui visent <em className="italic text-emerald-600 font-fraunces">l'excellence.</em>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
            Réservation instantanée, acomptes en FCFA sécurisés via Orange Money &amp; Wave, véhicules de prestige vérifiés et suivi client sans friction.
          </p>
        </div>

        {/* Pied de carte : Témoignage Glassmorphism */}
        <div className="bg-brand-dark/[0.03] border border-brand-dark/10 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-700 italic leading-relaxed mb-3 font-fraunces">
            « Avec AutoLoc Premium, je réserve mes véhicules de prestige à Dakar en 1 clic et je règle mon acompte Wave en toute sécurité. »
          </p>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-dark text-white font-medium text-xs flex items-center justify-center shadow-md">
              AD
            </div>
            <div>
              <h4 className="text-xs font-fraunces font-normal text-brand-dark leading-tight">
                Aïssatou Diallo
              </h4>
              <p className="text-[10px] text-emerald-700 font-normal italic">
                Locataire VIP • Dakar
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
