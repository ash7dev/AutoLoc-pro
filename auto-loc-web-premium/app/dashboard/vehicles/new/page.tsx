'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/src/core/store/useUserStore';
import { useHostGate } from '@/src/features/owner/hooks/useHostGate';
import { AddVehicleWizardModal } from '@/src/features/vehicles/components/wizard/AddVehicleWizardModal';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';

export default function NewVehiclePage() {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isInitialized = useUserStore((s) => s.isInitialized);
  const { canProceed, missingSteps, userAge } = useHostGate();
  const [gateOpen, setGateOpen] = useState(true);

  if (!isInitialized) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A3D2E] border-t-transparent" />
      </div>
    );
  }

  // 1. Verrou 1 : Authentification obligatoire
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  // 2. Verrou 2 : Host Gate & Conformité (Profil, SMS OTP, KYC, Permis)
  if (!canProceed && missingSteps.length > 0) {
    return (
      <ReservationGateModal
        visible={gateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => router.push('/dashboard/vehicles')}
        onAllCompleted={() => {
          setGateOpen(false);
        }}
      />
    );
  }

  // 3. Accès autorisé : Wizard de création de véhicule
  return (
    <AddVehicleWizardModal
      isOpen={true}
      onClose={() => router.push('/dashboard/vehicles')}
      onVehicleCreated={() => router.push('/dashboard/vehicles')}
    />
  );
}
