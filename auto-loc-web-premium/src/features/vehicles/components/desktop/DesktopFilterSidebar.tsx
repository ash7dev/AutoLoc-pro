"use client";

import React from "react";
import { VehicleFilterState } from "../../hooks/useSearchVehicles";
import { VehicleType, FuelType, TransmissionType } from "../../types/vehicle.types";
import { Search, RotateCcw, Filter, MapPin, Gauge, Fuel, Star } from "lucide-react";

interface DesktopFilterSidebarProps {
  filters: VehicleFilterState;
  onSetFilter: <K extends keyof VehicleFilterState>(key: K, value: VehicleFilterState[K]) => void;
  onResetFilters: () => void;
}

const CATEGORIES: { id: VehicleType | ""; label: string }[] = [
  { id: "", label: "Toutes les catégories" },
  { id: "SUV", label: "SUV & Crossovers" },
  { id: "BERLINE", label: "Berlines" },
  { id: "FOUR_X_FOUR", label: "4x4 Tout-terrain" },
  { id: "LUXE", label: "Luxe & Prestige" },
  { id: "PICKUP", label: "Pick-up" },
  { id: "CITADINE", label: "Citadines" },
  { id: "UTILITAIRE", label: "Utilitaires" },
];

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Saly", "Mbour", "Ziguinchor"];

export const DesktopFilterSidebar: React.FC<DesktopFilterSidebarProps> = ({
  filters,
  onSetFilter,
  onResetFilters,
}) => {
  return (
    <aside className="w-full lg:w-[280px] shrink-0 sticky top-[80px] bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
      {/* Header Sidebar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0A3D2E]" />
          <h3 className="text-sm font-bold font-serif text-slate-900 uppercase tracking-wider">Filtres</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Effacer</span>
        </button>
      </div>

      {/* Recherche textuelle */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Recherche
        </label>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => onSetFilter("q", e.target.value)}
            placeholder="Marque, modèle..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0A3D2E] transition-colors"
          />
        </div>
      </div>

      {/* Ville / Localisation */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Ville / Zone
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.ville}
            onChange={(e) => onSetFilter("ville", e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0A3D2E] cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catégories / Type */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Catégorie
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.type === cat.id;
            return (
              <button
                key={cat.id || "all"}
                onClick={() => onSetFilter("type", cat.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#0A3D2E] text-white font-bold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Transmission
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "", label: "Toutes" },
            { id: "AUTOMATIQUE", label: "Auto" },
            { id: "MANUELLE", label: "Manuelle" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onSetFilter("transmission", t.id as TransmissionType | "")}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                filters.transmission === t.id
                  ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Carburant */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Carburant
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "", label: "Tous" },
            { id: "ESSENCE", label: "Essence" },
            { id: "DIESEL", label: "Diesel" },
            { id: "HYBRIDE", label: "Hybride" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onSetFilter("carburant", f.id as FuelType | "")}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                filters.carburant === f.id
                  ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note minimale */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
          Note minimum
        </label>
        <div className="flex items-center gap-1.5">
          {[3, 4, 4.5].map((n) => (
            <button
              key={n}
              onClick={() => onSetFilter("noteMin", filters.noteMin === n ? null : n)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filters.noteMin === n
                  ? "bg-[#0A3D2E] text-white border-[#0A3D2E]"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{n}+</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
