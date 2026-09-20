'use client';

import React, { useMemo } from 'react';
import { Calendar, Zap, ChevronRight } from 'lucide-react';
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

  const handleAction = () => {
    if (hasSelectedDates) {
      onBookNow({
        startDate,
        endDate,
        totalAmount,
        daysCount,
      });
    } else {
      onOpenDatesModal();
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(15,23,42,0.15)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      {/* Côté Gauche: Prix & Dates */}
      <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpenDatesModal}>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-[#0A3D2E] font-display tracking-tight">
            {formatCurrency(tenantPricePerDay)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">FCFA / j</span>
        </div>

        {hasSelectedDates ? (
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 mt-0.5 truncate">
            <span>{formatShortDate(startDate!)} – {formatShortDate(endDate!)}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              ({daysCount}j)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDatesModal();
            }}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 underline mt-0.5 hover:text-emerald-800"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Choisir les dates</span>
          </button>
        )}
      </div>

      {/* Côté Droit: Bouton principal CTA */}
      <button
        type="button"
        onClick={handleAction}
        className="shrink-0 py-3.5 px-5 rounded-full bg-[#0A3D2E] hover:bg-[#0F4F3B] active:scale-[0.98] text-[#F1DFB6] font-bold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition-all"
      >
        <Zap className="w-3.5 h-3.5 text-[#F1DFB6] fill-[#F1DFB6]" />
        <span>{hasSelectedDates ? 'Réserver' : 'Choisir les dates'}</span>
      </button>
    </div>
  );
}
