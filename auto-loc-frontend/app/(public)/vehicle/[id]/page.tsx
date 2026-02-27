import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { fetchVehicle, type Vehicle } from '@/lib/nestjs/vehicles';
import { VehicleDetailHero } from '@/features/vehicles/components/VehicleDetailHero';
import { VehicleDetailSpecs } from '@/features/vehicles/components/VehicleDetailSpecs';
import { VehiclePricingTable } from '@/features/vehicles/components/VehiclePricingTable';
import { VehicleOwnerCard, MobileReservationBar } from '@/features/vehicles/components/VehicleOwnerCard';
import { ReservationSidebar } from '@/features/vehicles/components/ReservationSidebar';
import { Footer } from '@/features/landing/Footer';

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    let vehicle: Vehicle | null = null;
    try { vehicle = await fetchVehicle(params.id); } catch {
        return { title: 'Véhicule introuvable — AutoLoc' };
    }
    const title = `${vehicle.marque} ${vehicle.modele} ${vehicle.annee} — Location à ${vehicle.ville} | AutoLoc`;
    const description = `Louez une ${vehicle.marque} ${vehicle.modele} à ${vehicle.ville} dès ${vehicle.prixParJour.toLocaleString('fr-FR')} FCFA/jour.`;
    return {
        title, description,
        openGraph: { title, description, images: vehicle.photos?.[0]?.url ? [vehicle.photos[0].url] : [] },
    };
}

export default async function VehicleDetailPage({ params }: PageProps) {
    let vehicle: Vehicle;
    try { vehicle = await fetchVehicle(params.id); } catch { notFound(); }

    return (
        <main className="min-h-screen bg-white">
            {/* ── Breadcrumb ──────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
                <Link
                    href="/explorer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors duration-150"
                >
                    <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                    Retour aux véhicules
                </Link>
            </div>

            {/* ── Main content ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-16">

                {/* Desktop: hero full-width above sidebar */}
                <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">

                    {/* ── Left column ─────────────────────────────────── */}
                    <div className="space-y-8 min-w-0">

                        {/* Hero gallery + title */}
                        <VehicleDetailHero vehicle={vehicle} />

                        {/* Divider */}
                        <div className="border-t border-slate-100" />

                        {/* Specs */}
                        <VehicleDetailSpecs vehicle={vehicle} />

                        {/* Pricing */}
                        {(vehicle.tarifsProgressifs?.length ?? 0) > 0 && (
                            <>
                                <div className="border-t border-slate-100" />
                                <VehiclePricingTable
                                    prixParJour={Number(vehicle.prixParJour)}
                                    tiers={vehicle.tarifsProgressifs ?? []}
                                />
                            </>
                        )}

                        {/* Owner card */}
                        <div className="border-t border-slate-100" />
                        <VehicleOwnerCard vehicle={vehicle} />
                    </div>

                    {/* ── Right column: sidebar (desktop only) ──────── */}
                    <div className="hidden lg:block lg:sticky lg:top-[88px]">
                        <ReservationSidebar
                            vehicleId={vehicle.id}
                            prixParJour={Number(vehicle.prixParJour)}
                            joursMinimum={vehicle.joursMinimum ?? 1}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile sticky bottom CTA ─────────────────────────── */}
            <MobileReservationBar
                vehicleId={vehicle.id}
                prixParJour={Number(vehicle.prixParJour)}
                joursMinimum={vehicle.joursMinimum ?? 1}
            />

            <Footer />
        </main>
    );
}
