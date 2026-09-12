'use client';

/* ════════════════════════════════════════════════════════════════
   VehiclePricingTable — 2026 Luxury Degressive Rate Showcase
════════════════════════════════════════════════════════════════ */

import React from 'react';
import { Tag, TrendingDown, Zap, Clock, Sparkles } from 'lucide-react';
import { cn, getTenantPricePerDay } from '@/lib/utils';
import type { TarifTier } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { createFallbackTiers } from '@/lib/nestjs/vehicle-fallbacks';
import { PremiumPriceTag } from '@/components/ui/PremiumPriceTag';

interface Props {
  prixParJour: number;
  tiers: TarifTier[];
}

export function VehiclePricingTable({ prixParJour, tiers }: Props): React.ReactElement {
  const { formatPrice } = useCurrency();
  const displayTiers = tiers.length > 0 ? tiers : createFallbackTiers(prixParJour);
  const usingFallbacks = tiers.length === 0;

  if (tiers.length === 0 && !usingFallbacks) {
    return (
      <div className="space-y-4">
        <h2 className="text-[20px] font-black tracking-tight text-slate-900 font-brand">Tarification</h2>
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-950 text-white shadow-xl">
          <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <Tag className="w-6 h-6" strokeWidth={2.5} />
          </span>
          <div>
            <PremiumPriceTag
              price={getTenantPricePerDay(prixParJour)}
              size="lg"
              variant="dark"
              period="/ jour"
              hidePrefix={true}
            />
            <p className="text-[12px] font-bold text-slate-400 mt-1">Tarif fixe garanti à la réservation</p>
          </div>
        </div>
      </div>
    );
  }

  const tenantTiers = displayTiers.map((t) => ({ ...t, tenantPrix: getTenantPricePerDay(t.prix) }));
  const basePrice = Math.max(...tenantTiers.map((t) => t.tenantPrix));
  const minPrice = Math.min(...tenantTiers.map((t) => t.tenantPrix));
  const hasDiscount = tenantTiers.length > 1 && basePrice > minPrice;
  const maxSavingPct = hasDiscount
    ? Math.round(((basePrice - minPrice) / basePrice) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-black tracking-tight text-slate-900 font-brand flex items-center gap-2">
            {hasDiscount ? 'Tarifs dégressifs par durée' : 'Tarification'}
            {usingFallbacks && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                Estimation
              </span>
            )}
          </h2>
          {hasDiscount ? (
            <p className="text-[13px] font-semibold text-slate-600 mt-1">
              Économisez jusqu&apos;à{' '}
              <span className="text-emerald-600 font-black text-[14px]">−{maxSavingPct}%</span>
              {' '}sur vos séjours prolongés au Sénégal
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-slate-600 mt-1">
              Tarif fixe garanti sans frais cachés
            </p>
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto flex-shrink-0 shadow-xs">
          {hasDiscount ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              Plus longtemps = Moins cher
            </>
          ) : (
            <>
              <Tag className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              Prix Transparent
            </>
          )}
        </span>
      </div>

      {/* ── Degressive Tiers Grid ── */}
      <div className="space-y-3">
        {tenantTiers.map((tier) => {
          const label = tier.joursMax
            ? `${tier.joursMin} à ${tier.joursMax} jours`
            : `${tier.joursMin}+ jours`;
          const isLowest = tier.tenantPrix === minPrice;
          const savingPct = Math.round(((basePrice - tier.tenantPrix) / basePrice) * 100);
          const savingFcfa = basePrice - tier.tenantPrix;
          const barPct = hasDiscount
            ? Math.round(20 + ((basePrice - tier.tenantPrix) / (basePrice - minPrice)) * 80)
            : 100;

          return (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-3xl border-2 p-5 transition-all duration-300 overflow-hidden',
                isLowest
                  ? 'border-emerald-400 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white shadow-md shadow-emerald-500/10'
                  : 'border-slate-200/80 bg-white hover:border-slate-300',
              )}
            >
              {isLowest && (
                <div className="absolute -top-0.5 right-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-b-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10.5px] font-black uppercase tracking-wider shadow-md">
                    <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                    Meilleur Tarif
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Duration Label */}
                <div className="flex items-center gap-3 min-w-[140px]">
                  <span className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs",
                    isLowest ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  )}>
                    <Clock className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-[14px] font-extrabold text-slate-900 font-brand">{label}</span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1">
                  <PremiumPriceTag
                    price={tier.tenantPrix}
                    size="md"
                    variant={isLowest ? 'emerald' : 'default'}
                    period="/ jour"
                    hidePrefix={true}
                  />
                </div>

                {/* Savings Pill Badges */}
                {savingPct > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-extrabold text-amber-800 bg-amber-100/90 border border-amber-200 px-3 py-1 rounded-xl tabular-nums">
                      −{formatPrice(savingFcfa)}/j
                    </span>
                    <span className={cn(
                      'text-[12px] font-black px-3 py-1 rounded-xl shadow-2xs',
                      isLowest ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white',
                    )}>
                      −{savingPct}%
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isLowest ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-300'
                  )}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 font-semibold text-center">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        Le tarif dégressif s&apos;applique automatiquement lors du choix de vos dates
      </p>
    </div>
  );
}
