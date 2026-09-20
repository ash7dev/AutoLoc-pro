import React from 'react';
import { Metadata } from 'next';
import { TenantVehicleDetailPage } from '@/src/features/vehicles/components/TenantVehicleDetailPage';

interface VehicleDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: VehicleDetailPageProps): Promise<Metadata> {
  return {
    title: `Détail du Véhicule #${params.id} — AutoLoc Premium`,
    description: `Consultez les caractéristiques et réservez le véhicule #${params.id} sur AutoLoc Premium.`,
  };
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  return <TenantVehicleDetailPage vehicleId={params.id} />;
}
