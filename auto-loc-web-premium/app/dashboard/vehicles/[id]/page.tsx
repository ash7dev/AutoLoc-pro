'use client';

import React from 'react';
import { OwnerVehicleDetailView } from '@/src/features/vehicles';

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return <OwnerVehicleDetailView vehicleId={params.id} />;
}
