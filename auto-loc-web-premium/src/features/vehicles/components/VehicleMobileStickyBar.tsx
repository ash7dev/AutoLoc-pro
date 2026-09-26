'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency, getTenantPricePerDay } from '@/lib/utils';
import { TarifProgressif } from '../types/vehicle.types';

interface VehicleMobileStickyBarProps {
  baseOwnerPrice: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  fraisLivraison?: number | null;
  tarifsProgressifs?: TarifProgressif[];
  startDate?: string;
  endDate?: string;
  onOpenDatesModal: () => void;
  onBookNow: (params: {
    startDate?: string;
    endDate?: string;
    totalAmount: number;
    daysCount: number;
  }) => void;
}

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });

export function VehicleMobileStickyBar({
  baseOwnerPrice,
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 0,
  fraisLivraison = 0,
  tarifsProgressifs = [],
  startDate,
  endDate,
  onOpenDatesModal,
  onBookNow,
}: VehicleMobileStickyBarProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Calcul du nombre de jours
  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  // Tarif propriétaire effectif avec grille dégressive
  const effectiveOwnerPrice = useMemo(() => {
    if (!tarifsProgressifs || tarifsProgressifs.length === 0) return baseOwnerPrice;
    const matchingTier = tarifsProgressifs.find((tier) => {
      const min = Number(tier.joursMin);
      const max = tier.joursMax ? Number(tier.joursMax) : Infinity;
      return daysCount >= min && daysCount <= max;
    });
    return matchingTier ? Number(matchingTier.prix) : baseOwnerPrice;
  }, [baseOwnerPrice, tarifsProgressifs, daysCount]);

  // Tarif locataire / jour avec commission AutoLoc
  const tenantPricePerDay = getTenantPricePerDay(effectiveOwnerPrice);
  const totalAmount = tenantPricePerDay * daysCount;

  const hasSelectedDates = Boolean(startDate && endDate);

  const handleCtaClick = () => {
    onBookNow({
      startDate,
      endDate,
      totalAmount,
      daysCount,
    });
  };

  if (!isMounted) return null;

  return (
    <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 max-w-lg mx-auto">
      {/* Barre de Dock flottante Glassmorphism Blanche assortie au Header Mobile */}
      <div className="flex h-16 items-center justify-between rounded-full border border-slate-900/10 bg-white/95 px-4 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.22)] backdrop-blur-xl animate-in slide-in-from-bottom duration-300 gap-3">
        
        {/* Côté Gauche: Tarification & Dates */}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-serif text-xl sm:text-2xl font-normal text-brand-dark tabular-nums tracking-tight leading-none">
              {formatCurrency(tenantPricePerDay)}
            </span>
            <span className="text-[10px] font-bold text-brand-main bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 uppercase tracking-wider">
              FCFA / j
            </span>
          </div>

          {hasSelectedDates ? (
            <button
              type="button"
              onClick={onOpenDatesModal}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mt-0.5 hover:text-brand-main transition-colors cursor-pointer text-left truncate group"
            >
              <Calendar className="w-3 h-3 text-brand-main shrink-0" />
              <span className="truncate">
                {formatShortDate(startDate!)} – {formatShortDate(endDate!)}
              </span>
              <span className="text-[10px] font-bold text-brand-main bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 shrink-0">
                {daysCount}j
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Assurance & frais TTC inclus</span>
            </div>
          )}
        </div>

        {/* Côté Droit: Bouton principal CTA assorti (#0A3D2E & #F1DFB6) */}
        <button
          type="button"
          onClick={handleCtaClick}
          className="shrink-0 py-3 px-5 sm:px-6 rounded-full bg-brand-main hover:bg-forest-700 active:scale-[0.96] text-champagne font-bold text-xs tracking-wider shadow-md shadow-brand-main/20 flex items-center gap-2 cursor-pointer transition-all duration-200 group"
        >
          <Zap className="w-3.5 h-3.5 text-champagne fill-[#F1DFB6]" />
          <span>Réserver</span>
          <ArrowRight className="w-3.5 h-3.5 text-champagne/80 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
