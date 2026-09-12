'use client';

import React from 'react';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';

interface Props {
  vehicle: VehicleSearchResult;
}

export function ExplorerVehicleCard({ vehicle }: Props): React.ReactElement {
  return (
    <div className="h-full">
      {/* Mobile/tablette : carte compacte */}
      <div className="lg:hidden h-full">
        <VehicleCard vehicle={vehicle} variant="compact" />
      </div>
      {/* Desktop : carte standard sublimée avec typographie Fraunces */}
      <div className="hidden lg:block h-full">
        <VehicleCard vehicle={vehicle} variant="standard" />
      </div>
    </div>
  );
}
