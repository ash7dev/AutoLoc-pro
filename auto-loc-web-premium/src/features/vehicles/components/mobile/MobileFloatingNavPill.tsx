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
    <div className="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
      <button
        onClick={onToggleViewMode}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] text-xs font-bold shadow-xl shadow-[#0A3D2E]/40 border border-[#F1DFB6]/30 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
      >
        {viewMode === "list" ? (
          <>
            <Map className="w-4 h-4 text-[#F1DFB6]" />
            <span>Carte</span>
          </>
        ) : (
          <>
            <List className="w-4 h-4 text-[#F1DFB6]" />
            <span>Liste</span>
          </>
        )}
      </button>
    </div>
  );
};
