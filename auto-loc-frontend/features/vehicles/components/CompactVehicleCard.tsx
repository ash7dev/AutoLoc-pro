'use client';

import React from 'react';
import type { VehicleSearchResult } from '@/lib/nestjs/vehicles';
import { VehicleCard } from './VehicleCard';

interface CompactVehicleCardProps {
  vehicle: VehicleSearchResult;
}

export function CompactVehicleCard({ vehicle }: CompactVehicleCardProps): React.ReactElement {
  return <VehicleCard vehicle={vehicle} variant="compact" />;
}
