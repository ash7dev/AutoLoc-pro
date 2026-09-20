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
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#04150F] border-t border-emerald-500/30 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(4,21,15,0.5)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      {/* Côté Gauche: Prix & Subtitle */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-white font-display tracking-tight">
            {formatCurrency(tenantPricePerDay)}
          </span>
          <span className="text-[11px] font-medium text-emerald-200/70">FCFA / j</span>
        </div>

        {hasSelectedDates ? (
          <div className="flex items-center gap-1 text-xs font-bold text-white mt-0.5 truncate">
            <span>{formatShortDate(startDate!)} – {formatShortDate(endDate!)}</span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              ({daysCount}j)
            </span>
          </div>
        ) : (
          <p className="text-[11px] font-medium text-emerald-200/60 truncate mt-0.5">
            Frais & assurances TTC inclus
          </p>
        )}
      </div>

      {/* Côté Droit: Bouton principal CTA 'Réserver' */}
      <button
        type="button"
        onClick={() =>
          onBookNow({
            startDate,
            endDate,
            totalAmount,
            daysCount,
          })
        }
        className="shrink-0 py-3.5 px-6 rounded-full bg-[#059669] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs tracking-wide shadow-lg border border-emerald-400/40 flex items-center gap-2 cursor-pointer transition-all"
      >
        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
        <span>Réserver</span>
      </button>
    </div>
  );
}
