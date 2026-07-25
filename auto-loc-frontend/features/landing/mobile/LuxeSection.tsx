'use client';

import React from 'react';
import Link from 'next/link';
import { Gem, ArrowRight } from 'lucide-react';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { CompactVehicleCard } from '@/features/vehicles/components/CompactVehicleCard';

interface LuxeSectionProps {
  vehicles: VehicleSearchResult[];
}

export function LuxeSection({ vehicles }: LuxeSectionProps): React.ReactElement | null {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <div className="py-4 border-t border-slate-50 px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
            <Gem className="h-4 w-4 text-purple-500" />
            Luxe
          </h3>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
            Véhicules haut de gamme
          </p>
        </div>

        <Link
          href="/explorer?type=LUXE"
          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
        >
          Voir tout <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 auto-rows-fr">
        {vehicles.slice(0, 4).map((v) => (
          <div key={v.id} className="h-full">
            <CompactVehicleCard vehicle={v} />
          </div>
        ))}
      </div>
    </div>
  );
}
