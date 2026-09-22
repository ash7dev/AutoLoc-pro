'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Car,
  Sliders,
  Calendar,
  Shield,
  Gauge,
  Fuel,
  FileText,
  Check,
  ChevronRight,
  Search,
  Sparkles,
  X,
  Droplets,
  BatteryCharging,
  Zap,
} from 'lucide-react';
import { Step1Data } from '../../stores/useVehicleDraftStore';
import { POPULAR_MAKES_2026, VEHICLE_CATALOG, VEHICLE_TYPES, detectCategoryFromModel } from '../../constants/vehicleCatalog';

interface WizardStep1ModelProps {
  data: Step1Data;
  onChange: (partial: Partial<Step1Data>) => void;
}

const YEARS = Array.from({ length: 17 }, (_, i) => 2026 - i);
const ALL_MAKES = Object.keys(VEHICLE_CATALOG).sort();
const PLATE_REGEX = /^[A-Z]{2}-\d{4}-[A-Z]{2}$/;

function formatPlate(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const letters1 = clean.slice(0, 2).replace(/[0-9]/g, '');
  const digits = clean.slice(letters1.length, letters1.length + 4).replace(/[^0-9]/g, '');
  const rest = clean.slice(letters1.length + digits.length);
  const letters2 = rest.slice(0, 2).replace(/[0-9]/g, '');

  let out = letters1;
  if (digits.length) out += (out.length ? '-' : '') + digits;
  if (letters2.length) out += (out.length ? '-' : '') + letters2;
  return out;
}

export const WizardStep1Model: React.FC<WizardStep1ModelProps> = ({ data, onChange }) => {
  const [mounted, setMounted] = useState(false);
  const [marqueModalOpen, setMarqueModalOpen] = useState(false);
  const [modeleModalOpen, setModeleModalOpen] = useState(false);
  const [categorieModalOpen, setCategorieModalOpen] = useState(false);
  const [anneeModalOpen, setAnneeModalOpen] = useState(false);

  const [marqueSearch, setMarqueSearch] = useState('');
  const [modeleSearch, setModeleSearch] = useState('');
  const [customModele, setCustomModele] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableModels = useMemo(
    () => (data.marque && VEHICLE_CATALOG[data.marque]) || [],
    [data.marque]
  );

  const filteredModels = useMemo(() => {
    if (!modeleSearch.trim()) return availableModels;
    const q = modeleSearch.toLowerCase();
    return availableModels.filter((m) => m.toLowerCase().includes(q));
  }, [availableModels, modeleSearch]);

  const filteredMakes = useMemo(() => {
    if (!marqueSearch.trim()) return ALL_MAKES;
    const q = marqueSearch.toLowerCase();
    return ALL_MAKES.filter((m) => m.toLowerCase().includes(q));
  }, [marqueSearch]);

  const handleSelectMarque = (make: string) => {
    onChange({ marque: make, modele: '' });
    setMarqueModalOpen(false);
    setMarqueSearch('');
  };

  const handleSelectModele = (model: string) => {
    const suggestedType = detectCategoryFromModel(data.marque, model);
    onChange({
      modele: model,
      ...(suggestedType ? { type: suggestedType } : {}),
    });
    setModeleModalOpen(false);
    setModeleSearch('');
  };

  const plateValid = PLATE_REGEX.test(data.immatriculation || '');

  const renderPortal = (content: React.ReactNode) => {
    if (!mounted || typeof window === 'undefined') return null;
    return createPortal(content, document.body);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-1 sm:space-y-2 pb-1 sm:pb-2">
        <div className="mx-auto hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-[#041912] border border-[#4ADE80]/30 text-[#4ADE80] shadow-md">
          <Car className="h-6 w-6" strokeWidth={2.2} />
        </div>
        <h2 className="font-fraunces font-normal text-xl sm:text-3xl text-slate-900 tracking-tight">Votre véhicule</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Indiquez la marque, le modèle et l'immatriculation du véhicule
        </p>
      </div>

      {/* Live Preview Card */}
      {Boolean(data.marque && data.modele) && (
        <div className="flex items-center gap-3.5 rounded-2xl bg-[#F0FDF4] border border-[#A7F3D0] p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#059669] text-white">
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-fraunces text-sm font-semibold text-[#047857] truncate">
              {data.annee ? `${data.annee} · ` : ''}
              {data.marque} {data.modele}
            </h3>
            <p className="text-xs text-slate-600 truncate">
              {[
                data.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle',
                data.carburant,
                VEHICLE_TYPES.find((t) => t.id === data.type)?.label,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Marque */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Car className="h-4 w-4 text-[#059669]" />
          <span>Marque du véhicule *</span>
        </label>
        <button
          type="button"
          onClick={() => setMarqueModalOpen(true)}
          className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${
            data.marque
              ? 'border-[#059669] bg-[#F0FDF4] font-semibold text-[#047857]'
              : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
          }`}
        >
          <span>{data.marque || 'Sélectionner une marque (Toyota, Jetour, Hyundai...)'}</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Modèle */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Sliders className="h-4 w-4 text-[#059669]" />
          <span>Modèle *</span>
        </label>
        <button
          type="button"
          disabled={!data.marque}
          onClick={() => (data.marque ? setModeleModalOpen(true) : setMarqueModalOpen(true))}
          className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all ${
            !data.marque
              ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              : data.modele
              ? 'border-[#059669] bg-[#F0FDF4] font-semibold text-[#047857]'
              : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
          }`}
        >
          <span>
            {data.modele || (data.marque ? `Sélectionner un modèle ${data.marque}...` : "Choisissez d'abord une marque")}
          </span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Année & Catégorie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Année */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
            <Calendar className="h-4 w-4 text-[#059669]" />
            <span>Année *</span>
          </label>
          <button
            type="button"
            onClick={() => setAnneeModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-sm font-semibold text-slate-900 transition-all hover:border-[#059669]"
          >
            <span>{data.annee || 'Sélectionner l\'année'}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Catégorie */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
              <Shield className="h-4 w-4 text-[#059669]" />
              <span>Catégorie *</span>
            </label>
            {Boolean(data.modele) && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#059669] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                <Sparkles className="h-3 w-3" /> Auto
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCategorieModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-sm transition-all hover:border-[#059669]"
          >
            <span className="font-semibold text-slate-900 truncate">
              {VEHICLE_TYPES.find((t) => t.id === data.type)?.label || 'Sélectionner la catégorie'}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
          </button>
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Gauge className="h-4 w-4 text-[#059669]" />
          <span>Transmission *</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'AUTOMATIQUE', label: 'Automatique', sub: 'Boîte auto / Séquentielle' },
            { id: 'MANUELLE', label: 'Manuelle', sub: 'Boîte mécanique' },
          ].map((tr) => {
            const isSelected = data.transmission === tr.id;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => onChange({ transmission: tr.id as any })}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#059669] bg-[#F0FDF4] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-fraunces text-sm font-semibold ${isSelected ? 'text-[#047857]' : 'text-slate-900'}`}>
                    {tr.label}
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{tr.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carburant */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
          <Fuel className="h-4 w-4 text-[#059669]" />
          <span>Carburant *</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'ESSENCE', label: 'Essence', icon: Fuel },
            { id: 'DIESEL', label: 'Diesel', icon: Droplets },
            { id: 'HYBRIDE', label: 'Hybride', icon: BatteryCharging },
            { id: 'ELECTRIQUE', label: 'Électrique', icon: Zap },
          ].map((f) => {
            const isSelected = data.carburant === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange({ carburant: f.id as any })}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-[#059669] bg-[#041912] text-[#4ADE80] shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Immatriculation Sénégal */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 font-fraunces">
            <FileText className="h-4 w-4 text-[#059669]" />
            <span>Immatriculation *</span>
          </label>
          <span className="text-[11px] text-slate-500">Format Carte Grise : DK-1234-BA</span>
        </div>

        <div className={`flex items-center rounded-2xl border-2 p-1.5 transition-all ${
          plateValid ? 'border-[#059669] bg-[#F0FDF4]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex h-10 px-3 items-center justify-center rounded-xl bg-[#041912] text-white font-bold text-xs gap-1.5">
            <span className="text-[#4ADE80]">SN</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <input
            type="text"
            maxLength={10}
            value={data.immatriculation}
            onChange={(e) => onChange({ immatriculation: formatPlate(e.target.value) })}
            placeholder="DK-1234-BA"
            className="flex-1 bg-transparent px-3 py-2 text-center font-display font-bold text-base tracking-widest text-slate-900 uppercase focus:outline-none"
          />

          {plateValid && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#059669] text-white mr-1">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
          )}
        </div>
      </div>

      {/* Modal Sélection Marque */}
      {marqueModalOpen && renderPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col my-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-fraunces text-base font-semibold text-slate-900">Marque du véhicule</h3>
              <button type="button" onClick={() => setMarqueModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={marqueSearch}
                onChange={(e) => setMarqueSearch(e.target.value)}
                placeholder="Rechercher une marque..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-[#059669] focus:outline-none"
              />
            </div>

            {!marqueSearch.trim() && (
              <div className="space-y-2 shrink-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-fraunces">Marques populaires</span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_MAKES_2026.slice(0, 10).map((make) => (
                    <button
                      key={make}
                      type="button"
                      onClick={() => handleSelectMarque(make)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        data.marque === make
                          ? 'bg-[#041912] text-[#4ADE80] border-[#041912]'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {make}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 border-t pt-2 min-h-0">
              {filteredMakes.map((make) => (
                <button
                  key={make}
                  type="button"
                  onClick={() => handleSelectMarque(make)}
                  className={`flex w-full items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all ${
                    data.marque === make ? 'bg-[#F0FDF4] text-[#047857] font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{make}</span>
                  {data.marque === make && <Check className="h-4 w-4 text-[#059669]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sélection Modèle */}
      {modeleModalOpen && renderPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col my-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-fraunces text-base font-semibold text-slate-900">Modèle</h3>
                <p className="text-xs text-slate-500">{data.marque}</p>
              </div>
              <button type="button" onClick={() => setModeleModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={modeleSearch}
                onChange={(e) => setModeleSearch(e.target.value)}
                placeholder={`Rechercher un modèle ${data.marque}...`}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-[#059669] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 min-h-0">
              {filteredModels.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleSelectModele(model)}
                  className={`flex w-full items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all ${
                    data.modele === model ? 'bg-[#F0FDF4] text-[#047857] font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{model}</span>
                  {data.modele === model && <Check className="h-4 w-4 text-[#059669]" />}
                </button>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Modèle non listé ?</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customModele}
                  onChange={(e) => setCustomModele(e.target.value)}
                  placeholder="Saisir un autre modèle..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#059669] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customModele.trim()) {
                      handleSelectModele(customModele.trim());
                      setCustomModele('');
                    }
                  }}
                  className="rounded-xl bg-[#059669] px-3 py-2 text-xs font-bold text-white hover:bg-[#047857]"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sélection Année */}
      {anneeModalOpen && renderPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col my-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <h3 className="font-fraunces text-base font-semibold text-slate-900">Année de mise en circulation</h3>
              <button type="button" onClick={() => setAnneeModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 p-1 min-h-0">
              {YEARS.map((yr) => {
                const isSelected = data.annee === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      onChange({ annee: yr });
                      setAnneeModalOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-[#041912] text-[#4ADE80] border-[#041912] shadow-sm'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sélection Catégorie */}
      {categorieModalOpen && renderPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col my-auto border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="font-fraunces text-base font-semibold text-slate-900">Catégorie du véhicule</h3>
                <p className="text-xs text-slate-500">Sélectionnez le type qui correspond à votre véhicule</p>
              </div>
              <button type="button" onClick={() => setCategorieModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
              {VEHICLE_TYPES.map((cat) => {
                const isSelected = data.type === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onChange({ type: cat.id });
                      setCategorieModalOpen(false);
                    }}
                    className={`flex w-full items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#059669] bg-[#F0FDF4] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                        isSelected ? 'bg-[#041912] text-[#4ADE80]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`font-fraunces text-sm font-semibold ${isSelected ? 'text-[#047857]' : 'text-slate-900'}`}>
                          {cat.label}
                        </h4>
                        <p className="text-xs text-slate-500">{cat.tagline}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#059669] text-white shrink-0">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
