import { HeroSection } from "@/src/features/landing/components/HeroSection";
import { CategoryFilterSection } from "@/src/features/landing/components/CategoryFilterSection";
import { HowItWorks } from "@/src/features/landing/components/HowItWorks";
import { VehicleSectionCarousel } from "@/src/features/vehicles";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAF4]">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Category Filter Pills Carousel */}
      <CategoryFilterSection />

      {/* 3. Horizontal Scroll Section: Toutes les Annonces Populaires */}
      <VehicleSectionCarousel
        title="Annonces Populaires à Dakar"
        subtitle="Les véhicules les plus demandés avec assurance tous risques incluse"
        badgeText="DISPONIBILITÉ EN TEMPS RÉEL"
        limit={8}
      />

      {/* 4. Horizontal Scroll Section: SUV & 4×4 pour les Régions */}
      <VehicleSectionCarousel
        title="SUV & 4×4 pour la Région & Saly"
        subtitle="Véhicules robustes et confortables pour vos déplacements en régions"
        badgeText="TOUT-TERRAIN & CONFORT"
        type="SUV"
        limit={8}
      />

      {/* 5. Horizontal Scroll Section: Véhicules de Luxe & Prestige */}
      <VehicleSectionCarousel
        title="Véhicules de Luxe & Prestige"
        subtitle="Une sélection exclusive pour vos séjours VIP et grands événements"
        badgeText="SÉLECTION PRESTIGE"
        type="LUXE"
        limit={8}
      />

      {/* 6. Section How It Works (Placée après toutes les sections de véhicules) */}
      <HowItWorks />
    </main>
  );
}
