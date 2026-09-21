"use client";

import React, { useState, useEffect } from "react";
import { VehicleFilterState } from "../../hooks/useSearchVehicles";
import { VehicleType, FuelType, TransmissionType } from "../../types/vehicle.types";
import { X, RotateCcw, Search, Check, SlidersHorizontal, MapPin, Gauge, Fuel, Users, Star } from "lucide-react";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: VehicleFilterState;
  onUpdateFilters: (partial: Partial<VehicleFilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

const VEHICLE_TYPES: { id: VehicleType | ""; label: string }[] = [
  { id: "", label: "Tous" },
  { id: "SUV", label: "SUV & 4x4" },
  { id: "BERLINE", label: "Berline" },
  { id: "LUXE", label: "Luxe & Prestige" },
  { id: "PICKUP", label: "Pick-up" },
  { id: "CITADINE", label: "Citadine" },
  { id: "UTILITAIRE", label: "Utilitaire" },
];

const FUELS: { id: FuelType | ""; label: string }[] = [
  { id: "", label: "Tous" },
  { id: "ESSENCE", label: "Essence" },
  { id: "DIESEL", label: "Diesel" },
  { id: "HYBRIDE", label: "Hybride" },
  { id: "ELECTRIQUE", label: "Électrique" },
];

const TRANSMISSIONS: { id: TransmissionType | ""; label: string }[] = [
  { id: "", label: "Toutes" },
  { id: "AUTOMATIQUE", label: "Automatique" },
  { id: "MANUELLE", label: "Manuelle" },
];

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Saly", "Mbour", "Ziguinchor"];

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults,
}) => {
  const [localFilters, setLocalFilters] = useState<VehicleFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onUpdateFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container (Bottom Sheet 90vh) */}
      <div className="relative w-full max-h-[90vh] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
        {/* Header Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#0A3D2E]" />
            <h3 className="text-base font-bold font-serif text-slate-900">Filtres de recherche</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6 pb-28">
          {/* Recherche Textuelle */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Recherche par nom / marque
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={localFilters.q}
                onChange={(e) => setLocalFilters({ ...localFilters, q: e.target.value })}
                placeholder="Ex: Range Rover, Prado, BMW..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0A3D2E]"
              />
            </div>
          </div>

          {/* Ville / Localisation */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Ville / Zone
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLocalFilters({ ...localFilters, ville: "" })}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  !localFilters.ville
                    ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                Toutes les villes
              </button>
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setLocalFilters({ ...localFilters, ville: c })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.ville === c
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Type de véhicule */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Catégorie de véhicule
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_TYPES.map((t) => (
                <button
                  key={t.id || "all"}
                  onClick={() => setLocalFilters({ ...localFilters, type: t.id })}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.type === t.id
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>{t.label}</span>
                  {localFilters.type === t.id && <Check className="w-4 h-4 text-[#F1DFB6]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Max par jour */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Budget max / jour
              </label>
              <span className="text-xs font-bold text-[#0A3D2E]">
                {localFilters.prixMax
                  ? `${new Intl.NumberFormat("fr-FR").format(localFilters.prixMax)} FCFA`
                  : "Sans limite"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[30000, 50000, 80000, 120000, 200000].map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      prixMax: localFilters.prixMax === p ? null : p,
                    })
                  }
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.prixMax === p
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  ≤ {p / 1000}k F
                </button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Boîte de vitesse
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSMISSIONS.map((tr) => (
                <button
                  key={tr.id || "all"}
                  onClick={() => setLocalFilters({ ...localFilters, transmission: tr.id })}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.transmission === tr.id
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carburant */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Carburant
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FUELS.map((f) => (
                <button
                  key={f.id || "all"}
                  onClick={() => setLocalFilters({ ...localFilters, carburant: f.id })}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.carburant === f.id
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note minimale */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Note minimale
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 3.5, 4, 4.5].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      noteMin: localFilters.noteMin === n ? null : n,
                    })
                  }
                  className={`flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    localFilters.noteMin === n
                      ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{n}+</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Fixed Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center justify-between gap-3 z-30">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={handleApply}
            className="flex-1 py-3.5 rounded-xl bg-[#0A3D2E] text-white text-xs font-bold shadow-lg shadow-[#0A3D2E]/20 hover:bg-[#072B20] transition-all text-center"
          >
            Voir les véhicules ({totalResults})
          </button>
        </div>
      </div>
    </div>
  );
};
