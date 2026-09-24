'use client';

import React from 'react';
import {
  Wind,
  Bluetooth,
  MapPin,
  Camera,
  Sun,
  Shield,
  Radio,
  Zap,
  Volume2,
  Check,
  Armchair,
  ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { VehiculeEquipement } from '../types/vehicle.types';

interface VehicleEquipmentsGridProps {
  equipements?: VehiculeEquipement[] | string[];
}

const INITIAL_VISIBLE = 12;

// Ordre important : les règles les plus spécifiques passent en premier
// (ex. « airbag » doit être reconnu avant « air »).
const ICON_RULES: { test: RegExp; icon: LucideIcon }[] = [
  { test: /airbag|\babs\b|securi|isofix|alarme|antivol/, icon: Shield },
  { test: /clim|air condition/, icon: Wind },
  { test: /bluetooth|carplay|android auto/, icon: Bluetooth },
  { test: /gps|navig/, icon: MapPin },
  { test: /camera|recul|radar|parking/, icon: Camera },
  { test: /toit|ouvrant|panoram/, icon: Sun },
  { test: /cuir|siege/, icon: Armchair },
  { test: /regul|limiteur|cruise|vitesse|usb|charge/, icon: Zap },
  { test: /audio|\bson\b|bose|jbl|sono|haut-parleur/, icon: Volume2 },
  { test: /radio|ecran|multimedia|tactile/, icon: Radio },
];

// Associe un équipement à une icône (accents et casse ignorés)
function getEquipmentIcon(name: string): LucideIcon {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return ICON_RULES.find((rule) => rule.test.test(normalized))?.icon ?? Check;
}

export function VehicleEquipmentsGrid({ equipements }: VehicleEquipmentsGridProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Extraction des noms d'équipements
  const equipmentNames: string[] = React.useMemo(() => {
    if (!equipements || equipements.length === 0) return [];
    return equipements
      .map((item) => {
        if (typeof item === 'string') return item;
        return item.equipement?.nom || '';
      })
      .filter(Boolean);
  }, [equipements]);

  if (equipmentNames.length === 0) {
    return null;
  }

  const total = equipmentNames.length;
  const isCollapsible = total > INITIAL_VISIBLE;
  const visibleNames =
    isCollapsible && !expanded ? equipmentNames.slice(0, INITIAL_VISIBLE) : equipmentNames;

  return (
    <section
      aria-label="Équipements et confort"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <div className="flex items-baseline justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <h3 className="text-lg text-[#041912] font-fraunces font-normal">Équipements et confort</h3>
        <span className="text-sm text-slate-500 shrink-0">
          {total} équipement{total > 1 ? 's' : ''}
        </span>
      </div>

      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4 px-5 sm:px-6 py-5 border-t border-slate-200/80">
        {visibleNames.map((name, index) => {
          const Icon = getEquipmentIcon(name);
          return (
            <li
              key={`${name}-${index}`}
              className="flex items-start gap-3 text-sm leading-5 text-slate-700"
            >
              <Icon
                className="w-5 h-5 shrink-0 text-[#0A3D2E]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>{name}</span>
            </li>
          );
        })}
      </ul>

      {isCollapsible && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="w-full flex items-center justify-center gap-1.5 py-3.5 border-t border-slate-200/80 text-sm font-semibold text-[#0A3D2E] transition-colors hover:bg-[#F1DFB6]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A3D2E]"
        >
          {expanded ? 'Voir moins' : `Voir les ${total} équipements`}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 motion-reduce:transition-none ${expanded ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
          />
        </button>
      )}
    </section>
  );
}