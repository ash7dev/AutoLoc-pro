'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import { formatCurrency, getTenantPricePerDay } from '@/lib/utils';
import { TarifProgressif } from '../types/vehicle.types';

interface VehicleBookingSidebarProps {
  vehicleId: string;
  baseOwnerPrice: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  fraisLivraison?: number | null;
  tarifsProgressifs?: TarifProgressif[];
  joursMinimum?: number;
  startDate?: string;
  endDate?: string;
  onSelectDatesClick?: () => void;
  onBookNow?: (params: {
    startDate?: string;
    endDate?: string;
    horsDakar: boolean;
    includeDelivery: boolean;
    totalAmount: number;
    daysCount: number;
  }) => void;
}

const formatShortDate = (value: string, withYear = false) =>
  new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });

export function VehicleBookingSidebar({
  vehicleId,
  baseOwnerPrice,
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 0,
  fraisLivraison = 0,
  tarifsProgressifs = [],
  joursMinimum = 1,
  startDate,
  endDate,
  onSelectDatesClick,
  onBookNow,
}: VehicleBookingSidebarProps) {
  const [horsDakar, setHorsDakar] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(false);

  // Calcul du nombre de jours de location
  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [startDate, endDate]);

  // Détermination du tarif propriétaire effectif selon la grille dégressive
  const effectiveOwnerPricePerDay = useMemo(() => {
    if (!tarifsProgressifs || tarifsProgressifs.length === 0) {
      return baseOwnerPrice;
    }
    const matchingTier = tarifsProgressifs.find((tier) => {
      const min = Number(tier.joursMin);
      const max = tier.joursMax ? Number(tier.joursMax) : Infinity;
      return daysCount >= min && daysCount <= max;
    });
    return matchingTier ? Number(matchingTier.prix) : baseOwnerPrice;
  }, [baseOwnerPrice, tarifsProgressifs, daysCount]);

  // Tarif locataire par jour (incluant commission AutoLoc)
  const tenantPricePerDay = getTenantPricePerDay(effectiveOwnerPricePerDay);
  const baseTenantPricePerDay = getTenantPricePerDay(baseOwnerPrice);

  // Remise longue durée appliquée (par rapport au tarif standard)
  const discountPercent =
    baseTenantPricePerDay > 0
      ? Math.round(((baseTenantPricePerDay - tenantPricePerDay) / baseTenantPricePerDay) * 100)
      : 0;

  // Total de base pour les N jours
  const baseTotal = Number(tenantPricePerDay) * daysCount;

  // Supplément Hors Dakar (conversion explicite en Number)
  const numSupplementHorsDakar = Number(supplementHorsDakarParJour ?? 0);
  const horsDakarTotal =
    horsDakar && autoriseHorsDakar && !isNaN(numSupplementHorsDakar)
      ? numSupplementHorsDakar * daysCount
      : 0;

  // Frais de livraison (conversion explicite en Number)
  const numFraisLivraison = Number(fraisLivraison ?? 0);
  const deliveryTotal = includeDelivery && !isNaN(numFraisLivraison) ? numFraisLivraison : 0;

  // Total général (addition numérique stricte)
  const totalAmount = Number(baseTotal) + Number(horsDakarTotal) + Number(deliveryTotal);

  const handleBookPress = () => {
    if (onBookNow) {
      onBookNow({
        startDate,
        endDate,
        horsDakar,
        includeDelivery,
        totalAmount,
        daysCount,
      });
    }
  };

  const showDeliveryOption = fraisLivraison !== null && fraisLivraison !== undefined;
  const hasOptions = autoriseHorsDakar || showDeliveryOption;

  const optionRowClass = (checked: boolean) =>
    `flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${checked
      ? 'border-[#0A3D2E] bg-[#F1DFB6]/25'
      : 'border-slate-200 hover:border-slate-300'
    }`;

  const checkboxClass =
    'mt-0.5 w-4 h-4 shrink-0 rounded accent-[#0A3D2E] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2';

  return (
    <aside
      aria-label="Réservation"
      className="sticky top-28 bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-xl shadow-slate-200/50"
    >
      {/* Tarif journalier */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
        <div>
          <p className="text-4xl leading-none text-[#0A3D2E] font-display">
            {formatCurrency(tenantPricePerDay)}
          </p>
          <p className="mt-1.5 text-sm text-slate-500">FCFA / jour</p>
        </div>

        {discountPercent > 0 && (
          <div className="text-right">
            <p className="text-lg leading-none text-[#0A3D2E] font-display">
              −{discountPercent}&nbsp;%
            </p>
            <p className="mt-1.5 text-sm text-slate-500">Longue durée</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 space-y-3">
        {/* Sélecteur de dates */}
        <button
          type="button"
          onClick={onSelectDatesClick}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-slate-200 text-left cursor-pointer transition-colors hover:border-[#0A3D2E]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Calendar
              className="w-5 h-5 shrink-0 text-[#0A3D2E]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="min-w-0">
              {startDate && endDate ? (
                <p className="text-sm font-semibold text-slate-900">
                  {formatShortDate(startDate)} – {formatShortDate(endDate, true)}
                </p>
              ) : startDate ? (
                <p className="text-sm font-semibold text-slate-900">
                  Dès le {formatShortDate(startDate, true)}, choisir la fin
                </p>
              ) : (
                <p className="text-sm font-semibold text-slate-900">Choisir les dates</p>
              )}
              <p className="text-sm text-slate-500">
                Minimum {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
        </button>

        {/* Options complémentaires */}
        {hasOptions && (
          <fieldset className="space-y-2.5">
            <legend className="sr-only">Options de la réservation</legend>

            {autoriseHorsDakar && (
              <label className={optionRowClass(horsDakar)}>
                <input
                  type="checkbox"
                  checked={horsDakar}
                  onChange={(e) => setHorsDakar(e.target.checked)}
                  className={checkboxClass}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Trajets hors Dakar</p>
                  <p className="text-sm text-slate-500">
                    {supplementHorsDakarParJour && supplementHorsDakarParJour > 0
                      ? `+${formatCurrency(supplementHorsDakarParJour)} FCFA / jour`
                      : 'Inclus sans frais'}
                  </p>
                </div>
              </label>
            )}

            {showDeliveryOption && (
              <label className={optionRowClass(includeDelivery)}>
                <input
                  type="checkbox"
                  checked={includeDelivery}
                  onChange={(e) => setIncludeDelivery(e.target.checked)}
                  className={checkboxClass}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Livraison du véhicule</p>
                  <p className="text-sm text-slate-500">
                    {fraisLivraison && fraisLivraison > 0
                      ? `+${formatCurrency(fraisLivraison)} FCFA`
                      : 'Gratuite'}
                  </p>
                </div>
              </label>
            )}
          </fieldset>
        )}
      </div>

      {/* Décompte, total et réservation */}
      <div className="bg-[#0A3D2E] px-6 py-6 space-y-5">
        <div className="space-y-2 text-sm text-[#F1DFB6]/80">
          <div className="flex justify-between gap-4">
            <span>
              {formatCurrency(tenantPricePerDay)} FCFA × {daysCount} jour
              {daysCount > 1 ? 's' : ''}
            </span>
            <span className="font-medium text-[#F1DFB6] tabular-nums">
              {formatCurrency(baseTotal)} FCFA
            </span>
          </div>

          {horsDakarTotal > 0 && (
            <div className="flex justify-between gap-4">
              <span>Trajets hors Dakar ({daysCount} j)</span>
              <span className="font-medium text-[#F1DFB6] tabular-nums">
                +{formatCurrency(horsDakarTotal)} FCFA
              </span>
            </div>
          )}

          {deliveryTotal > 0 && (
            <div className="flex justify-between gap-4">
              <span>Livraison</span>
              <span className="font-medium text-[#F1DFB6] tabular-nums">
                +{formatCurrency(deliveryTotal)} FCFA
              </span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-4 pt-4 border-t border-[#F1DFB6]/20">
          <span className="text-sm text-[#F1DFB6]/80">Total estimé</span>
          <span className="text-3xl leading-none text-[#F1DFB6] font-display tabular-nums">
            {formatCurrency(totalAmount)}
            <span className="ml-1.5 text-sm font-sans text-[#F1DFB6]/70">FCFA</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleBookPress}
          className="w-full py-4 px-6 rounded-full bg-[#F1DFB6] text-[#0A3D2E] font-semibold text-base cursor-pointer transition-all hover:bg-[#F6E9C8] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E]"
        >
          Réserver ce véhicule
        </button>

        <ul className="space-y-3 text-sm text-[#F1DFB6]/75">
          <li className="flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                className="w-4 h-4 mt-0.5 shrink-0 text-[#F1DFB6]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Paiement sécurisé instantané</span>
            </div>
            {/* Visual Logo Badges */}
            <div className="flex items-center gap-2 pl-6 pt-0.5">
              <div className="flex items-center gap-1.5 bg-white/10 border border-[#F1DFB6]/20 px-2.5 py-1 rounded-lg">
                <img src="/wave.png" alt="Wave" className="h-4 w-4 rounded-full object-cover shrink-0" />
                <span className="text-[11px] font-bold text-[#F1DFB6]">Wave</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 border border-[#F1DFB6]/20 px-2.5 py-1 rounded-lg">
                <img src="/orange_money.jpg" alt="Orange Money" className="h-4 w-4 rounded-full object-cover shrink-0" />
                <span className="text-[11px] font-bold text-[#F1DFB6]">Orange Money</span>
              </div>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck
              className="w-4 h-4 mt-0.5 shrink-0 text-[#F1DFB6]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Assurance tous risques incluse
          </li>
        </ul>
      </div>
    </aside>
  );
}
