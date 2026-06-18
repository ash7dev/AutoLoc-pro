import React from 'react';
import { searchVehicles, type VehicleSearchResult, type Vehicle } from '@/lib/nestjs/vehicles';
import { ExplorerVehicleCard } from '@/features/explorer/ExplorerVehicleCard';

interface SimilarVehiclesProps {
    currentVehicle: Vehicle;
}

export async function SimilarVehicles({ currentVehicle }: SimilarVehiclesProps) {
    let similarVehicles: VehicleSearchResult[] = [];

    try {
        // Lancer les deux recherches en parallèle : par type+ville et par ville seule
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
        <section className="mt-24 mb-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                    Véhicules similaires à {currentVehicle.ville}
                </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarVehicles.map((vehicle) => (
                    <ExplorerVehicleCard key={vehicle.id} vehicle={vehicle as any} />
                ))}
            </div>
        </section>
    );
}
