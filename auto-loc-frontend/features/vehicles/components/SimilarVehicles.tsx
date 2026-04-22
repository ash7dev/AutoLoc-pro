import React from 'react';
import { searchVehicles, type VehicleSearchResult, type Vehicle } from '@/lib/nestjs/vehicles';
import { ExplorerVehicleCard } from '@/features/explorer/ExplorerVehicleCard';

interface SimilarVehiclesProps {
    currentVehicle: Vehicle;
}

export async function SimilarVehicles({ currentVehicle }: SimilarVehiclesProps) {
    let similarVehicles: VehicleSearchResult[] = [];

    try {
        // On cherche des véhicules dans la même ville et idéalement du même type
        const res = await searchVehicles({
            ville: currentVehicle.ville,
            type: currentVehicle.type,
        });

        if (res && Array.isArray(res.data)) {
            // On exclut le véhicule actuel et on prend les 3 premiers
            similarVehicles = res.data
                .filter((v) => v.id !== currentVehicle.id)
                .slice(0, 3);
        }

        // Si on n'en trouve pas assez avec le même type, on élargit juste à la ville
        if (similarVehicles.length < 3) {
            const fallbackRes = await searchVehicles({
                ville: currentVehicle.ville,
            });
            if (fallbackRes && Array.isArray(fallbackRes.data)) {
                const newVehicles = fallbackRes.data
                    .filter((v) => v.id !== currentVehicle.id && !similarVehicles.find(sv => sv.id === v.id));
                
                similarVehicles = [...similarVehicles, ...newVehicles].slice(0, 3);
            }
        }
    } catch (err) {
        console.error("Failed to fetch similar vehicles:", err);
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
