import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, Car } from 'lucide-react';
import { fetchAdminVehicles } from '../../../../lib/nestjs/admin';
import { AdminVehiclesList, type TabValue } from '../../../../features/admin/components/admin-vehicles-list';
import type { VehicleStatus } from '../../../../lib/nestjs/vehicles';

const VALID_STATUTS: VehicleStatus[] = [
  'EN_ATTENTE_VALIDATION', 'VERIFIE', 'SUSPENDU', 'BROUILLON', 'ARCHIVE',
];

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams?: { statut?: string };
}): Promise<React.ReactElement> {
  const cookieStore = cookies();
  const token = cookieStore.get('nest_access')?.value ?? '';

  const rawStatut = searchParams?.statut;

  // 'PENDING' is a virtual tab combining EN_ATTENTE_VALIDATION + BROUILLON
  const isPending =
    !rawStatut ||
    rawStatut === 'PENDING' ||
    rawStatut === 'EN_ATTENTE_VALIDATION';

  let vehicles: Awaited<ReturnType<typeof fetchAdminVehicles>> = [];
  try {
    if (isPending) {
      vehicles = await fetchAdminVehicles(token, 'PENDING');
    } else if (rawStatut === 'ALL') {
      vehicles = await fetchAdminVehicles(token);
    } else if (VALID_STATUTS.includes(rawStatut as VehicleStatus)) {
      vehicles = await fetchAdminVehicles(token, rawStatut as VehicleStatus);
    } else {
      vehicles = await fetchAdminVehicles(token);
    }
  } catch {
    // API non disponible — affiche empty state
  }

  const currentStatut: TabValue = isPending
    ? 'PENDING'
    : rawStatut === 'ALL'
    ? 'ALL'
    : (rawStatut as VehicleStatus) ?? 'PENDING';

  const pendingCount = vehicles.filter(
    (v) => v.statut === 'EN_ATTENTE_VALIDATION' || v.statut === 'BROUILLON',
  ).length;

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Retour
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
            <Car className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Véhicules à valider
            </h1>
            <p className="text-[13px] font-medium text-black/40">
              {pendingCount > 0
                ? `${pendingCount} véhicule${pendingCount > 1 ? 's' : ''} en attente de validation`
                : 'Aucun véhicule en attente'}
            </p>
          </div>
        </div>
      </div>

      <AdminVehiclesList
        vehicles={vehicles}
        currentStatut={currentStatut}
      />
    </div>
  );
}
