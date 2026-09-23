'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Share2, Sparkles, Home } from 'lucide-react';

export const MobileDetailHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Déterminer le titre et le lien de retour selon la page
  const isReservationDetail = pathname?.startsWith('/reservations/');
  const isVehicleDetail = pathname?.startsWith('/vehicles/');

  const backHref = isReservationDetail ? '/reservations' : isVehicleDetail ? '/vehicles' : '/';

  const extractId = () => {
    const parts = pathname?.split('/') || [];
    const rawId = parts[parts.length - 1] || '';
    return rawId.length > 8 ? rawId.slice(0, 8).toUpperCase() : rawId.toUpperCase();
  };

  const pageTitle = isReservationDetail
    ? `Réservation #${extractId()}`
    : isVehicleDetail
      ? 'Détail du véhicule'
      : 'AutoLoc';

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    if (isVehicleDetail) {
      router.push('/vehicles');
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 w-full px-4 lg:hidden">
      <div className="pointer-events-auto flex h-14 items-center justify-between rounded-full border border-slate-900/10 bg-white/90 px-2.5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.20)] backdrop-blur-xl">
        {/* Bouton Retour Glassmorphic */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-[#041912] transition-colors hover:bg-slate-200 active:scale-95 cursor-pointer shrink-0"
        >
          <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Titre & Référence central */}
        <div className="min-w-0 flex-1 px-2 text-center">
          {isReservationDetail ? (
            <div className="flex items-center justify-center gap-1.5 truncate">
              <span
                className="text-sm font-semibold text-[#041912] tracking-tight"
                style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
              >
                Réservation
              </span>
              <span className="font-mono text-[10.5px] font-bold text-[#0A3D2E] bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs">
                #{extractId()}
              </span>
            </div>
          ) : (
            <h2 className="truncate font-display text-sm font-bold text-[#041912] tracking-tight">
              {pageTitle}
            </h2>
          )}

          <div className="flex items-center justify-center gap-1 pt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#0A3D2E]/90">
              AutoLoc
            </span>
          </div>
        </div>

        {/* Action Droite : Partage */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Partager"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6] transition-colors hover:bg-[#0F4F3B] active:scale-95 cursor-pointer shrink-0 shadow-xs"
        >
          {copied ? (
            <span className="text-[10px] font-bold">✓</span>
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
};
