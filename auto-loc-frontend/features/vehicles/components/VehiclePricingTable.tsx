'use client';

import React from 'react';
import { Tag, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TarifTier } from '@/lib/nestjs/vehicles';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props {
  prixParJour: number;
  tiers: TarifTier[];
}

export function VehiclePricingTable({ prixParJour, tiers }: Props): React.ReactElement {
  if (tiers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-[17px] font-black tracking-tight text-slate-900">Tarification</h2>
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
          <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Tag className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[22px] font-black text-emerald-700 tabular-nums leading-tight">
              {formatPrice(prixParJour)}{' '}
              <span className="text-[14px] font-semibold text-emerald-500">FCFA</span>
            </p>
            <p className="text-[12px] font-medium text-emerald-500 mt-0.5">par jour · tarif fixe</p>
          </div>
        </div>
      </div>
    );
  }

  const maxPrice = Math.max(...tiers.map((t) => t.prix));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-black tracking-tight text-slate-900">Tarifs dégressifs</h2>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
          Plus vous louez, moins vous payez
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
        {tiers.map((tier, i) => {
          const label = tier.joursMax
            ? `${tier.joursMin} – ${tier.joursMax} jours`
            : `${tier.joursMin}+ jours`;
          const isLowest = tier.prix === Math.min(...tiers.map((t) => t.prix));
          const savingPct = Math.round(((maxPrice - tier.prix) / maxPrice) * 100);

          return (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-2xl border p-4 transition-all duration-200',
                isLowest
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                  : 'border-slate-100 bg-white hover:border-slate-200',
              )}
            >
              {isLowest && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide">
                  <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                  Meilleur tarif
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                  <p className={cn(
                    'text-[22px] font-black tabular-nums leading-tight',
                    isLowest ? 'text-emerald-600' : 'text-slate-800',
                  )}>
                    {formatPrice(tier.prix)}
                    <span className={cn('text-[13px] font-semibold ml-1', isLowest ? 'text-emerald-400' : 'text-slate-400')}>
                      FCFA/j
                    </span>
                  </p>
                </div>
                {savingPct > 0 && (
                  <span className={cn(
                    'px-2.5 py-1.5 rounded-xl text-[12px] font-bold',
                    isLowest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600',
                  )}>
                    −{savingPct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}