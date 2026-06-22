'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { HorizontalVehicleCarousel } from '../HorizontalVehicleCarousel';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';

interface TopNotesSectionProps {
  vehicles: VehicleSearchResult[];
}

export function TopNotesSection({ vehicles }: TopNotesSectionProps): React.ReactElement | null {
  if (!vehicles || vehicles.length === 0) return null;

  return (
    <div className="py-4 border-t border-slate-50">
      <div className="px-4 mb-4">
        <h3 className="text-[14px] font-black text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          Top Notés
        </h3>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
          Les mieux notés par nos locataires
        </p>
      </div>

      <div className="px-4">
        <HorizontalVehicleCarousel vehicles={vehicles} />
      </div>
    </div>
  );
}
