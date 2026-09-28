"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Search, ShieldCheck, KeyRound, CheckCircle2, type LucideIcon } from "lucide-react";

/**
 * Palette
 *  - Vert forêt  #0A3D2E  (tuiles d'icône, textes forts)
 *  - Champagne   #F1DFB6  (icônes sur vert, lueurs)
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
    text: "Des véhicules vérifiés à Dakar et en régions, livrables à l'AIBD.",
    feature: "+30 véhicules vérifiés",
    icon: Search,
  },
  {
    number: "2",
    title: "Réservez",
    text: "Confirmation instantanée par Wave ou Orange Money, sans frais cachés.",
    feature: "Wave & Orange Money",
    icon: ShieldCheck,
  },
  {
    number: "3",
    title: "Roulez",
    text: "Récupérez les clés auprès du propriétaire, assurance incluse.",
    feature: "Assurance tous risques",
    icon: KeyRound,
  },
];

interface HowItWorksProps {
  className?: string;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLOListElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Auto-défilement mobile (désactivé si « réduire les animations »)
  useEffect(() => {
    if (isPaused) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      if (window.innerWidth < 768) {
        scrollToStep((activeIndex + 1) % STEPS.length);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, scrollToStep]);

  // Nettoyage du timer de reprise
  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const handleTouchEnd = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsPaused(false), 5000);
  };

  // Met à jour le point actif au scroll manuel
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const itemWidth = container.firstElementChild?.clientWidth || 280;
    const index = Math.round(container.scrollLeft / itemWidth);
    if (index >= 0 && index < STEPS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <section
      aria-labelledby="how-it-works-title"
      className={`relative overflow-hidden bg-cream-50 py-10 sm:py-20 ${className}`}
    >
      {/* Halo d'ambiance très discret */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(241,223,182,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* En-tête compact */}
        <div className="mb-7 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A7B32]">
              <span className="h-px w-6 bg-[#9A7B32]/60" />
              Comment ça marche
            </span>
            <h2
              id="how-it-works-title"
              className="mt-3 text-[1.75rem] font-normal leading-[1.05] tracking-tight text-brand-main sm:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              Louez en 3 étapes.
            </h2>
          </div>
          <p className="max-w-xs text-xs text-slate-600 sm:text-right sm:text-base">
            De la réservation sécurisée à la prise en main du véhicule.
          </p>
        </div>

        {/* Cartes : carrousel mobile / grille 3 colonnes desktop */}
        <ol
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={() => {
            setIsPaused(true);
            if (resumeTimer.current) clearTimeout(resumeTimer.current);
          }}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-0.5 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
        >
          {STEPS.map(({ number, title, text, feature, icon: Icon }, index) => {
            const isLast = index === STEPS.length - 1;

            return (
              <li
                key={number}
                onClick={() => scrollToStep(index)}
                className={`group relative flex w-[85vw] max-w-[310px] shrink-0 snap-center flex-col rounded-3xl border border-brand-main/10 bg-white p-5 shadow-[0_1px_2px_rgba(10,61,46,0.04),0_8px_24px_-16px_rgba(10,61,46,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-main/20 hover:shadow-[0_24px_48px_-24px_rgba(10,61,46,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:w-auto md:max-w-none md:shrink md:p-6 ${!isLast
                    ? "md:after:absolute md:after:-right-6 md:after:top-[46px] md:after:w-6 md:after:border-t-2 md:after:border-dashed md:after:border-brand-main/25"
                    : ""
                  }`}
              >
                {/* Décor clippé : lueur au survol + chiffre en filigrane */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 100% 0%, rgba(241,223,182,0.35) 0%, transparent 55%)",
                    }}
                  />
                  <span
                    className="absolute -right-1 -top-3 select-none bg-gradient-to-b from-brand-main/[0.14] to-transparent bg-clip-text text-[96px] leading-none text-transparent sm:text-[112px]"
                    style={{ fontFamily: SERIF }}
                  >
                    {number}
                  </span>
                </div>

                {/* Tuile d'icône en relief */}
                <span
                  aria-hidden="true"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F5A43] to-brand-main text-champagne shadow-[inset_0_1px_0_rgba(241,223,182,0.28),0_10px_20px_-8px_rgba(10,61,46,0.55)] ring-1 ring-brand-main"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>

                <h3
                  className="relative mt-5 text-2xl font-normal leading-none text-brand-main sm:text-[1.75rem]"
                  style={{ fontFamily: SERIF }}
                >
                  <span className="sr-only">Étape {number} : </span>
                  {title}
                </h3>

                <p className="relative mt-2.5 text-[13px] leading-relaxed text-slate-600 sm:text-sm">
                  {text}
                </p>

                {/* Atout en pastille */}
                <div className="relative mt-5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-main/[0.05] py-1.5 pl-2 pr-3 text-xs font-medium text-brand-main ring-1 ring-inset ring-brand-main/10">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9A7B32]" strokeWidth={1.75} />
                    {feature}
                  </span>

                  {number === "2" && (
                    <div className="flex shrink-0 items-center -space-x-1.5">
                      <img
                        src="/wave.png"
                        alt="Wave"
                        loading="lazy"
                        className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-sm"
                      />
                      <img
                        src="/orange_money.jpg"
                        alt="Orange Money"
                        loading="lazy"
                        className="h-6 w-6 rounded-full border-2 border-white object-cover shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Pagination : mobile uniquement */}
        <div className="mt-5 flex items-center justify-center gap-2 md:hidden">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToStep(i)}
              aria-label={`Aller à l'étape ${i + 1}`}
              aria-current={activeIndex === i}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? "w-6 bg-brand-main" : "w-2 bg-brand-main/20"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};