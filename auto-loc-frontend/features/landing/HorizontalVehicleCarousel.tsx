'use client';

import React from 'react';
import { ExplorerVehicleCard } from '../explorer/ExplorerVehicleCard';

interface HorizontalVehicleCarouselProps {
  vehicles: any[];
}

export function HorizontalVehicleCarousel({
  vehicles,
}: HorizontalVehicleCarouselProps): React.ReactElement {
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
        <p className="text-slate-400 text-xs font-semibold">Aucun véhicule disponible</p>
      </div>
    );
  }

  return (
    <div 
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="snap-start snap-always shrink-0 w-[280px] select-none"
        >
          <ExplorerVehicleCard vehicle={vehicle} />
        </div>
      ))}
    </div>
  );
}
