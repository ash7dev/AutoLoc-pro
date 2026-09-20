"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar as CalendarIcon, Car, Search, Check, Sparkles, Zap, ChevronRight, RotateCcw } from "lucide-react";
import { AutoCalendar } from "@/src/shared/components/AutoCalendar";

const ZONES = [
  { value: "", label: "Tout Dakar", subtitle: "Tous les véhicules disponibles", icon: "📍" },
  { value: "HorsDakar", label: "Autorisé Hors Dakar", subtitle: "Voyages en régions & Saly", icon: "🛣️" },
  { value: "AIBD", label: "Aéroport AIBD (Diass)", subtitle: "Livraison terminal aéroport", icon: "✈️" },
];

const TYPES = [
  { value: "", label: "Tous les types", badge: "TOUT", subtitle: "Catalogue complet", icon: "🚗" },
  { value: "SUV", label: "SUV & 4×4", badge: "POPULAIRE", subtitle: "Polyvalent & confort", icon: "🚘" },
  { value: "LUXE", label: "Luxe & Prestige", badge: "EXCLUSIF", subtitle: "Véhicules haut de gamme", icon: "✨" },
  { value: "BERLINE", label: "Berlines Premium", badge: "BUSINESS", subtitle: "Élégance & longs trajets", icon: "🏎️" },
  { value: "PICKUP", label: "Pick-up Tout-Terrain", badge: "ROBUSTE", subtitle: "Capacité & 4WD", icon: "🛻" },
  { value: "CITADINE", label: "Citadines Éco", badge: "URBAIN", subtitle: "Agile & économique", icon: "🚕" },
];

type StepType = "zone" | "dates" | "type";

interface WhereToSearchSectionProps {
  compact?: boolean;
}

export const WhereToSearchSection: React.FC<WhereToSearchSectionProps> = ({ compact = false }) => {
  const router = useRouter();
  const [zone, setZone] = useState("");
  const [type, setType] = useState("");
  const [dateDebut, setDateDebut] = useState<string | undefined>(undefined);
  const [dateFin, setDateFin] = useState<string | undefined>(undefined);

  const [activeStep, setActiveStep] = useState<StepType>("zone");

  const calculateDays = (): number | null => {
    if (!dateDebut || !dateFin) return null;
    const start = new Date(`${dateDebut}T00:00:00`).getTime();
    const end = new Date(`${dateFin}T00:00:00`).getTime();
    const diff = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));
    return diff;
  };

  const durationDays = calculateDays();

  const handleSelectDates = (start: string, end?: string) => {
    setDateDebut(start);
    setDateFin(end);
  };

  const handlePresetWeekEnd = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    setDateDebut(friday.toISOString().split("T")[0]);
    setDateFin(sunday.toISOString().split("T")[0]);
  };

  const handlePreset7Days = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    setDateDebut(today.toISOString().split("T")[0]);
    setDateFin(nextWeek.toISOString().split("T")[0]);
  };

  const handlePreset14Days = () => {
    const today = new Date();
    const next2Weeks = new Date(today);
    next2Weeks.setDate(today.getDate() + 14);
    setDateDebut(today.toISOString().split("T")[0]);
    setDateFin(next2Weeks.toISOString().split("T")[0]);
  };

  const handleReset = () => {
    setZone("");
    setType("");
    setDateDebut(undefined);
    setDateFin(undefined);
    setActiveStep("zone");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (zone) params.set("zone", zone);
    if (type) params.set("type", type);
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);

    router.push(`/vehicles?${params.toString()}`);
  };

  const formatDateDisplay = (isoStr?: string) => {
    if (!isoStr) return "";
    const d = new Date(`${isoStr}T00:00:00`);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const selectedZoneObj = ZONES.find((z) => z.value === zone) || ZONES[0];
  const selectedTypeObj = TYPES.find((t) => t.value === type) || TYPES[0];

  const datesSummaryText =
    dateDebut && dateFin
      ? `${formatDateDisplay(dateDebut)} - ${formatDateDisplay(dateFin)} (${durationDays}j)`
      : "Ajouter des dates";

  return (
    <div className="w-full bg-white rounded-3xl border border-emerald-900/10 shadow-2xl shadow-emerald-950/10 overflow-hidden transition-all">
      {/* Header */}
      <div className="px-5 py-4 border-b border-emerald-950/10 bg-gradient-to-r from-emerald-950/5 via-white to-white flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold tracking-wider text-emerald-800 uppercase">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            RECHERCHE RAPIDE · DAKAR
          </div>
          <h2 className="text-xl font-fraunces font-normal text-[#041912] mt-1 tracking-tight" style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}>
            Où & quand louer ?
          </h2>

        </div>
        {durationDays !== null && (
          <div className="px-3 py-1 bg-emerald-100/70 border border-emerald-300 rounded-full text-xs font-bold text-emerald-900 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            {durationDays} jrs
          </div>
        )}
      </div>

      {/* Accordion Content */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* STEP 1: ZONE */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            activeStep === "zone"
              ? "bg-white border-[#041912] shadow-md shadow-emerald-950/10"
              : "bg-emerald-950/[0.02] border-emerald-950/10 hover:border-emerald-300"
          }`}
        >
          {activeStep !== "zone" ? (
            <button
              onClick={() => setActiveStep("zone")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                  Périmètre
                </span>
                <span className="text-sm font-bold text-[#041912]">
                  {selectedZoneObj.icon} {selectedZoneObj.label}
                </span>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                Modifier
              </span>
            </button>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span className="text-xs font-bold text-[#041912] tracking-wider uppercase">
                  Où voulez-vous rouler ?
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {ZONES.map((z) => {
                  const isSelected = zone === z.value;
                  return (
                    <button
                      key={z.value}
                      onClick={() => {
                        setZone(z.value);
                        setActiveStep("dates");
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-[#041912] border-[#041912] text-white"
                          : "bg-white border-slate-200 hover:border-emerald-400 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{z.icon}</span>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isSelected ? "text-white" : "text-[#041912]"
                            }`}
                          >
                            {z.label}
                          </p>
                          <p
                            className={`text-xs ${
                              isSelected ? "text-emerald-200" : "text-slate-500"
                            }`}
                          >
                            {z.subtitle}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: DATES */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            activeStep === "dates"
              ? "bg-white border-[#041912] shadow-md shadow-emerald-950/10"
              : "bg-emerald-950/[0.02] border-emerald-950/10 hover:border-emerald-300"
          }`}
        >
          {activeStep !== "dates" ? (
            <button
              onClick={() => setActiveStep("dates")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                  Dates de location
                </span>
                <span className="text-sm font-bold text-[#041912]">
                  📅 {datesSummaryText}
                </span>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                Modifier
              </span>
            </button>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span className="text-xs font-bold text-[#041912] tracking-wider uppercase">
                    Quand souhaitez-vous louer ?
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetWeekEnd}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Ce week-end
                </button>
                <button
                  type="button"
                  onClick={handlePreset7Days}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <span>🗓️</span>
                  7 jours
                </button>
                <button
                  type="button"
                  onClick={handlePreset14Days}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                >
                  <span>🌟</span>
                  14 jours
                </button>
              </div>

              {/* Calendar Component */}
              <div className="border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                <AutoCalendar
                  startDate={dateDebut}
                  endDate={dateFin}
                  onSelectDates={handleSelectDates}
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveStep("type")}
                className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-[#041912] font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                <span>Valider les dates</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* STEP 3: TYPE */}
        <div
          className={`rounded-2xl border transition-all overflow-hidden ${
            activeStep === "type"
              ? "bg-white border-[#041912] shadow-md shadow-emerald-950/10"
              : "bg-emerald-950/[0.02] border-emerald-950/10 hover:border-emerald-300"
          }`}
        >
          {activeStep !== "type" ? (
            <button
              onClick={() => setActiveStep("type")}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                  Catégorie de véhicule
                </span>
                <span className="text-sm font-bold text-[#041912]">
                  {selectedTypeObj.icon} {selectedTypeObj.label}
                </span>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                Modifier
              </span>
            </button>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                  <Car className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span className="text-xs font-bold text-[#041912] tracking-wider uppercase">
                  Quel type de véhicule ?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TYPES.map((t) => {
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-[#041912] border-[#041912] text-white"
                          : "bg-white border-slate-200 hover:border-emerald-400 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{t.icon}</span>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isSelected ? "text-white" : "text-[#041912]"
                            }`}
                          >
                            {t.label}
                          </p>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-emerald-200" : "text-slate-500"
                            }`}
                          >
                            {t.subtitle}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-800 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Effacer
        </button>

        <button
          onClick={handleSearch}
          className="flex-1 py-3 px-6 rounded-2xl bg-[#041912] hover:bg-emerald-900 text-white font-bold text-sm shadow-xl shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Rechercher</span>
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center ml-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>
        </button>
      </div>
    </div>
  );
};
