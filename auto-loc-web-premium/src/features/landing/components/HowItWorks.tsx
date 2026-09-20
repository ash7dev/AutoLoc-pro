"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Search, ShieldCheck, KeyRound, CheckCircle2, type LucideIcon } from "lucide-react";

/**
 * Palette
 *  - Vert forêt  #0A3D2E  (tuiles d'icône, textes forts)
 *  - Champagne   #F1DFB6  (icônes sur vert)
 *  - Or sombre   #9A7B32  (petits accents sur fond clair)
 *
 * Typographie : Gloock / Fraunces pour le titre, les étapes et les chiffres.
 */
const SERIF = "var(--font-gloock), var(--font-fraunces), Georgia, serif";

interface Step {
  number: string;
  title: string;
  text: string;
  feature: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    number: "1",
    title: "Trouvez",
    text: "Explorez les véhicules vérifiés à Dakar et en régions, avec livraison possible à l'aéroport AIBD.",
    feature: "+300 véhicules vérifiés",
    icon: Search,
  },
  {
    number: "2",
    title: "Réservez",
    text: "Confirmez instantanément par Wave ou Orange Money, sans frais cachés.",
    feature: "Wave & Orange Money",
    icon: ShieldCheck,
  },
  {
    number: "3",
    title: "Roulez",
    text: "Récupérez les clés auprès du propriétaire, assurance tous risques incluse.",
    feature: "Assurance tous risques",
    icon: KeyRound,
  },
];

interface HowItWorksProps {
  className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLOListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToStep = useCallback((index: number) => {
    if (!containerRef.current) return;
    const items = containerRef.current.children;
    if (items[index]) {
      const itemEl = items[index] as HTMLElement;
      containerRef.current.scrollTo({
        left: itemEl.offsetLeft - 16,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  }, []);

  // Auto-scroll loop on mobile
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Only auto-scroll on screens < 768px (mobile/tablet layout)
      if (window.innerWidth < 768) {
        const nextIndex = (activeIndex + 1) % STEPS.length;
        scrollToStep(nextIndex);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, scrollToStep]);

  // Update active dot on manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.firstElementChild?.clientWidth || 280;
    const index = Math.round(scrollLeft / itemWidth);
    if (index >= 0 && index < STEPS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <section
      aria-labelledby="how-it-works-title"
      className={`bg-[#F8FAF4] py-10 sm:py-16 ${className}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* En-tête compact */}
        <div className="mb-6 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <h2
            id="how-it-works-title"
            className="text-2xl font-normal leading-tight tracking-tight text-[#0A3D2E] sm:text-4xl"
            style={{ fontFamily: SERIF }}
          >
            Louez en 3 étapes.
          </h2>
          <p className="max-w-sm text-xs text-slate-600 sm:text-right sm:text-base">
            De la réservation sécurisée à la prise en main du véhicule.
          </p>
        </div>

        {/* Cartes : Scroll horizontal fluide sur mobile + auto-scroll / Grille 3 colonnes sur desktop */}
        <ol
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible"
        >
          {STEPS.map(({ number, title, text, feature, icon: Icon }, index) => (
            <li
              key={number}
              onClick={() => scrollToStep(index)}
              className="group relative flex w-[85vw] max-w-[310px] shrink-0 snap-center flex-col rounded-2xl border border-[#0A3D2E]/10 bg-white p-5 shadow-[0_1px_2px_rgba(10,61,46,0.04)] transition-[border-color,box-shadow] duration-300 hover:border-[#0A3D2E]/25 hover:shadow-[0_12px_32px_-16px_rgba(10,61,46,0.25)] motion-reduce:transition-none md:w-auto md:max-w-none md:shrink"
            >
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#F1DFB6]"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>

                <div className="min-w-0 flex-1">
                  <h3
                    className="text-xl font-normal leading-none text-[#0A3D2E] sm:text-2xl"
                    style={{ fontFamily: SERIF }}
                  >
                    <span className="sr-only">Étape {number} : </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{text}</p>
                </div>

                <span
                  aria-hidden="true"
                  className="text-3xl leading-none text-[#0A3D2E]/15 transition-colors duration-500 group-hover:text-[#0A3D2E]/45 motion-reduce:transition-none sm:text-4xl"
                  style={{ fontFamily: SERIF }}
                >
                  {number}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#0A3D2E]/10 pt-3 text-xs font-medium text-[#0A3D2E]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9A7B32]" strokeWidth={1.75} />
                  <span>{feature}</span>
                </div>
                {number === "2" && (
                  <div className="flex items-center -space-x-1 shrink-0">
                    <img src="/wave.png" alt="Wave" className="w-5 h-5 rounded-full object-cover border border-white shadow-2xs" />
                    <img src="/orange_money.jpg" alt="Orange Money" className="w-5 h-5 rounded-full object-cover border border-white shadow-2xs" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Indicateurs de pagination (Dots) visibles sur Mobile uniquement */}
        <div className="mt-4 flex items-center justify-center gap-2 md:hidden">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToStep(i)}
              aria-label={`Aller à l'étape ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i ? "w-6 bg-[#0A3D2E]" : "w-2 bg-[#0A3D2E]/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};