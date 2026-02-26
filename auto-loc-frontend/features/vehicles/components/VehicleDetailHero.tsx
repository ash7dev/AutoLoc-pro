'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    MapPin, Star, Shield, ChevronLeft, ChevronRight,
    Car, Share2, Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { TYPE_LABELS, formatPrice } from '@/features/vehicles/owner/vehicle-helpers';

interface Props {
    vehicle: Vehicle;
}

export function VehicleDetailHero({ vehicle }: Props): React.ReactElement {
    const photos = vehicle.photos ?? [];
    const [activeIndex, setActiveIndex] = useState(0);
    const activePhoto = photos[activeIndex]?.url ?? null;

    const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : photos.length - 1));
    const next = () => setActiveIndex((i) => (i < photos.length - 1 ? i + 1 : 0));

    return (
        <div className="space-y-5">
            {/* Main photo */}
            <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2.4/1] w-full overflow-hidden rounded-2xl bg-slate-100">
                {activePhoto ? (
                    <Image
                        src={activePhoto}
                        alt={`${vehicle.marque} ${vehicle.modele}`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Car className="h-16 w-16 text-slate-300" strokeWidth={1.2} />
                    </div>
                )}

                {/* Navigation arrows */}
                {photos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-black" />
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-black" />
                        </button>
                    </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    {vehicle.statut === 'VERIFIE' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-sm px-3 py-1.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Vérifié</span>
                        </span>
                    )}
                </div>

                {/* Photo counter */}
                {photos.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <span className="text-[12px] font-semibold text-white tabular-nums">
                            {activeIndex + 1} / {photos.length}
                        </span>
                    </div>
                )}

                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button type="button" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all">
                        <Share2 className="w-4 h-4 text-black" strokeWidth={2} />
                    </button>
                    <button type="button" className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all">
                        <Heart className="w-4 h-4 text-black" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {photos.map((photo, i) => (
                        <button
                            key={photo.id}
                            type="button"
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                'relative flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200',
                                i === activeIndex
                                    ? 'border-emerald-400 shadow-md shadow-emerald-400/20'
                                    : 'border-transparent opacity-60 hover:opacity-100',
                            )}
                        >
                            <Image src={photo.url} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Title + meta */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-black/30">
                        {TYPE_LABELS[vehicle.type] ?? vehicle.type}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black mt-0.5">
                        {vehicle.marque}{' '}
                        <span className="text-emerald-500">{vehicle.modele}</span>
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-black/50">
                            <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                            {vehicle.ville}{vehicle.adresse ? `, ${vehicle.adresse}` : ''}
                        </span>
                        {vehicle.note > 0 && (
                            <span className="flex items-center gap-1 text-[13px] font-bold text-black">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                                {vehicle.note.toFixed(1)}
                                <span className="font-medium text-black/40">({vehicle.totalAvis} avis)</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-emerald-500 tabular-nums">
                        {formatPrice(vehicle.prixParJour)} <span className="text-sm font-semibold text-black/30">FCFA/jour</span>
                    </p>
                    <p className="text-[12px] text-black/40 mt-0.5">{vehicle.annee} · {vehicle.totalLocations} locations</p>
                </div>
            </div>
        </div>
    );
}
