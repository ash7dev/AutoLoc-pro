'use client';

/* ════════════════════════════════════════════════════════════════
   VehicleDetailSpecs — 2026 Ultra-Luxury Technical Panel
════════════════════════════════════════════════════════════════ */

import React from 'react';
import {
  Fuel, Settings2, Users, CalendarDays, UserCheck,
  ShieldCheck, FileText,
  Snowflake, Navigation, Bluetooth, Camera, Baby, Disc3, Armchair, Gauge,
  CheckCircle2, Hash, Truck, Globe, MapPin, Layers, Shield,
  CreditCard, Banknote, Wallet, Sparkles
} from 'lucide-react';

import type { Vehicle } from '@/lib/nestjs/vehicles';

interface Props { vehicle: Vehicle }

/* ── Quick Stat Card ── */
function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-center shadow-xs hover:border-emerald-300 hover:shadow-md transition-all duration-300">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 text-emerald-600">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </span>
      <div>
        <p className="text-[14px] font-black text-slate-900 leading-tight font-brand">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Spec Row ── */
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
    <div className="flex items-center justify-between gap-3 py-3.5 border-b border-slate-100 last:border-0 min-w-0">
      <div className="flex items-center gap-3 shrink-0">
        <span className="w-8.5 h-8.5 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center flex-shrink-0 text-emerald-600">
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        <span className="text-[13.5px] font-bold text-slate-700 whitespace-nowrap">{label}</span>
      </div>
      <span className="text-[14px] font-extrabold text-slate-900 text-right break-words min-w-0">{value}</span>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  CITADINE: 'Citadine', BERLINE: 'Berline', SUV: 'SUV', PICKUP: 'Pick-up', 
  MINIVAN: 'Minivan', UTILITAIRE: 'Utilitaire', LUXE: 'Luxe', FOUR_X_FOUR: '4x4',
  MONOSPACE: 'Monospace', MINIBUS: 'Minibus',
};

const FUEL_LABELS: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};

const ZONES_LABELS: Record<string, string> = {
  'almadies-ngor-mamelles': 'Almadies – Ngor – Mamelles',
  'ouakam-yoff': 'Ouakam – Yoff',
  'mermoz-sacrecoeur-ckg': 'Mermoz – Sacré-Cœur – CKG',
  'plateau-medina-gueuletapee': 'Plateau – Médina',
  'liberte-sicap-granddakar': 'Liberté – Sicap',
  'parcelles-grandyoff': 'Parcelles Assainies – Grand Yoff',
  'pikine-guediawaye': 'Pikine – Guédiawaye',
  'keurmassar-rufisque': 'Keur Massar – Rufisque',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUELLE: 'Manuelle', AUTOMATIQUE: 'Automatique',
};

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[20px] font-black tracking-tight text-slate-900 font-brand">Caractéristiques</h2>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {fuelLabel && <QuickStat icon={Fuel} label="Carburant" value={fuelLabel} />}
        {transLabel && <QuickStat icon={Settings2} label="Boîte" value={transLabel} />}
        {vehicle.nombrePlaces && <QuickStat icon={Users} label="Places" value={`${vehicle.nombrePlaces}`} />}
        {vehicle.joursMinimum && <QuickStat icon={CalendarDays} label="Durée min." value={`${vehicle.joursMinimum}j`} />}
        {vehicle.ageMinimum && <QuickStat icon={UserCheck} label="Âge min." value={`${vehicle.ageMinimum} ans`} />}
      </div>

      {/* ── Flexible Payment Choice Cards ── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Wallet className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
          <h3 className="text-[15px] font-extrabold text-slate-900 font-brand">Modalités de règlement disponibles</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: 100% online */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-white p-4.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                <CreditCard className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black text-slate-900">100% En Ligne</span>
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Instantané
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  Validation immédiate. Aucune transaction financière à effectuer lors de la remise des clés.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Acompte 30% */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50/80 via-white to-white p-4.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-slate-900/20">
                <Banknote className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-black text-slate-900">Acompte 30%</span>
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    Flexible
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                  Réservez avec 30% aujourd&apos;hui. Le solde de 70% est remis directement au propriétaire le jour J.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Specs Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-1">
        {(vehicle.types?.length || vehicle.type) && (
          <SpecRow
            icon={Layers}
            label="Catégorie"
            value={(vehicle.types?.length ? vehicle.types : [vehicle.type])
              .map((t) => TYPE_LABELS[t] || t)
              .join(" · ")}
          />
        )}
        {(vehicle.ville || vehicle.adresse) && (
          <SpecRow 
            icon={MapPin} 
            label="Zone principale" 
            value={ZONES_LABELS[vehicle.ville as string] || vehicle.ville || "Dakar"} 
          />
        )}
        {vehicle.immatriculation && (
          <SpecRow icon={Hash} label="Immatriculation" value={vehicle.immatriculation} />
        )}
        {vehicle.fraisLivraison && (
          <SpecRow icon={Truck} label="Livraison à domicile" value={`+${Number(vehicle.fraisLivraison).toLocaleString('fr-FR')} FCFA`} />
        )}
        <SpecRow 
          icon={Globe} 
          label="Périmètre de conduite" 
          value={vehicle.autoriseHorsDakar 
            ? `Hors Dakar autorisé${vehicle.supplementHorsDakarParJour ? ` (+${Number(vehicle.supplementHorsDakarParJour).toLocaleString('fr-FR')} FCFA/j)` : ''}`
            : (vehicle.zoneConduite || "Dakar uniquement")
          } 
        />
        {(vehicle.tarifsProgressifs?.length ?? 0) > 0 && (
          <SpecRow 
            icon={CheckCircle2} 
            label="Remises durées" 
            value={`${vehicle.tarifsProgressifs?.length} palier${(vehicle.tarifsProgressifs?.length ?? 0) > 1 ? 's' : ''} dégressif${(vehicle.tarifsProgressifs?.length ?? 0) > 1 ? 's' : ''}`}
          />
        )}
        {(vehicle.carteGriseUrl || vehicle.assuranceDocUrl) && (
          <SpecRow 
            icon={Shield} 
            label="Documents vérifiés" 
            value={`${vehicle.carteGriseUrl ? 'Carte grise' : ''}${vehicle.carteGriseUrl && vehicle.assuranceDocUrl ? ' + ' : ''}${vehicle.assuranceDocUrl ? 'Assurance' : ''}`}
          />
        )}
      </div>

      {/* Equipment Badges Grid */}
      {equipmentNames.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[16px] font-extrabold text-slate-900 font-brand">Équipements & Options de bord</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {equipmentNames.map((name) => {
              const Icon = EQUIPMENT_ICONS[name] ?? CheckCircle2;
              return (
                <div
                  key={name}
                  className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-3 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 min-w-0"
                >
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-2xs">
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </span>
                  <span className="text-[12.5px] font-bold text-slate-800 leading-tight truncate">{name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditions Panel */}
      {(vehicle.zoneConduite || vehicle.assurance || vehicle.reglesSpecifiques) && (
        <div className="space-y-3">
          <h3 className="text-[16px] font-extrabold text-slate-900 font-brand">Règles & Conditions particulières</h3>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-1">
            {vehicle.assurance && (
              <SpecRow 
                icon={ShieldCheck} 
                label="Assurance véhicule" 
                value={vehicle.assurance} 
              />
            )}
            {vehicle.carburantCondition && (
              <SpecRow 
                icon={Fuel} 
                label="Politique carburant" 
                value={vehicle.carburantCondition} 
              />
            )}
            {vehicle.reglesSpecifiques && (
              <SpecRow icon={FileText} label="Règles du propriétaire" value={vehicle.reglesSpecifiques} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}