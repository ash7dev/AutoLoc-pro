"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "../../types/vehicle.types";
import { MapPin, Star, X, Compass, ExternalLink } from "lucide-react";

interface InteractiveVehiclesMapProps {
  vehicles: Vehicle[];
}

export const InteractiveVehiclesMap: React.FC<InteractiveVehiclesMapProps> = ({ vehicles }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  return (
    <div className="relative w-full h-[calc(100vh-180px)] rounded-3xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-900">
      {/* Background Stylisé Carte / SVG Mock */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Message d'en-tête Map */}
      <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2">
        <Compass className="w-4 h-4 text-[#0A3D2E] animate-spin-slow" />
        <span className="text-xs font-bold text-slate-800">
          {vehicles.length} véhicules géolocalisés à Dakar & région
        </span>
      </div>

      {/* Grille de Pins simulée avec coordonnées ou dispersion */}
      <div className="absolute inset-0 p-8 flex flex-wrap items-center justify-around overflow-hidden">
        {vehicles.slice(0, 12).map((v, idx) => {
          const isSelected = selectedVehicle?.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95
                ${
                  isSelected
                    ? "bg-[#F1DFB6] text-[#0A3D2E] ring-4 ring-[#0A3D2E] z-30 scale-110"
                    : "bg-[#0A3D2E] text-white hover:bg-[#072B20] z-10"
                }
              `}
              style={{
                marginTop: `${(idx % 4) * 20}px`,
                marginLeft: `${(idx % 3) * 15}px`,
              }}
            >
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>{formatPrice(v.prixParJour)} F</span>
            </button>
          );
        })}
      </div>

      {/* Selected Vehicle Quick Card Popup */}
      {selectedVehicle && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setSelectedVehicle(null)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3 items-center">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={selectedVehicle.photoUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop"}
                alt={selectedVehicle.modele}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mb-0.5">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{selectedVehicle.note > 0 ? selectedVehicle.note : "Nouveau"}</span>
              </div>
              <h4 className="text-xs font-bold font-serif text-slate-900 truncate">
                {selectedVehicle.marque} {selectedVehicle.modele}
              </h4>
              <p className="text-[11px] text-slate-500">{selectedVehicle.ville || "Dakar"}</p>
              <div className="text-xs font-extrabold text-[#0A3D2E] mt-1">
                {formatPrice(selectedVehicle.prixParJour)} FCFA / jour
              </div>
            </div>
          </div>

          <Link
            href={`/vehicles/${selectedVehicle.id}`}
            className="mt-3 w-full py-2 bg-[#0A3D2E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#072B20] transition-colors"
          >
            <span>Voir les détails</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
