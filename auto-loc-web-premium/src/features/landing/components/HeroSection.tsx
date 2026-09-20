"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { WhereToSearchSection } from "./WhereToSearchSection";
import { WhereToSearchTrigger } from "./WhereToSearchTrigger";
import { WhereToSearchModal } from "./WhereToSearchModal";
import { PremiumVehicleCard } from "@/src/features/vehicles/components/PremiumVehicleCard";
import { useVehicles } from "@/src/features/vehicles";

export const HeroSection: React.FC = () => {
  const { vehicles, isLoading } = useVehicles({ limit: 4 });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <section className="relative min-h-0 lg:min-h-[85vh] bg-[#F8FAF4] text-slate-900 pt-16 sm:pt-28 pb-3 sm:pb-12 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-10">
          {/* Top Guarantee Pill (Mobile) */}
          <div className="inline-flex sm:hidden items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Votre réservation est 100% sécurisée & assurée</span>
          </div>

          {/* Slogan Badge (Desktop) */}
          <div className="hidden sm:inline-flex items-center justify-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>N°1 de la Location de Voiture entre Particuliers au Sénégal</span>
          </div>

          {/* Main Title */}
          <h1
            className="hidden sm:block text-3xl sm:text-5xl lg:text-6xl font-fraunces font-normal tracking-tight text-[#041912] leading-tight"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            Louez la voiture idéale à{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent italic">
              Dakar & Régions.
            </span>
          </h1>

          <h2
            className="block sm:hidden text-[28px] font-fraunces font-normal text-[#041912] leading-[1.2] text-center mb-2.5 tracking-tight"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            N°1 de la Location de Voiture entre Particuliers au Sénégal.
          </h2>

          {/* Subtitles */}
          <p className="hidden sm:block mt-4 text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Accédez aux meilleurs véhicules vérifiés en quelques clics. Assurance tous risques incluse et paiement instantané Wave ou Orange Money.
          </p>

          <p className="block sm:hidden text-xs text-slate-500 font-medium text-center mb-4">
            Accédez aux meilleurs véhicules vérifiés en quelques clics.
          </p>

          {/* Quick Value Props (Desktop) */}
          <div className="hidden sm:flex mt-6 flex-wrap items-center justify-center gap-3 text-xs font-bold text-[#041912]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assurance Comprise</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vérification d'Identité KYC</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Wave & Orange Money</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Search Widget / Right Featured Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Search Section */}
          <div className="lg:col-span-5 w-full">
            <div className="block lg:hidden">
              <WhereToSearchTrigger onPress={() => setMobileSearchOpen(true)} />

              {/* Quick Value Props (Mobile) */}
              <div className="flex sm:hidden mt-4 flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#041912]">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Assurance Comprise</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Vérification d'Identité KYC</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Wave & Orange Money</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <WhereToSearchSection />
            </div>
          </div>

          {/* Modal de recherche Mobile */}
          <WhereToSearchModal
            isOpen={mobileSearchOpen}
            onClose={() => setMobileSearchOpen(false)}
          />

          {/* Right Column: Featured Vehicles Grid (Visible sur Desktop uniquement) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  DISPONIBILITÉ EN TEMPS RÉEL
                </div>
                <h3 className="text-2xl font-fraunces font-normal text-[#041912] mt-0.5">
                  Annonces populaires à Dakar
                </h3>
              </div>
              <a
                href="/vehicles"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors group"
              >
                <span>Voir tout le catalogue</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Featured Vehicles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-3xl bg-slate-200/60 animate-pulse border border-slate-200/80 shadow-xs"
                  />
                ))
              ) : vehicles.length > 0 ? (
                vehicles.slice(0, 4).map((v) => (
                  <PremiumVehicleCard key={v.id} vehicle={v} className="w-full shrink" />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 p-8 text-center bg-white/70 rounded-3xl border border-slate-200/80 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Aucun véhicule populaire disponible pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
