'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, TrendingDown } from 'lucide-react';
import type { VehicleSearchResult, TarifTier } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { cn } from '@/lib/utils';

const PRIX_COEFFICIENT_AFFICHAGE = 1.15;

function bestTier(tiers: TarifTier[]): TarifTier | null {
  if (tiers.length === 0) return null;
  return tiers.reduce((m, t) => (Number(t.prix) < Number(m.prix) ? t : m), tiers[0]);
}

function maxSavings(base: number, tiers: TarifTier[]): number {
  const tier = bestTier(tiers);
  if (!tier || base <= 0) return 0;
  return Math.round(((base - Number(tier.prix)) / base) * 100);
}

interface CompactVehicleCardProps {
  vehicle: VehicleSearchResult;
}

/**
 * Carte véhicule compacte (photo + badge note + nom + ville + prix + tarification
 * dégressive), pensée pour les grilles 2 colonnes mobile. Utilisée par
 * PremiumSelectionGrid et la grille /explorer.
 */
export function CompactVehicleCard({ vehicle: v }: CompactVehicleCardProps): React.ReactElement {
  const { formatPrice } = useCurrency();
  const basePrice = Math.round(Number(v.prixParJour) * PRIX_COEFFICIENT_AFFICHAGE);
  const photo = v.photoUrl;
  const tiers = v.tarifsProgressifs ?? [];
  const savings = maxSavings(Number(v.prixParJour), tiers);
  const minDays = bestTier(tiers)?.joursMin ?? null;

  return (
    <Link
      href={`/vehicle/${v.id}`}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl border border-slate-100/80 overflow-hidden h-full',
        'shadow-sm shadow-slate-100/50 transition-all active:scale-[0.98]'
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[5/4] w-full bg-slate-100 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`${v.marque} ${v.modele}`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <span className="text-[10px] font-bold text-slate-300">AutoLoc</span>
          </div>
        )}

        {/* Rating Badge */}
        {v.note > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-1 text-[10.5px] font-black text-white">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {Number(v.note).toFixed(1)}
            </span>
          </div>
        )}

        {/* Verify Indicator */}
        <div className="absolute top-2 left-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500/90 flex items-center justify-center text-white shadow">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 flex flex-col flex-1">
        <h4 className="text-[14px] font-bold text-slate-800 truncate leading-tight">
          {v.marque} <span className="text-emerald-600">{v.modele}</span>
        </h4>
        <p className="text-[11px] font-medium text-slate-400 mt-1 leading-none">
          {v.ville}
        </p>

        <div className="mt-3.5 pt-3 border-t border-slate-50 flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider leading-none">À partir de</p>
            <div className="flex items-baseline gap-1 flex-wrap mt-1.5">
              <span className="text-[18px] font-black text-slate-900 leading-none tabular-nums whitespace-nowrap">{formatPrice(basePrice)}</span>
              <span className="text-[10.5px] font-medium text-slate-400 whitespace-nowrap">/j</span>
            </div>
            {/* Hauteur réservée même sans réduction, pour que toutes les cartes soient alignées */}
            <div className="mt-1.5 h-[19px] flex items-center">
              {savings > 0 && minDays != null && (
                <p className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                  <TrendingDown className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={3} />
                  −{savings}% dès {minDays}j
                </p>
              )}
            </div>
          </div>
          <span className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-emerald-400 shrink-0 self-end">
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
