"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { Vehicle } from "../../types/vehicle.types";
import { MapPin, Star, X, ExternalLink, ShieldCheck, Compass } from "lucide-react";
import { getTenantPricePerDay } from "@/lib/utils";

interface RealLeafletMapProps {
  vehicles: Vehicle[];
  highlightedVehicleId?: string | null;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  vehicles,
  highlightedVehicleId,
  onVehicleSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialiser la carte si elle n'existe pas encore
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = [14.7167, -17.4677]; // Dakar
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Tuiles modernes CartoDB Positron (Style Airbnb/Turo)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Contrôle de zoom personnalisé en bas à droite
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Nettoyer les anciens marqueurs
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (!vehicles || vehicles.length === 0) return;

    const bounds = L.latLngBounds([]);

    vehicles.forEach((vehicle, idx) => {
      // Coordonnées de secours réparties si latitude/longitude absentes
      const lat = vehicle.latitude || 14.7167 + (idx % 3 === 0 ? 0.02 : -0.015) * (idx + 1);
      const lng = vehicle.longitude || -17.4677 + (idx % 2 === 0 ? 0.03 : -0.02) * (idx + 1);

      bounds.extend([lat, lng]);

      const tenantPrice = getTenantPricePerDay(vehicle.prixParJour);
      const isSelected = selectedVehicle?.id === vehicle.id || highlightedVehicleId === vehicle.id;

      // HTML personnalisé pour le marqueur sous forme de pilule de prix
      const priceText = `${Math.round(tenantPrice / 1000)}k F`;
      const customIconHtml = `
        <div class="cursor-pointer transition-all duration-300 transform hover:scale-110 ${
          isSelected ? "z-50 scale-125" : "z-10"
        }">
          <div class="px-2.5 py-1 rounded-full font-bold text-xs shadow-md border transition-colors flex items-center gap-1 ${
            isSelected
              ? "bg-[#0A3D2E] text-white border-emerald-400 ring-2 ring-emerald-500/50"
              : "bg-white text-slate-900 border-slate-300 hover:bg-[#0A3D2E] hover:text-white"
          }">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>${priceText}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customIconHtml,
        className: "custom-leaflet-price-pin",
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedVehicle(vehicle);
        if (onVehicleSelect) onVehicleSelect(vehicle);
        map.panTo([lat, lng], { animate: true });
      });

      markersRef.current[vehicle.id] = marker;
    });

    // Ajuster le zoom uniquement si nous avons plusieurs coordonnées valides
    if (bounds.isValid() && vehicles.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [vehicles, selectedVehicle, highlightedVehicleId, onVehicleSelect]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-md">
      {/* Container de la Carte Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Tag géolocalisation en haut à gauche */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-800">
        <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
        <span>{vehicles.length} véhicules localisés</span>
      </div>

      {/* Preview Overlay Bottom Card si un véhicule est sélectionné */}
      {selectedVehicle && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-200/90 z-20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => {
              setSelectedVehicle(null);
              if (onVehicleSelect) onVehicleSelect(null);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3 items-center">
            <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={
                  selectedVehicle.photoUrl ||
                  (Array.isArray(selectedVehicle.photos) && selectedVehicle.photos.length > 0
                    ? typeof selectedVehicle.photos[0] === "string"
                      ? selectedVehicle.photos[0]
                      : selectedVehicle.photos[0].url
                    : "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop")
                }
                alt={`${selectedVehicle.marque} ${selectedVehicle.modele}`}
                fill
                className="object-cover"
              />
              {selectedVehicle.isFeatured && (
                <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  Top Choice
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              {selectedVehicle.note > 0 && selectedVehicle.totalAvis > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{selectedVehicle.note.toFixed(1)}</span>
                  <span className="text-slate-400 text-[10px]">({selectedVehicle.totalAvis})</span>
                </div>
              )}
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {selectedVehicle.marque} {selectedVehicle.modele}
              </h4>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{selectedVehicle.ville || "Dakar"}</span>
              </p>
              <div className="text-sm font-extrabold text-[#0A3D2E] mt-1.5">
                {formatPrice(getTenantPricePerDay(selectedVehicle.prixParJour))}{" "}
                <span className="text-[11px] font-normal text-slate-500">FCFA / jour</span>
              </div>
            </div>
          </div>

          <Link
            href={`/vehicles/${selectedVehicle.id}`}
            className="mt-3 w-full py-2.5 bg-[#0A3D2E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#072B20] transition-colors shadow-md"
          >
            <span>Voir l'offre & Réserver</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
