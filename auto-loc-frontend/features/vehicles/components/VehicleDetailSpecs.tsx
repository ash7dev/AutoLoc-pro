'use client';

import React from 'react';
import {
  Fuel, Settings2, Users, CalendarDays, UserCheck,
  MapPinned, ShieldCheck, FileText,
  Snowflake, Navigation, Bluetooth, Camera, Baby, Disc3, Armchair, Gauge,
  CheckCircle2,
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
      'shrink-0 w-[88px]',
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

/* ── Equipment icon mapping ──────────────────────────────────── */
const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  'Climatisation': Snowflake,
  'GPS': Navigation,
  'Bluetooth': Bluetooth,
  'Caméra de recul': Camera,
  'Siège bébé': Baby,
  'Roue de secours': Disc3,
  'Sièges cuir': Armchair,
  'Régulateur de vitesse': Gauge,
  'Radar de stationnement': Gauge,
};

/* ── Friendly labels for raw enum names ─────────────────────── */
const EQUIPMENT_LABELS: Record<string, string> = {
  'CLIMATISATION': 'Climatisation',
  'GPS': 'GPS',
  'BLUETOOTH': 'Bluetooth',
  'CAMERA_RECUL': 'Caméra de recul',
  'SIEGE_BEBE': 'Siège bébé',
  'ROUE_SECOURS': 'Roue de secours',
  'SIEGES_CUIR': 'Sièges cuir',
  'REGULATEUR_VITESSE': 'Régulateur de vitesse',
  'RADAR_STATIONNEMENT': 'Radar de stationnement',
  'TOIT_OUVRANT': 'Toit ouvrant',
  'VITRES_TEINTEES': 'Vitres teintées',
  'AIDE_STATIONNEMENT': 'Aide au stationnement',
  'DEMARRAGE_SANS_CLE': 'Démarrage sans clé',
  'CRUISE_CONTROL': 'Cruise control',
};

/* ── Helper: extract equipment names from the API response ──── */
function getEquipmentNames(vehicle: Vehicle): string[] {
  if (!vehicle.equipements || vehicle.equipements.length === 0) return [];
  const first = vehicle.equipements[0];
  if (typeof first === 'string') {
    return (vehicle.equipements as string[]).map(name =>
      EQUIPMENT_LABELS[name] ?? name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).toLowerCase().replace(/^./, c => c.toUpperCase())
    );
  }
  return (vehicle.equipements as { equipement: { id: string; nom: string } }[]).map(e => {
    const raw = e.equipement.nom;
    return EQUIPMENT_LABELS[raw] ?? raw;
  });
}

export function VehicleDetailSpecs({ vehicle }: Props): React.ReactElement {
  const fuelLabel = vehicle.carburant ? (FUEL_LABELS[vehicle.carburant] ?? vehicle.carburant) : null;
  const transLabel = vehicle.transmission ? (TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission) : null;
  const equipmentNames = getEquipmentNames(vehicle);

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

      {/* Equipment grid */}
      {equipmentNames.length > 0 && (
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-3">Équipements</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {equipmentNames.map((name) => {
              const Icon = EQUIPMENT_ICONS[name] ?? CheckCircle2;
              return (
                <div
                  key={name}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/50 min-w-0"
                >
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                  </span>
                  <span className="text-[12px] font-semibold text-slate-700 leading-tight truncate">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditions / rules */}
      {(vehicle.zoneConduite || vehicle.assurance || vehicle.reglesSpecifiques) && (
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-3">Conditions de location</h3>
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
        </div>
      )}
    </div>
  );
}