'use client';

import React from 'react';
import {
    Fuel, Settings2, Users, CalendarDays, UserCheck,
    MapPinned, ShieldCheck, FileText,
} from 'lucide-react';
import type { Vehicle } from '@/lib/nestjs/vehicles';

interface Props {
    vehicle: Vehicle;
}

function SpecItem({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number | null | undefined;
}) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-black/40" strokeWidth={1.75} />
            </span>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{label}</p>
                <p className="text-[14px] font-semibold text-black mt-0.5">{value}</p>
            </div>
        </div>
    );
}

const FUEL_LABELS: Record<string, string> = {
    ESSENCE: 'Essence',
    DIESEL: 'Diesel',
    HYBRIDE: 'Hybride',
    ELECTRIQUE: 'Électrique',
};

const TRANSMISSION_LABELS: Record<string, string> = {
    MANUELLE: 'Manuelle',
    AUTOMATIQUE: 'Automatique',
};

export function VehicleDetailSpecs({ vehicle }: Props): React.ReactElement {
    return (
        <div className="space-y-4">
            <h2 className="text-[16px] font-black tracking-tight text-black">
                Caractéristiques
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <SpecItem icon={Fuel} label="Carburant" value={vehicle.carburant ? FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant : null} />
                <SpecItem icon={Settings2} label="Transmission" value={vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission : null} />
                <SpecItem icon={Users} label="Places" value={vehicle.nombrePlaces ? `${vehicle.nombrePlaces} places` : null} />
                <SpecItem icon={CalendarDays} label="Durée minimum" value={`${vehicle.joursMinimum} jour${vehicle.joursMinimum > 1 ? 's' : ''}`} />
                <SpecItem icon={UserCheck} label="Âge minimum" value={`${vehicle.ageMinimum} ans`} />
                <SpecItem icon={MapPinned} label="Zone de conduite" value={vehicle.zoneConduite} />
                <SpecItem icon={ShieldCheck} label="Assurance" value={vehicle.assurance} />
                <SpecItem icon={FileText} label="Règles" value={vehicle.reglesSpecifiques} />
            </div>
        </div>
    );
}
