"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface FilterPillItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  count?: number;
}

interface FilterPillsCarouselProps {
  items: FilterPillItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "emerald" | "dark" | "glass";
  size?: "sm" | "md" | "lg";
  showArrows?: boolean;
}

export const FilterPillsCarousel: React.FC<FilterPillsCarouselProps> = ({
  items,
  activeId,
  onChange,
  className = "",
  variant = "emerald",
  size = "md",
  showArrows = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.65;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onChange(id);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[34px]",
    md: "px-4 py-2 text-xs sm:text-sm gap-2 min-h-[42px]",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5 min-h-[48px]",
  }[size];

  return (
    <div className={`relative w-full group/carousel ${className}`}>
      {/* Scroll Left Action Button */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Faire défiler vers la gauche"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-brand-dark shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Left Gradient Mask */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-cream-50 via-cream-50/80 to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1.5 px-0.5 scroll-smooth"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          let buttonStyle = "";
          if (variant === "dark") {
            buttonStyle = isActive
              ? "bg-brand-dark text-white border-brand-dark shadow-md shadow-brand-dark/20 font-medium"
              : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80 font-normal";
          } else if (variant === "glass") {
            buttonStyle = isActive
              ? "bg-white/20 border-white/40 text-white shadow-lg backdrop-blur-md font-medium"
              : "bg-white/10 border-white/15 text-white/80 hover:bg-white/15 font-normal";
          } else {
            // Emerald (default)
            buttonStyle = isActive
              ? "bg-brand-dark text-white border-brand-dark shadow-lg shadow-brand-dark/25 font-medium"
              : "bg-white border-slate-200/90 text-slate-700 hover:border-emerald-300 hover:text-brand-dark shadow-xs font-normal";
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => handleSelect(item.id, e)}
              className={`shrink-0 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer select-none active:scale-95 ${sizeClasses} ${buttonStyle}`}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}

              <span className="whitespace-nowrap tracking-tight">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {typeof item.count === "number" && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Gradient Mask */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-cream-50 via-cream-50/80 to-transparent z-10 pointer-events-none" />
      )}

      {/* Scroll Right Action Button */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Faire défiler vers la droite"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 text-brand-dark shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
