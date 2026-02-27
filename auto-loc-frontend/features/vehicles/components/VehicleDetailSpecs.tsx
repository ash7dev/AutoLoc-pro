'use client';

import React from 'react';
import {
  Fuel, Settings2, Users, CalendarDays, UserCheck,
  MapPinned, ShieldCheck, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/nestjs/vehicles';

interface Props { vehicle: Vehicle }

/* ── Quick stats bar (horizontal strip) ──────────────────────── */
function QuickStat({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-1.5 px-4 py-4 text-center',
      'flex-1 min-w-[80px]',
    )}>
      <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50">
        <Icon className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[15px] font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-[11px] font-semibold text-slate-600 mt-0.5 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

/* ── Detail spec row ─────────────────────────────────────────── */
function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
        </span>
        <span className="text-[13.5px] font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-[13.5px] font-bold text-slate-900 text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}

const FUEL_LABELS: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};
const TRANSMISSION_LABELS: Record<string, string> = {
  MANUELLE: 'Manuelle', AUTOMATIQUE: 'Automatique',
};

export function VehicleDetailSpecs({ vehicle }: Props): React.ReactElement {
  const fuelLabel = vehicle.carburant ? (FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant) : null;
  const transLabel = vehicle.transmission ? (TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission) : null;

  return (
    <div className="space-y-5">
      <h2 className="text-[17px] font-black tracking-tight text-slate-900">Caractéristiques</h2>

      {/* Quick stats horizontal bar */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="flex divide-x divide-slate-100 overflow-x-auto scrollbar-none">
          {fuelLabel && (
            <QuickStat icon={Fuel} label="Carburant" value={fuelLabel} />
          )}
          {transLabel && (
            <QuickStat icon={Settings2} label="Boîte" value={transLabel} />
          )}
          {vehicle.nombrePlaces && (
            <QuickStat icon={Users} label="Places" value={`${vehicle.nombrePlaces}`} />
          )}
          {vehicle.joursMinimum && (
            <QuickStat
              icon={CalendarDays}
              label="Min."
              value={`${vehicle.joursMinimum}j`}
              accent
            />
          )}
          {vehicle.ageMinimum && (
            <QuickStat
              icon={UserCheck}
              label="Âge min."
              value={`${vehicle.ageMinimum} ans`}
            />
          )}
        </div>
      </div>

      {/* Detailed spec rows */}
      {(vehicle.zoneConduite || vehicle.assurance || vehicle.reglesSpecifiques) && (
        <div className="rounded-2xl border border-slate-100 bg-white px-4 pt-1 pb-1">
          {vehicle.zoneConduite && (
            <SpecRow icon={MapPinned} label="Zone de conduite" value={vehicle.zoneConduite} />
          )}
          {vehicle.assurance && (
            <SpecRow icon={ShieldCheck} label="Assurance incluse" value={vehicle.assurance} />
          )}
          {vehicle.reglesSpecifiques && (
            <SpecRow icon={FileText} label="Règles spécifiques" value={vehicle.reglesSpecifiques} />
          )}
        </div>
      )}
    </div>
  );
}