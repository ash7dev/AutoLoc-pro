'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, Sparkles } from 'lucide-react';

export interface OwnerMobileDetailHeaderProps {
  reservationId?: string;
  vehicleTitle?: string;
  statut?: string;
  tenantPhone?: string;
  onBack?: () => void;
  onShare?: () => void;
}

const getStatusLabel = (statut?: string) => {
  switch (statut?.toUpperCase()) {
    case 'EN_ATTENTE_PAIEMENT':
    case 'INITIEE':
      return 'Paiement en attente';
    case 'PAYEE':
      return 'À confirmer';
    case 'CONFIRMEE':
      return 'Confirmée';
    case 'EN_COURS':
      return 'Location en cours';
    case 'TERMINEE':
      return 'Terminée';
    case 'LITIGE':
      return 'En litige';
    case 'ANNULEE':
    case 'EXPIREE':
      return 'Annulée';
    default:
      return 'AutoLoc Hôte';
  }
};

export const OwnerMobileDetailHeader: React.FC<OwnerMobileDetailHeaderProps> = ({
  reservationId = '',
  vehicleTitle = 'Réservation',
  statut,
  tenantPhone,
  onBack,
  onShare,
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const statusText = getStatusLabel(statut);
  const refShort = reservationId ? reservationId.slice(0, 8).toUpperCase() : '';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard/reservations');
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 w-full px-4 sm:hidden">
      <div className="pointer-events-auto flex h-14 items-center justify-between rounded-full border border-slate-900/10 bg-white/90 px-2.5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.20)] backdrop-blur-xl">
        {/* Bouton Retour Glassmorphic (Exactement identique à MobileDetailHeader) */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-brand-dark transition-colors hover:bg-slate-200 active:scale-95 cursor-pointer shrink-0"
        >
          <ChevronLeft className="h-5 w-5 stroke-[2.2]" />
        </button>

        {/* Titre & Référence central (Même style Cormorant/Serif + Badge Mono) */}
        <div className="min-w-0 flex-1 px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 truncate">
            <span
              className="text-sm font-semibold text-brand-dark tracking-tight truncate max-w-[120px]"
              style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
            >
              {vehicleTitle}
            </span>
            {refShort && (
              <span className="font-mono text-[10.5px] font-bold text-brand-main bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs shrink-0">
                #{refShort}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1 pt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-main/90 truncate max-w-[140px]">
              {statusText}
            </span>
          </div>
        </div>

        {/* Action Droite : Partage (Identique à MobileDetailHeader tenant) */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Partager"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-main text-champagne transition-colors hover:bg-forest-700 active:scale-95 cursor-pointer shrink-0 shadow-xs"
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