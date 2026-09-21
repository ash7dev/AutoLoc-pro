"use client";

import React from "react";
import { Map, List } from "lucide-react";

interface MobileFloatingNavPillProps {
  viewMode: "list" | "map";
  onToggleViewMode: () => void;
}

export const MobileFloatingNavPill: React.FC<MobileFloatingNavPillProps> = ({
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
      <button
        onClick={onToggleViewMode}
        className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0A3D2E]/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all"
      >
        {viewMode === "list" ? (
          <>
            <Map className="w-4 h-4 text-[#F1DFB6]" />
            <span>Afficher la Carte</span>
          </>
        ) : (
          <>
            <List className="w-4 h-4 text-[#F1DFB6]" />
            <span>Afficher la Liste</span>
          </>
        )}
      </button>
    </div>
  );
};
