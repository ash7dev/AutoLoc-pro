import React, { Suspense } from "react";
import { Metadata } from "next";
import { VehiclesPageShell } from "@/src/features/vehicles/components/VehiclesPageShell";
import { VehiclesGridSkeleton } from "@/src/features/vehicles/components/VehiclesGridSkeleton";

export const metadata: Metadata = {
  title: "Tous les Véhicules — AutoLoc Premium Sénégal",
  description:
    "Découvrez notre catalogue de véhicules de location vérifiés au Sénégal (Dakar, Thiès, Saly). Réservation en ligne sécurisée avec assurance et livraison.",
  keywords: [
    "location voiture dakar",
    "location suv senegal",
    "rent a car dakar",
    "location berline dakar",
    "autoloc premium",
  ],
  openGraph: {
    title: "Tous les Véhicules — AutoLoc Premium",
    description: "Trouvez le véhicule parfait pour vos déplacements au Sénégal.",
    type: "website",
  },
};

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#F8FAF4] pt-24 px-4 max-w-7xl mx-auto">
          <VehiclesGridSkeleton count={6} />
        </div>
      }
    >
      <VehiclesPageShell />
    </Suspense>
  );
}
