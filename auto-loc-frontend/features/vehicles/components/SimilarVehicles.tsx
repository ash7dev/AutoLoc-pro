import React from 'react';
import { searchVehicles, type VehicleSearchResult, type Vehicle } from '@/lib/nestjs/vehicles';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';

interface SimilarVehiclesProps {
  currentVehicle: Vehicle;
}

export async function SimilarVehicles({ currentVehicle }: SimilarVehiclesProps) {
  let similarVehicles: VehicleSearchResult[] = [];

  try {
    const [typeRes, cityRes] = await Promise.all([
      searchVehicles({ ville: currentVehicle.ville, type: currentVehicle.type }),
      searchVehicles({ ville: currentVehicle.ville }),
    ]);

    const byType = (typeRes?.data ?? []).filter((v) => v.id !== currentVehicle.id);
    const byCity = (cityRes?.data ?? []).filter(
      (v) => v.id !== currentVehicle.id && !byType.find((sv) => sv.id === v.id),
    );
    similarVehicles = [...byType, ...byCity].slice(0, 3);
  } catch (err) {
    console.error('Failed to fetch similar vehicles:', err);
  }

  if (similarVehicles.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 mb-12 pt-8 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[24px] lg:text-[30px] font-black text-slate-900 tracking-tight font-editorial">
            Véhicules similaires disponibles à <span className="text-emerald-600 font-extrabold">{currentVehicle.ville}</span>
          </h2>
          <p className="text-[13px] font-semibold text-slate-500 mt-1">
            Découvrez d&apos;autres options haut de gamme sélectionnées pour vous
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle as any} variant="standard" />
        ))}
      </div>
    </section>
  );
}
