'use client';

import React from 'react';
import {
  Fuel, Settings2, Users, CalendarDays, UserCheck,
  MapPinned, ShieldCheck, FileText,
  Snowflake, Navigation, Bluetooth, Camera, Baby, Disc3, Armchair, Gauge,
  CheckCircle2, Hash, Truck, Globe, MapPin, Layers, Shield,
  CreditCard, Banknote, Wallet,
} from 'lucide-react';

import type { Vehicle } from '@/lib/nestjs/vehicles';

interface Props { vehicle: Vehicle }

/* ── Quick stats bar (horizontal strip) ──────────────────────── */
function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white px-2 py-4 text-center shadow-sm">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
        <Icon className="w-4.5 h-4.5 text-emerald-600" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[13px] font-black text-slate-900 leading-tight">{value}</p>
        <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
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
    <div className="flex items-start justify-between gap-3 py-3.5 border-b border-slate-50 last:border-0 min-w-0">
      <div className="flex items-center gap-3 shrink-0">
        <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
        </span>
        <span className="text-[13.5px] font-semibold text-slate-700 whitespace-nowrap">{label}</span>
      </div>
      <span className="text-[13.5px] font-bold text-slate-900 text-right break-words min-w-0">{value}</span>
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

      {/* Quick stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {fuelLabel && <QuickStat icon={Fuel} label="Carburant" value={fuelLabel} />}
        {transLabel && <QuickStat icon={Settings2} label="Boîte" value={transLabel} />}
        {vehicle.nombrePlaces && <QuickStat icon={Users} label="Places" value={`${vehicle.nombrePlaces}`} />}
        {vehicle.joursMinimum && <QuickStat icon={CalendarDays} label="Durée min." value={`${vehicle.joursMinimum}j`} />}
        {vehicle.ageMinimum && <QuickStat icon={UserCheck} label="Âge min." value={`${vehicle.ageMinimum} ans`} />}
      </div>

      {/* ── Payment Options Cards (Premium) ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900">Options de paiement au choix</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Total 100% */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5 text-emerald-600" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-black text-slate-900">Payer 100% en ligne</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    Instantané
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                  Réglez l&apos;intégralité de la location en ligne. Confirmation immédiate et aucun règlement supplémentaire lors du départ.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Acompte 30% */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Banknote className="w-5 h-5 text-amber-600" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-black text-slate-900">Acompte 30% + Solde</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    Flexible
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                  Bloquez le véhicule avec seulement 30% d&apos;acompte. Réglez les 70% restants au propriétaire lors de la remise des clés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important vehicle info */}
      <div className="rounded-2xl border border-slate-100 bg-white px-4 pt-1 pb-1">
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
            label="Localisation" 
            value={ZONES_LABELS[vehicle.ville as string] || vehicle.ville || "Dakar"} 
          />
        )}
        {vehicle.immatriculation && (
          <SpecRow icon={Hash} label="Immatriculation" value={vehicle.immatriculation} />
        )}
        {vehicle.fraisLivraison && (
          <SpecRow icon={Truck} label="Livraison disponible" value={`+${Number(vehicle.fraisLivraison).toLocaleString('fr-FR')} FCFA`} />
        )}
        {/* Zone de conduite (toujours affichée) */}
        <SpecRow 
          icon={Globe} 
          label="Zone de conduite" 
          value={vehicle.autoriseHorsDakar 
            ? `Hors Dakar autorisé${vehicle.supplementHorsDakarParJour ? ` (+${Number(vehicle.supplementHorsDakarParJour).toLocaleString('fr-FR')} FCFA/j)` : ''}`
            : (vehicle.zoneConduite || "Dakar uniquement")
          } 
        />
        {(vehicle.tarifsProgressifs?.length ?? 0) > 0 && (
          <SpecRow 
            icon={CheckCircle2} 
            label="Tarification" 
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
            {/* Supprimé ici car affiché en haut pour plus de visibilité */}
            {vehicle.assurance && (
              <SpecRow 
                icon={ShieldCheck} 
                label="Assurance" 
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
              <SpecRow icon={FileText} label="Règles spécifiques" value={vehicle.reglesSpecifiques} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}