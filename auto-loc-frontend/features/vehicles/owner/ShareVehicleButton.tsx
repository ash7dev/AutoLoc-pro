'use client';

import React, { useState } from 'react';
import { Share2, Sparkles } from 'lucide-react';
import type { Vehicle } from '@/lib/nestjs/vehicles';
import { ShareStoryModal } from './ShareStoryModal';

interface ShareVehicleButtonProps {
    vehicleId?: string;
    marque?: string;
    modele?: string;
    vehicle?: Vehicle;
    variant?: 'default' | 'icon' | 'badge' | 'dropdown';
    className?: string;
}

export function ShareVehicleButton({
    vehicleId,
    marque,
    modele,
    vehicle: inputVehicle,
    variant = 'default',
    className = '',
}: ShareVehicleButtonProps) {
    const [modalOpen, setModalOpen] = useState(false);

    // Construct minimal vehicle fallback if only basic props are passed
    const targetVehicle: Vehicle = inputVehicle ?? {
        id: vehicleId || '',
        marque: marque || 'Véhicule',
        modele: modele || '',
        annee: new Date().getFullYear(),
        prixParJour: 0,
        ville: 'Dakar',
        statut: 'VERIFIE',
        description: '',
        proprietaireId: '',
        immatriculation: '',
        latitude: null,
        longitude: null,
        adresse: 'Dakar',
        joursMinimum: 1,
        ageMinimum: 18,
        zoneConduite: null,
        assurance: null,
        carburantCondition: null,
        reglesSpecifiques: null,
        fraisLivraison: null,
        type: 'BERLINE',
        carburant: null,
        transmission: null,
        nombrePlaces: 5,
        note: 5,
        totalAvis: 0,
        totalLocations: 0,
        creeLe: new Date().toISOString(),
        misAJourLe: new Date().toISOString(),
        photos: [],
        tarifsProgressifs: [],
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setModalOpen(true);
                }}
                title="Partager en Story WhatsApp / Insta"
                className={className || (
                    variant === 'icon'
                        ? "w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                        : "w-9 h-9 sm:w-auto sm:px-3.5 rounded-xl border border-slate-200 bg-white inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:bg-emerald-50/60 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm"
                )}
            >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                <span className="hidden sm:inline">Story & Partage</span>
            </button>

            <ShareStoryModal
                vehicle={targetVehicle}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
