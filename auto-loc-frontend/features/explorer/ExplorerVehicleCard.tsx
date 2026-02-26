'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    MapPin, Star, Users, ArrowRight,
    Fuel, Settings2, Clock, Zap, Car,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mainPhoto(vehicle: Vehicle): string | null {
    const main = vehicle.photos?.find((p) => p.estPrincipale);
    return main?.url ?? vehicle.photos?.[0]?.url ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ExplorerVehicleCardProps {
    vehicle: Vehicle;
}

export function ExplorerVehicleCard({ vehicle }: ExplorerVehicleCardProps): React.ReactElement {
    const photo = mainPhoto(vehicle);
    const isVerified = vehicle.statut === 'VERIFIE';
    const reservations = vehicle._count?.reservations ?? vehicle.totalLocations ?? 0;

    return (
        <Link
            href={`/vehicle/${vehicle.id}`}
            className={cn(
                'group relative flex flex-col bg-white rounded-2xl border border-slate-100',
                'shadow-sm shadow-slate-200/60',
                'hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 hover:border-slate-200',
                'transition-all duration-300 overflow-hidden',
            )}
        >
            {/* Photo */}
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {photo ? (
                    <Image
                        src={photo}
                        alt={`Location ${vehicle.marque} ${vehicle.modele} à ${vehicle.ville}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Car className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                )}

                {/* Gradient overlay on hover */}
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent',
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    )}
                />

                {/* Top-left badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black border border-emerald-400/30 px-2.5 py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                Vérifié
                            </span>
                        </span>
                    )}
                    {reservations >= 5 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1">
                            <Zap className="h-2.5 w-2.5 text-amber-400" strokeWidth={2.5} />
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                Populaire
                            </span>
                        </span>
                    )}
                </div>

                {/* Price badge bottom-right */}
                <div className="absolute bottom-3 right-3 rounded-xl bg-black/75 backdrop-blur-sm px-3 py-2 text-right">
                    {vehicle.tarifsProgressifs?.length > 0 ? (
                        <>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mb-0.5">
                                À partir de
                            </p>
                            <p className="text-[17px] font-black text-emerald-400 leading-none tabular-nums">
                                {formatPrice(Math.min(...vehicle.tarifsProgressifs.map((t) => Number(t.prix))))}
                            </p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-0.5">
                                FCFA / jour
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-[17px] font-black text-emerald-400 leading-none tabular-nums">
                                {formatPrice(vehicle.prixParJour)}
                            </p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-wide mt-0.5">
                                FCFA / jour
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-3">
                {/* Type + city */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-widest text-black/30">
                        {TYPE_LABELS[vehicle.type] ?? vehicle.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-black/35">
                        <MapPin className="h-3 w-3" strokeWidth={2} />
                        {vehicle.ville}
                    </span>
                </div>

                {/* Brand + model */}
                <div>
                    <h3 className="text-[16px] font-black tracking-tight text-black leading-tight">
                        {vehicle.marque}{' '}
                        <span className="text-emerald-500">{vehicle.modele}</span>
                    </h3>
                    <p className="text-[12px] font-medium text-black/35 mt-0.5">
                        {vehicle.annee}
                        {vehicle.transmission && ` · ${vehicle.transmission}`}
                    </p>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3 flex-wrap">
                    {vehicle.carburant && (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-black/50">
                            <Fuel className="h-3.5 w-3.5 text-black/25" strokeWidth={1.75} />
                            {vehicle.carburant}
                        </span>
                    )}
                    {vehicle.nombrePlaces && (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-black/50">
                            <Users className="h-3.5 w-3.5 text-black/25" strokeWidth={1.75} />
                            {vehicle.nombrePlaces} places
                        </span>
                    )}
                    {vehicle.transmission && (
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-black/50">
                            <Settings2 className="h-3.5 w-3.5 text-black/25" strokeWidth={1.75} />
                            {vehicle.transmission}
                        </span>
                    )}
                </div>

                <div className="border-t border-slate-100" />

                {/* Footer */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        {vehicle.note > 0 && (
                            <span className="flex items-center gap-1 text-[12px] font-bold text-black">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                                {vehicle.note.toFixed(1)}
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] font-medium text-black/30">
                            <Clock className="h-3 w-3" strokeWidth={1.75} />
                            {vehicle.joursMinimum}j min.
                        </span>
                    </div>

                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl',
                            'bg-black px-3.5 py-2 text-[12px] font-semibold text-emerald-400',
                            'group-hover:bg-emerald-400 group-hover:text-black',
                            'transition-all duration-200 shadow-sm shadow-black/10',
                        )}
                    >
                        Réserver
                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
