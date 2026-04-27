import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { fetchVehicle, fetchBlockedDates, type Vehicle } from '@/lib/nestjs/vehicles';
import { VehicleDetailHero } from '@/features/vehicles/components/VehicleDetailHero';
import { VehicleDetailSpecs } from '@/features/vehicles/components/VehicleDetailSpecs';
import { VehiclePricingTable } from '@/features/vehicles/components/VehiclePricingTable';
import { VehicleOwnerCard, MobileReservationBar } from '@/features/vehicles/components/VehicleOwnerCard';
import { ReservationSidebar } from '@/features/vehicles/components/ReservationSidebar';
import { VehicleReviews } from '@/features/vehicles/components/VehicleReviews';
import { SimilarVehicles } from '@/features/vehicles/components/SimilarVehicles';
import { fetchUserReviews } from '@/lib/nestjs/reviews';
import { Footer } from '@/features/landing/Footer';
import { Skeleton } from '@/components/ui/skeleton';

/** ISR — revalidate every 60 seconds */
export const revalidate = 60;

interface PageProps { params: { id: string } }

// Optimized metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const vehicle = await fetchVehicle(params.id);
        const title = `${vehicle.marque} ${vehicle.modele} ${vehicle.annee} — Location à ${vehicle.ville} | AutoLoc`;
        const description = `Louez une ${vehicle.marque} ${vehicle.modele} à ${vehicle.ville} dès ${vehicle.prixParJour.toLocaleString('fr-FR')} FCFA/jour.`;
        return {
            title, description,
            openGraph: { title, description, images: vehicle.photos?.[0]?.url ? [vehicle.photos[0].url] : [] },
        };
    } catch {
        return { title: 'Véhicule introuvable — AutoLoc' };
    }
}

// Sub-component for parallelized reviews
async function ReviewsWrapper({ ownerId }: { ownerId: string }) {
    const reviewsData = await fetchUserReviews(ownerId).catch(() => null);
    return <VehicleReviews reviewsData={reviewsData} />;
}

export default async function VehicleDetailPage({ params }: PageProps) {
    let vehicle: Vehicle;
    let blockedRanges: any[] = [];
    
    try {
        // Parallel fetch for vehicle data and blocked dates
        const [vResult, bResult] = await Promise.allSettled([
            fetchVehicle(params.id),
            fetchBlockedDates(params.id)
        ]);
        
        if (vResult.status === 'rejected') throw vResult.reason;
        
        vehicle = vResult.value;
        if (bResult.status === 'fulfilled') {
            blockedRanges = bResult.value.blockedRanges;
        }
    } catch { 
        notFound(); 
    }

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
                <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">

                    {/* ── Left column ─────────────────────────────────── */}
                    <div className="space-y-8 min-w-0">
                        <VehicleDetailHero vehicle={vehicle} />
                        <div className="border-t border-slate-100" />
                        <VehicleDetailSpecs vehicle={vehicle} />

                        {(vehicle.tarifsProgressifs?.length ?? 0) > 0 && (
                            <>
                                <div className="border-t border-slate-100" />
                                <VehiclePricingTable
                                    prixParJour={Number(vehicle.prixParJour)}
                                    tiers={vehicle.tarifsProgressifs ?? []}
                                />
                            </>
                        )}

                        <div className="border-t border-slate-100" />
                        <VehicleOwnerCard vehicle={vehicle} />

                        {/* Streamed Reviews */}
                        <Suspense fallback={<Skeleton className="h-40 w-full rounded-2xl bg-slate-50" />}>
                            {vehicle.proprietaireId && <ReviewsWrapper ownerId={vehicle.proprietaireId} />}
                        </Suspense>
                    </div>

                    {/* ── Right column: sidebar (desktop only) ──────── */}
                    <div className="hidden lg:block lg:sticky lg:top-[88px]">
                        <ReservationSidebar
                            vehicleId={vehicle.id}
                            prixParJour={Number(vehicle.prixParJour)}
                            joursMinimum={vehicle.joursMinimum ?? 1}
                            ageMinimum={vehicle.ageMinimum ?? undefined}
                            fraisLivraison={vehicle.fraisLivraison != null ? Number(vehicle.fraisLivraison) : null}
                            autoriseHorsDakar={vehicle.autoriseHorsDakar ?? false}
                            supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour != null ? Number(vehicle.supplementHorsDakarParJour) : null}
                            blockedRanges={blockedRanges}
                        />
                    </div>
                </div>
                
                {/* Streamed Similar Vehicles */}
                <Suspense fallback={<div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>}>
                    <SimilarVehicles currentVehicle={vehicle} />
                </Suspense>
            </div>

            {/* ── Mobile sticky bottom CTA ─────────────────────────── */}
            <MobileReservationBar
                vehicleId={vehicle.id}
                prixParJour={Number(vehicle.prixParJour)}
                joursMinimum={vehicle.joursMinimum ?? 1}
                ageMinimum={vehicle.ageMinimum ?? undefined}
                fraisLivraison={vehicle.fraisLivraison != null ? Number(vehicle.fraisLivraison) : null}
                autoriseHorsDakar={vehicle.autoriseHorsDakar ?? false}
                supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour != null ? Number(vehicle.supplementHorsDakarParJour) : null}
                blockedRanges={blockedRanges}
            />

            <Footer />
        </main>
    );
}
