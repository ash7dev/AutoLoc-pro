"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Vehicle } from "../../types/vehicle.types";
import { Compass } from "lucide-react";

const RealLeafletMap = dynamic(
  () => import("./RealLeafletMap").then((mod) => mod.RealLeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center gap-3 text-slate-400">
        <Compass className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Chargement de la carte interactive du Sénégal...</span>
      </div>
    ),
  }
);

interface InteractiveVehiclesMapProps {
  vehicles: Vehicle[];
  highlightedVehicleId?: string | null;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
}

export const InteractiveVehiclesMap: React.FC<InteractiveVehiclesMapProps> = ({
  vehicles,
  highlightedVehicleId,
  onVehicleSelect,
}) => {
  return (
    <div className="w-full h-full min-h-[550px]">
      <RealLeafletMap
        vehicles={vehicles}
        highlightedVehicleId={highlightedVehicleId}
        onVehicleSelect={onVehicleSelect}
      />
    </div>
  );
};
