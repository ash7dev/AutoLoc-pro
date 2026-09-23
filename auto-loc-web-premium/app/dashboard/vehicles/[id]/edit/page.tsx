'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AddVehicleWizardModal } from '@/src/features/vehicles/components/wizard/AddVehicleWizardModal';
import { vehicleService } from '@/src/features/vehicles/services/vehicleService';

import { useCacheInvalidator } from '@/src/core/hooks/useCacheInvalidator';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params?.id as string;
  const { invalidateVehicles } = useCacheInvalidator();
  const [vehicleToEdit, setVehicleToEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId) {
      vehicleService.getVehicleById(vehicleId)
        .then((v) => {
          setVehicleToEdit(v);
        })
        .catch((err) => {
          console.warn('Échec de récupération du véhicule pour édition:', err);
          setVehicleToEdit({ id: vehicleId });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse p-4 sm:p-6">
        <div className="h-10 w-64 rounded-2xl bg-slate-200" />
        <div className="h-96 w-full rounded-3xl bg-slate-200" />
      </div>
    );
  }

  return (
    <AddVehicleWizardModal
      isOpen={true}
      mode="EDIT"
      vehicleToEdit={vehicleToEdit || { id: vehicleId }}
      onClose={() => router.push('/dashboard/vehicles')}
      onVehicleUpdated={async () => {
        await invalidateVehicles();
        router.push('/dashboard/vehicles');
      }}
    />
  );
}
