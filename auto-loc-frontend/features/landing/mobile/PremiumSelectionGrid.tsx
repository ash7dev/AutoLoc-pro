'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { CompactVehicleCard } from '@/features/vehicles/components/CompactVehicleCard';

interface PremiumSelectionGridProps {
  vehicles: VehicleSearchResult[];
}

export function PremiumSelectionGrid({ vehicles }: PremiumSelectionGridProps): React.ReactElement | null {
  if (!vehicles || vehicles.length === 0) return null;

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
        {vehicles.slice(0, 4).map((v) => (
          <CompactVehicleCard key={v.id} vehicle={v} />
        ))}
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
