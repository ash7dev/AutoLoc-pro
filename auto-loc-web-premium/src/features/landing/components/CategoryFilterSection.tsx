"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FilterPillsCarousel, FilterPillItem } from "@/src/shared/components/FilterPillsCarousel";

const VEHICLE_CATEGORIES: FilterPillItem[] = [
  { id: "all", label: "Tous les véhicules", count: 42 },
  { id: "SUV", label: "SUV & 4×4", badge: "POPULAIRE", count: 18 },
  { id: "LUXE", label: "Luxe & Prestige", badge: "EXCLUSIF", count: 6 },
  { id: "BERLINE", label: "Berlines Premium", badge: "BUSINESS", count: 12 },
  { id: "PICKUP", label: "Pick-up Tout-Terrain", badge: "ROBUSTE", count: 5 },
  { id: "CITADINE", label: "Citadines Éco", badge: "URBAIN", count: 9 },
  { id: "MINIBUS", label: "Minibus & Familial", count: 4 },
];

export const CategoryFilterSection: React.FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

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
          items={VEHICLE_CATEGORIES}
          activeId={selectedCategory}
          onChange={handleCategoryChange}
          variant="emerald"
          size="md"
        />
      </div>
    </section>
  );
};
