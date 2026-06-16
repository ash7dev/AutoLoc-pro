'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { searchVehicles } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { cn } from '@/lib/utils';

const PRIX_COEFFICIENT_AFFICHAGE = 1.15;

export function PremiumSelectionGrid(): React.ReactElement | null {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchPremiumVehicles();
  }, []);

  const fetchPremiumVehicles = async () => {
    setLoading(true);
    try {
      // Query top rated/popular vehicles for premium selection
      const res = await searchVehicles({ 
        sortBy: 'note', 
        sortOrder: 'desc',
        page: 1 
      });
      // Limit to 4 for a clean 2x2 grid
      setVehicles((res.data || []).slice(0, 4));
    } catch (err) {
      console.error('Error fetching premium vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
        <p className="text-[11px] font-semibold text-slate-400">Chargement de la sélection premium...</p>
      </div>
    );
  }

  if (vehicles.length === 0) return null;

  return (
    <div className="py-4 border-t border-slate-50 px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase">
            Sélection Premium
          </h3>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
            Nos véhicules coup de cœur
          </p>
        </div>

        <Link
          href="/explorer"
          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
        >
          Voir tout <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {vehicles.map((v) => {
          const basePrice = Math.round(Number(v.prixParJour) * PRIX_COEFFICIENT_AFFICHAGE);
          const photo = v.photoUrl || v.photos?.find((p: any) => p.estPrincipale)?.url || v.photos?.[0]?.url;

          return (
            <Link
              key={v.id}
              href={`/vehicle/${v.id}`}
              className={cn(
                'group relative flex flex-col bg-white rounded-2xl border border-slate-100/80 overflow-hidden',
                'shadow-sm shadow-slate-100/50 transition-all active:scale-[0.98]'
              )}
            >
              {/* Photo */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
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
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-black text-white">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      {Number(v.note).toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Verify Indicator */}
                <div className="absolute top-2 left-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/90 flex items-center justify-center text-white shadow">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-3 flex flex-col flex-1">
                <h4 className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                  {v.marque} <span className="text-emerald-600">{v.modele}</span>
                </h4>
                <p className="text-[9.5px] font-medium text-slate-400 mt-0.5 leading-none">
                  {v.ville}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">À partir de</p>
                    <p className="text-[13px] font-black text-slate-900 leading-none mt-0.5">
                      {formatPrice(basePrice)}
                      <span className="text-[9px] font-medium text-slate-400">/j</span>
                    </p>
                  </div>
                  <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center text-emerald-400 shrink-0">
                    <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/explorer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 transition-all active:scale-[0.98]"
      >
        Voir toute la sélection
        <ArrowRight className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
