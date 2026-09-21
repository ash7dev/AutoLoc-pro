"use client";

import React from "react";
import { VehicleType } from "../types/vehicle.types";
import { Car, ShieldCheck, Sparkles, Truck, Compass, Zap } from "lucide-react";

interface CategoryChip {
  id: VehicleType | "";
  label: string;
  icon?: React.ReactNode;
}

const CATEGORIES: CategoryChip[] = [
  { id: "", label: "Tous les véhicules", icon: <Car className="w-4 h-4" /> },
  { id: "SUV", label: "SUV & Crossovers", icon: <Compass className="w-4 h-4" /> },
  { id: "BERLINE", label: "Berlines", icon: <Car className="w-4 h-4" /> },
  { id: "FOUR_X_FOUR", label: "4x4 Tout-terrain", icon: <ShieldCheck className="w-4 h-4" /> },
  { id: "LUXE", label: "Luxe & Prestige", icon: <Sparkles className="w-4 h-4" /> },
  { id: "PICKUP", label: "Pick-up", icon: <Truck className="w-4 h-4" /> },
  { id: "CITADINE", label: "Citadines", icon: <Zap className="w-4 h-4" /> },
  { id: "UTILITAIRE", label: "Utilitaires", icon: <Truck className="w-4 h-4" /> },
];

interface VehiclesFilterChipsProps {
  selectedType: VehicleType | "";
  onSelectType: (type: VehicleType | "") => void;
}

export const VehiclesFilterChips: React.FC<VehiclesFilterChipsProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div className="w-full relative group my-3">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = selectedType === cat.id;
          return (
            <button
              key={cat.id || "all"}
              onClick={() => onSelectType(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0
                ${
                  isActive
                    ? "bg-[#0A3D2E] text-white shadow-md shadow-[#0A3D2E]/20 scale-105"
                    : "bg-white/80 hover:bg-white text-slate-700 hover:text-[#0A3D2E] border border-slate-200/80 shadow-sm"
                }
              `}
            >
              <span className={isActive ? "text-[#F1DFB6]" : "text-emerald-600"}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
