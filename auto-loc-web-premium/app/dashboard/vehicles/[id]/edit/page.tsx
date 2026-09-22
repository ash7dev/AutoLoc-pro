'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AddVehicleWizardModal } from '@/src/features/vehicles/components/wizard/AddVehicleWizardModal';
import { vehicleService } from '@/src/features/vehicles/services/vehicleService';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params?.id as string;
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
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#059669] border-t-transparent" />
          <span className="text-sm font-semibold text-slate-700 font-fraunces">Chargement des données du véhicule...</span>
        </div>
      </div>
    );
  }

  return (
    <AddVehicleWizardModal
      isOpen={true}
      mode="EDIT"
      vehicleToEdit={vehicleToEdit || { id: vehicleId }}
      onClose={() => router.push('/dashboard/vehicles')}
      onVehicleUpdated={() => router.push('/dashboard/vehicles')}
    />
  );
}
