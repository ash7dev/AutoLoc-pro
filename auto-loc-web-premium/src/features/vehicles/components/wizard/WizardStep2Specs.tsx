'use client';

import React, { useMemo } from 'react';
import {
  Sliders,
  Users,
  ShieldCheck,
  Minus,
  Plus,
  Snowflake,
  Radio,
  MapPin,
  Camera,
  Gauge,
  Sun,
  Luggage,
  Wifi,
  Usb,
  Disc,
  Lock,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Step2Data } from '../../stores/useVehicleDraftStore';

interface WizardStep2SpecsProps {
  data: Step2Data;
  onChange: (partial: Partial<Step2Data>) => void;
}

export interface EquipmentOption {
  id: string;
  label: string;
  sub: string;
  icon: any;
  tag?: string;
}

export const EQUIPMENTS_LIST: EquipmentOption[] = [
  { id: 'CLIMATISATION', label: 'Climatisation', sub: 'Air conditionné A/C', icon: Snowflake, tag: 'Recommandé SN' },
  { id: 'BLUETOOTH', label: 'Bluetooth Audio', sub: 'Musique & mains libres', icon: Radio },
  { id: 'GPS', label: 'CarPlay / GPS', sub: 'Écran tactile & cartes', icon: MapPin },
  { id: 'CAMERA_RECUL', label: 'Caméra de recul', sub: 'Assistance stationnement', icon: Camera },
  { id: 'REGULATEUR_VITESSE', label: 'Régulateur', sub: 'Vitesse constante', icon: Gauge },
  { id: 'TOIT_OUVRANT', label: 'Toit ouvrant', sub: 'Panoramique / Électrique', icon: Sun },
  { id: 'SIEGE_ENFANT', label: 'Siège enfant', sub: 'Fixation Isofix / Bébé', icon: ShieldCheck },
  { id: 'COFFRE_GRAND', label: 'Grand coffre', sub: 'Volume supérieur à 400L', icon: Luggage },
  { id: 'RADAR_RECUL', label: 'Radars de recul', sub: 'Capteurs de proximité', icon: Wifi },
  { id: 'USB_CHARGER', label: 'Prises USB-C', sub: 'Chargeur à bord', icon: Usb },
  { id: 'ROUE_SECOURS', label: 'Roue de secours', sub: 'Cric & clé démontage', icon: Disc, tag: 'Utile Pistes' },
  { id: 'ALARME', label: 'Alarme & Anti-vol', sub: 'Centralisation à distance', icon: Lock },
];

const ESSENTIAL_EQUIPMENT_IDS = ['CLIMATISATION', 'BLUETOOTH', 'USB_CHARGER', 'ROUE_SECOURS'];

export const WizardStep2Specs: React.FC<WizardStep2SpecsProps> = ({ data, onChange }) => {
  const selectedCount = data.equipements.length;

  const areAllEssentialsSelected = useMemo(() => {
    return ESSENTIAL_EQUIPMENT_IDS.every((id) => data.equipements.includes(id));
  }, [data.equipements]);

  const toggleEssentials = () => {
    if (areAllEssentialsSelected) {
      onChange({
        equipements: data.equipements.filter((id) => !ESSENTIAL_EQUIPMENT_IDS.includes(id)),
      });
    } else {
      const merged = Array.from(new Set([...data.equipements, ...ESSENTIAL_EQUIPMENT_IDS]));
      onChange({ equipements: merged });
    }
  };

  const toggleEquipement = (id: string) => {
    const exists = data.equipements.includes(id);
    if (exists) {
      onChange({ equipements: data.equipements.filter((e) => e !== id) });
    } else {
      onChange({ equipements: [...data.equipements, id] });
    }
  };

  const summaryText = useMemo(() => {
    return `${data.nombrePlaces} places · Conducteur ${data.ageMinimum}+ ans · Min. ${data.joursMinimum} j. · ${selectedCount} équipement${selectedCount > 1 ? 's' : ''}`;
  }, [data, selectedCount]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="mx-auto hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-[#4ADE80]/30 text-emerald-400 shadow-md">
          <Sliders className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Spécifications & Confort</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Indiquez la capacité d'accueil et les équipements à bord
        </p>
      </div>

      {/* Summary Pill */}
      <div className="flex items-center gap-2 rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] p-3 sm:p-3.5 shadow-sm text-xs font-bold text-[#047857] leading-relaxed">
        <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>{summaryText}</span>
      </div>

      {/* Nombre de places */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Users className="h-4 w-4 text-emerald-600" />
          <span>Nombre de places *</span>
        </label>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <h3 className="font-fraunces text-sm font-semibold text-slate-900">Capacité d'accueil</h3>
            <p className="text-xs text-slate-500">Conducteur compris</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={data.nombrePlaces <= 1}
              onClick={() => onChange({ nombrePlaces: Math.max(1, data.nombrePlaces - 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span className="font-display text-base font-bold text-slate-900 min-w-[24px] text-center">
              {data.nombrePlaces} <span className="text-xs font-normal text-slate-500">pl.</span>
            </span>
            <button
              type="button"
              disabled={data.nombrePlaces >= 50}
              onClick={() => onChange({ nombrePlaces: Math.min(50, data.nombrePlaces + 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark border border-[#4ADE80]/30 text-emerald-400 hover:bg-[#06261c]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Conditions d'accès */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Conditions d'accès *</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Âge min */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div>
              <h4 className="font-fraunces text-xs font-semibold text-slate-900">Âge minimum</h4>
              <p className="text-[11px] text-slate-500">Recommandé : 21 ans</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.ageMinimum <= 18}
                onClick={() => onChange({ ageMinimum: Math.max(18, data.ageMinimum - 1) })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <span className="font-display text-sm font-bold text-slate-900 min-w-[20px] text-center">
                {data.ageMinimum} <span className="text-[10px] font-normal text-slate-500">ans</span>
              </span>
              <button
                type="button"
                disabled={data.ageMinimum >= 30}
                onClick={() => onChange({ ageMinimum: Math.min(30, data.ageMinimum + 1) })}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark border border-[#4ADE80]/30 text-emerald-400"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Jours min */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div>
              <h4 className="font-fraunces text-xs font-semibold text-slate-900">Durée minimum</h4>
              <p className="text-[11px] text-slate-500">Jours de location min.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.joursMinimum <= 1}
                onClick={() => onChange({ joursMinimum: Math.max(1, data.joursMinimum - 1) })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <span className="font-display text-sm font-bold text-slate-900 min-w-[20px] text-center">
                {data.joursMinimum} <span className="text-[10px] font-normal text-slate-500">j.</span>
              </span>
              <button
                type="button"
                disabled={data.joursMinimum >= 30}
                onClick={() => onChange({ joursMinimum: Math.min(30, data.joursMinimum + 1) })}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark border border-[#4ADE80]/30 text-emerald-400"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Équipements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
            <Sliders className="h-4 w-4 text-emerald-600" />
            <span>Équipements & Confort *</span>
          </label>
          <span className="text-xs font-bold text-emerald-600">
            {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Quick Action Shortcut Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggleEssentials}
            className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              areAllEssentialsSelected
                ? 'border-brand-dark bg-brand-dark text-emerald-400 shadow-sm'
                : 'border-[#A7F3D0] bg-[#F0FDF4] text-[#047857] hover:bg-[#DCFCE7]'
            }`}
          >
            <Zap className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span>
              {areAllEssentialsSelected ? (
                'Indispensables cochés'
              ) : (
                <>
                  <span className="hidden sm:inline">⚡ Sélectionner les indispensables (Clim, Bluetooth, USB, Roue)</span>
                  <span className="sm:hidden">⚡ Les indispensables (Clim, BT, USB, Roue)</span>
                </>
              )}
            </span>
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ equipements: [] })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 shrink-0"
            >
              Tout effacer
            </button>
          )}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EQUIPMENTS_LIST.map((item) => {
            const isSelected = data.equipements.includes(item.id);
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleEquipement(item.id)}
                className={`flex flex-col justify-between text-left p-3 rounded-2xl border transition-all min-h-[100px] ${
                  isSelected
                    ? 'border-[#059669] bg-[#F0FDF4] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                    isSelected ? 'bg-brand-dark border-[#4ADE80]/40 text-emerald-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className={`font-fraunces text-xs font-semibold ${isSelected ? 'text-[#047857]' : 'text-slate-900'}`}>
                    {item.label}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">{item.sub}</p>
                </div>

                {item.tag && (
                  <span className={`inline-block self-start mt-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    isSelected ? 'bg-[#A7F3D0] text-[#047857]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
