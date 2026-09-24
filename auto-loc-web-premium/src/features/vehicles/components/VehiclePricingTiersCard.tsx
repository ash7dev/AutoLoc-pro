'use client';

import React from 'react';
import { TarifProgressif } from '../types/vehicle.types';
import { formatCurrency, getTenantPricePerDay } from '@/lib/utils';

interface VehiclePricingTiersCardProps {
  tarifsProgressifs?: TarifProgressif[];
  basePrice: number;
}

interface TierRowProps {
  duration: string;
  note: string;
  noteHighlighted?: boolean;
  price: number;
  barPercent: number;
  isReference?: boolean;
}

function TierRow({
  duration,
  note,
  noteHighlighted = false,
  price,
  barPercent,
  isReference = false,
}: TierRowProps) {
  return (
    <li className="grid grid-cols-[1fr_auto] sm:grid-cols-[9.5rem_1fr_8.5rem] items-center gap-x-5 gap-y-3 px-5 sm:px-6 py-4">
      {/* Durée + remise */}
      <div className="order-1 sm:order-none">
        <p className="text-sm font-semibold text-slate-900">{duration}</p>
        <p
          className={`mt-0.5 text-sm ${
            noteHighlighted ? 'font-semibold text-[#0A3D2E]' : 'text-slate-500'
          }`}
        >
          {note}
        </p>
      </div>

      {/* Barre proportionnelle au prix : plus elle est courte, plus le tarif baisse */}
      <div
        aria-hidden="true"
        className="order-3 sm:order-none col-span-2 sm:col-span-1 h-2 rounded-full bg-[#F1DFB6]/45 overflow-hidden"
      >
        <div
          className={`h-full rounded-full ${isReference ? 'bg-slate-300' : 'bg-[#0A3D2E]'}`}
          style={{ width: `${barPercent}%` }}
        />
      </div>

      {/* Prix par jour */}
      <div className="order-2 sm:order-none text-right">
        <p className="font-serif text-lg font-normal leading-tight tabular-nums text-[#0A3D2E]">
          {formatCurrency(price)}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">FCFA / jour</p>
      </div>
    </li>
  );
}

function formatDuration(min: number, max?: number | null) {
  if (!max) return `${min} jours et plus`;
  if (max === min) return `${min} jours`;
  return `${min} à ${max} jours`;
}

export function VehiclePricingTiersCard({
  tarifsProgressifs,
  basePrice,
}: VehiclePricingTiersCardProps) {
  if (!tarifsProgressifs || tarifsProgressifs.length === 0) {
    return null;
  }

  const baseTenantPrice = getTenantPricePerDay(basePrice);

  // Paliers triés par durée croissante
  const tiers = [...tarifsProgressifs].sort(
    (a, b) => Number(a.joursMin) - Number(b.joursMin)
  );

  // Le tarif standard couvre les jours qui précèdent le premier palier
  const firstMin = Number(tiers[0].joursMin);
  const showStandard = firstMin > 1;
  const standardDuration = firstMin === 2 ? '1 jour' : `1 à ${firstMin - 1} jours`;

  return (
    <section
      aria-label="Tarifs dégressifs"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <h3 className="text-lg text-slate-900 font-display">Tarifs dégressifs</h3>
        <p className="mt-1 text-sm text-slate-500">
          Le prix par jour baisse automatiquement quand vous louez plus longtemps.
        </p>
      </div>

      <ul className="border-t border-slate-200/80 divide-y divide-slate-200/80">
        {showStandard && (
          <TierRow
            duration={standardDuration}
            note="Tarif standard"
            price={baseTenantPrice}
            barPercent={100}
            isReference
          />
        )}

        {tiers.map((tier) => {
          const tierTenantPrice = getTenantPricePerDay(Number(tier.prix));

          const discountPercent =
            baseTenantPrice > 0
              ? Math.round(((baseTenantPrice - tierTenantPrice) / baseTenantPrice) * 100)
              : 0;

          const barPercent =
            baseTenantPrice > 0
              ? Math.min(100, Math.max(0, (tierTenantPrice / baseTenantPrice) * 100))
              : 100;

          return (
            <TierRow
              key={tier.id || `tier-${tier.joursMin}`}
              duration={formatDuration(Number(tier.joursMin), tier.joursMax as number | null)}
              note={discountPercent > 0 ? `−${discountPercent}\u00A0%` : 'Même tarif'}
              noteHighlighted={discountPercent > 0}
              price={tierTenantPrice}
              barPercent={barPercent}
            />
          );
        })}
      </ul>
    </section>
  );
}