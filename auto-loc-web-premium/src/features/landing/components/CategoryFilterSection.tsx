"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FilterPillsCarousel, FilterPillItem } from "@/src/shared/components/FilterPillsCarousel";
import { useVehicles } from "@/src/features/vehicles";

/**
 * Catégories de véhicules affichées dans le carousel de pilules.
 * Le `count` est calculé dynamiquement à partir des données API.
 */
const CATEGORY_META: { id: string; label: string; badge?: string }[] = [
  { id: "all", label: "Tous les véhicules" },
  { id: "SUV", label: "SUV & 4×4", badge: "POPULAIRE" },
  { id: "LUXE", label: "Luxe & Prestige", badge: "EXCLUSIF" },
  { id: "BERLINE", label: "Berlines Premium", badge: "BUSINESS" },
  { id: "PICKUP", label: "Pick-up Tout-Terrain", badge: "ROBUSTE" },
  { id: "CITADINE", label: "Citadines Éco", badge: "URBAIN" },
  { id: "MINIBUS", label: "Minibus & Familial" },
];

export const CategoryFilterSection: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Récupérer tous les véhicules (sans filtre type, limite haute)
  // pour calculer les vrais comptes par catégorie
  const { vehicles, isLoading } = useVehicles({ limit: 500 });

  // Compter les véhicules par catégorie (type) dynamiquement
  const items: FilterPillItem[] = useMemo(() => {
    if (isLoading || !vehicles.length) {
      // Tant que le chargement est en cours, pas de count
      return CATEGORY_META.map((cat) => ({
        ...cat,
        count: undefined,
      }));
    }

    const countByType = new Map<string, number>();
    for (const v of vehicles) {
      const t = (v as any).type || "OTHER";
      countByType.set(t, (countByType.get(t) || 0) + 1);
    }

    return CATEGORY_META.map((cat) => ({
      ...cat,
      count:
        cat.id === "all"
          ? vehicles.length
          : countByType.get(cat.id) ?? 0,
    }));
  }, [vehicles, isLoading]);

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    if (id !== "all") {
      router.push(`/vehicles?type=${id}`);
    } else {
      router.push("/vehicles");
    }
  };

  return (
    <section className="py-2 sm:py-6 bg-[#F8FAF4] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FilterPillsCarousel
          items={items}
          activeId={selectedCategory}
          onChange={handleCategoryChange}
          variant="emerald"
          size="md"
        />
      </div>
    </section>
  );
};
