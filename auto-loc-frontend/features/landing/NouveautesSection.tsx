'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { HorizontalVehicleCarousel } from './HorizontalVehicleCarousel';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';

interface NouveautesSectionProps {
  vehicles: VehicleSearchResult[];
}

export function NouveautesSection({ vehicles }: NouveautesSectionProps): React.ReactElement | null {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <div className="py-4 border-t border-slate-50">
      <div className="px-4 mb-4">
        <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          Nouveautés
        </h3>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
          Fraîchement ajoutés
        </p>
      </div>

      <div className="px-4">
        <HorizontalVehicleCarousel vehicles={vehicles} />
      </div>
    </div>
  );
}
