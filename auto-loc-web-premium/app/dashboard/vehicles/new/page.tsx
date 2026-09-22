'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AddVehicleWizardModal } from '@/src/features/vehicles/components/wizard/AddVehicleWizardModal';

export default function NewVehiclePage() {
  const router = useRouter();

  return (
    <AddVehicleWizardModal
      isOpen={true}
      onClose={() => router.push('/dashboard')}
      onVehicleCreated={() => router.push('/dashboard')}
    />
  );
}
