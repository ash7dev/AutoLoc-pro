"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, Fuel, Gauge, Users } from "lucide-react";
import { Vehicle } from "../types/vehicle.types";
import { getTenantPricePerDay, formatCurrency } from "@/lib/utils";

interface PremiumVehicleCardProps {
  vehicle: Vehicle;
  className?: string;
}

/**
 * Palette
 *  - Vert forêt  #0A3D2E  (fond de la carte)
 *  - Champagne   #F1DFB6  (accents, prix, icônes)
 *  - Ivoire      #FBF6E9  (titres)
 *
 * Typographie : Gloock pour le titre et le prix, sans-serif du projet pour le reste.
 */
const SERIF = "var(--font-gloock), var(--font-fraunces), Georgia, serif";

export const PremiumVehicleCard: React.FC<PremiumVehicleCardProps> = ({
  vehicle,
  className = "",
}) => {
  const tenantPrice = getTenantPricePerDay(vehicle.prixParJour);
  const formattedPrice = formatCurrency(tenantPrice);

  const defaultImages: Record<string, string> = {
    SUV: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    LUXE: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    BERLINE: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    PICKUP: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
  };

  const imageSrc =
    vehicle.photoUrl && vehicle.photoUrl.startsWith("http")
      ? vehicle.photoUrl
      : defaultImages[vehicle.type] || defaultImages.SUV;

  const title = `${vehicle.marque} ${vehicle.modele}`;

  return (
    // Toute la carte est cliquable : le bouton « Réserver » est retiré.
    <Link
      href={`/vehicles/${vehicle.id}`}
      aria-label={`Voir ${title}`}
      className={`group relative flex shrink-0 flex-col rounded-[28px] bg-[#0A3D2E] p-2 ring-1 ring-[#F1DFB6]/15 shadow-[0_24px_48px_-24px_rgba(4,25,18,0.55)] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_32px_64px_-24px_rgba(4,25,18,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      {/* Photo, en retrait du cadre */}
      <div className="relative h-48 w-full overflow-hidden rounded-[22px] bg-[#062A20] sm:h-52">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#062A20]/80 via-[#062A20]/10 to-transparent" />

        {/* Badges */}
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full border border-[#F1DFB6]/30 bg-[#0A3D2E]/70 py-1 pl-2 pr-2.5 text-[11px] font-medium text-[#F1DFB6] backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            Vérifié
          </span>

          {Number(vehicle.note || 0) > 0 && Number(vehicle.totalAvis || 0) > 0 && (
            <span className="flex items-center gap-1 rounded-full border border-[#F1DFB6]/30 bg-[#0A3D2E]/70 px-2.5 py-1 text-[11px] font-medium text-[#F1DFB6] backdrop-blur-md">
              <Star className="h-3 w-3 fill-[#F1DFB6] text-[#F1DFB6]" />
              {Number(vehicle.note).toFixed(1)}
              <span className="text-[#F1DFB6]/60">({vehicle.totalAvis})</span>
            </span>
          )}
        </div>

        {/* Localisation et type */}
        <div className="absolute bottom-3 left-4 right-3 z-10 flex items-center justify-between gap-2 text-[#FBF6E9]">
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F1DFB6]" strokeWidth={1.75} />
            <span className="truncate">{vehicle.ville || "Dakar"}</span>
          </span>
          <span className="shrink-0 rounded-full border border-[#F1DFB6]/30 bg-[#0A3D2E]/70 px-2.5 py-0.5 text-[11px] font-medium text-[#F1DFB6] backdrop-blur-md">
            {vehicle.type}
          </span>
        </div>
      </div>

      {/* Informations */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5">
        <h3
          className="line-clamp-1 text-[22px] font-normal leading-tight text-[#FBF6E9]"
          style={{ fontFamily: SERIF }}
        >
          {title}
        </h3>
        <p className="mt-1 text-xs text-[#F1DFB6]/60">Année {vehicle.annee}</p>

        {/* Caractéristiques : filets fins plutôt que pastilles */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-[#F1DFB6]/15 border-y border-[#F1DFB6]/15 py-3 text-xs text-[#FBF6E9]/85">
          <span className="flex items-center justify-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[#F1DFB6]" strokeWidth={1.75} />
            {vehicle.transmission === "AUTOMATIQUE" ? "Auto" : "Manuel"}
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-[#F1DFB6]" strokeWidth={1.75} />
            {vehicle.carburant || "Essence"}
          </span>
          <span className="flex items-center justify-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#F1DFB6]" strokeWidth={1.75} />
            {vehicle.nombrePlaces || 5} places
          </span>
        </div>

        {/* Prix */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <span className="text-xs text-[#F1DFB6]/60">Tarif locataire par jour</span>
          <p className="flex items-baseline gap-1.5 text-[#F1DFB6]">
            <span className="font-serif text-2xl font-normal tabular-nums text-[#F1DFB6]">
              {formattedPrice}
            </span>
            <span className="text-xs text-[#F1DFB6]/70">FCFA / jour</span>
          </p>
        </div>
      </div>
    </Link>
  );
};