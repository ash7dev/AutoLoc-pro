'use client';

import React from 'react';
import { Tag, TrendingDown, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TarifTier } from '@/lib/nestjs/vehicles';
import { formatPrice } from '@/features/vehicles/owner/vehicle-helpers';
import { createFallbackTiers } from '@/lib/nestjs/vehicle-fallbacks';

interface Props {
  prixParJour: number;
  tiers: TarifTier[];
}

export function VehiclePricingTable({ prixParJour, tiers }: Props): React.ReactElement {
  // Utilise les fallbacks si aucun tarif n'est fourni
  const displayTiers = tiers.length > 0 ? tiers : createFallbackTiers(prixParJour);
  
  // Si on a des fallbacks et pas de vrais tarifs, affiche un indicateur
  const usingFallbacks = tiers.length === 0;
  
  if (tiers.length === 0 && !usingFallbacks) {
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
            <p className="text-[12px] font-semibold text-emerald-600 mt-0.5">par jour · tarif fixe</p>
          </div>
        </div>
      </div>
    );
  }

  const basePrice = Math.max(...displayTiers.map((t) => t.prix));
  const minPrice  = Math.min(...displayTiers.map((t) => t.prix));
  const hasDiscount = displayTiers.length > 1 && basePrice > minPrice;
  const maxSavingPct = hasDiscount
    ? Math.round(((basePrice - minPrice) / basePrice) * 100)
    : 0;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-black tracking-tight text-slate-900">
            {hasDiscount ? 'Tarifs dégressifs' : 'Tarification'}
            {usingFallbacks && (
              <span className="ml-2 text-[11px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Estimation
              </span>
            )}
          </h2>
          {hasDiscount ? (
            <p className="text-[13px] font-semibold text-slate-600 mt-0.5">
              Économisez jusqu'à{' '}
              <span className="text-emerald-600 font-black">{maxSavingPct}%</span>
              {' '}sur vos longues durées
              {usingFallbacks && (
                <span className="text-slate-400 font-normal"> (tarifs standards)</span>
              )}
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-slate-600 mt-0.5">
              Tarif fixe · Prix garanti à la réservation
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full self-start sm:self-auto flex-shrink-0">
          {hasDiscount ? (
            <>
              <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />
              Plus longtemps = moins cher
            </>
          ) : (
            <>
              <Tag className="w-3.5 h-3.5" strokeWidth={2.5} />
              Prix transparent
            </>
          )}
        </span>
      </div>

      {/* ── Tier rows ───────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {displayTiers.map((tier) => {
          const label = tier.joursMax
            ? `${tier.joursMin} – ${tier.joursMax} jours`
            : `${tier.joursMin}+ jours`;
          const isLowest   = tier.prix === minPrice;
          const savingPct  = Math.round(((basePrice - tier.prix) / basePrice) * 100);
          const savingFcfa = basePrice - tier.prix;
          // Bar fill: base tier → 15%, best tier → 100%
          const barPct = hasDiscount
            ? Math.round(15 + ((basePrice - tier.prix) / (basePrice - minPrice)) * 85)
            : 100;

          return (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-2xl border p-4 transition-all duration-200',
                isLowest
                  ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-white shadow-sm shadow-emerald-100'
                  : 'border-slate-100 bg-white',
              )}
            >
              {/* Best price badge */}
              {isLowest && (
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/30">
                    <Zap className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Meilleur prix
                  </span>
                </div>
              )}

              {/* Main row */}
              <div className="flex items-center gap-3 flex-wrap">

                {/* Duration icon + label */}
                <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px]">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                  </span>
                  <span className="text-[13px] font-bold text-slate-800">{label}</span>
                </div>

                {/* Price */}
                <div className="flex-shrink-0">
                  <span className={cn(
                    'text-[22px] font-black tabular-nums leading-none',
                    isLowest ? 'text-emerald-600' : 'text-slate-900',
                  )}>
                    {formatPrice(tier.prix)}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-500 ml-1">FCFA/j</span>
                </div>

                {/* Savings badges */}
                {savingPct > 0 && (
                  <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg tabular-nums">
                      −{formatPrice(savingFcfa)} FCFA/j
                    </span>
                    <span className={cn(
                      'text-[12px] font-black px-2.5 py-1 rounded-lg',
                      isLowest ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700',
                    )}>
                      −{savingPct}%
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn('h-full rounded-full', isLowest ? 'bg-emerald-400' : 'bg-slate-300')}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer hint ─────────────────────────────────────────── */}
      <p className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 font-medium">
        {hasDiscount
          ? <TrendingDown className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
          : <Tag className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
        }
        {hasDiscount
          ? 'Le tarif s\'applique automatiquement selon votre durée'
          : 'Prix fixe · aucune surprise à la facturation'
        }
        {usingFallbacks && (
          <span className="text-amber-600">· Tarifs estimés</span>
        )}
      </p>

    </div>
  );
}
