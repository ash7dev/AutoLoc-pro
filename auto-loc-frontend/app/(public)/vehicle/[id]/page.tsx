import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchVehicle, type Vehicle } from '@/lib/nestjs/vehicles';
import { VehicleDetailHero } from '@/features/vehicles/components/VehicleDetailHero';
import { VehicleDetailSpecs } from '@/features/vehicles/components/VehicleDetailSpecs';
import { VehiclePricingTable } from '@/features/vehicles/components/VehiclePricingTable';
import { ReservationSidebar } from '@/features/vehicles/components/ReservationSidebar';
import { Footer } from '@/features/landing/Footer';

interface PageProps {
    params: { id: string };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    let vehicle: Vehicle | null = null;
    try {
        vehicle = await fetchVehicle(params.id);
    } catch {
        return { title: 'Véhicule introuvable — AutoLoc' };
    }

    const title = `${vehicle.marque} ${vehicle.modele} ${vehicle.annee} — Location à ${vehicle.ville} | AutoLoc`;
    const description = `Louez une ${vehicle.marque} ${vehicle.modele} à ${vehicle.ville} dès ${vehicle.prixParJour.toLocaleString('fr-FR')} FCFA/jour. Véhicule vérifié sur AutoLoc.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: vehicle.photos?.[0]?.url ? [vehicle.photos[0].url] : [],
        },
    };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VehicleDetailPage({ params }: PageProps) {
    let vehicle: Vehicle;
    try {
        vehicle = await fetchVehicle(params.id);
    } catch {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 lg:px-8">
                {/* Hero + Sidebar layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column: hero + details */}
                    <div className="flex-1 min-w-0 space-y-8">
                        <VehicleDetailHero vehicle={vehicle} />
                        <VehicleDetailSpecs vehicle={vehicle} />
                        <VehiclePricingTable
                            prixParJour={Number(vehicle.prixParJour)}
                            tiers={vehicle.tarifsProgressifs ?? []}
                        />

                        {/* Owner info section */}
                        <div className="space-y-3">
                            <h2 className="text-[16px] font-black tracking-tight text-black">
                                Informations supplémentaires
                            </h2>
                            <div className="rounded-xl bg-slate-50/60 border border-slate-100 p-5 space-y-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                                        <span className="text-white text-[14px] font-bold">P</span>
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-semibold text-black">Propriétaire vérifié</p>
                                        <p className="text-[12px] text-black/40">Membre AutoLoc</p>
                                    </div>
                                </div>
                                <p className="text-[13px] text-black/50 leading-relaxed">
                                    Ce véhicule a été inspecté et validé par notre équipe.
                                    Le propriétaire est vérifié et dispose d&apos;un KYC valide.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right column: reservation sidebar */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <ReservationSidebar
                            vehicleId={vehicle.id}
                            prixParJour={Number(vehicle.prixParJour)}
                            joursMinimum={vehicle.joursMinimum ?? 1}
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
