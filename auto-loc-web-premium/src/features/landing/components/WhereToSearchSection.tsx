"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Route,
  Plane,
  Calendar as CalendarIcon,
  Car,
  Gem,
  Briefcase,
  Truck,
  Zap,
  LayoutGrid,
  Search,
  Check,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { AutoCalendar } from "@/src/shared/components/AutoCalendar";

const ZONES = [
  { value: "", label: "Tout Dakar", subtitle: "Tous les véhicules disponibles", icon: MapPin },
  { value: "HorsDakar", label: "Autorisé hors Dakar", subtitle: "Voyages en régions & Saly", icon: Route },
  { value: "AIBD", label: "Aéroport AIBD (Diass)", subtitle: "Livraison terminal aéroport", icon: Plane },
];

const TYPES = [
  { value: "", label: "Tous les types", subtitle: "Catalogue complet", icon: LayoutGrid },
  { value: "SUV", label: "SUV & 4×4", subtitle: "Polyvalent & confort", icon: Car },
  { value: "LUXE", label: "Luxe & prestige", subtitle: "Véhicules haut de gamme", icon: Gem },
  { value: "BERLINE", label: "Berlines premium", subtitle: "Élégance & longs trajets", icon: Briefcase },
  { value: "PICKUP", label: "Pick-up tout-terrain", subtitle: "Capacité & 4WD", icon: Truck },
  { value: "CITADINE", label: "Citadines éco", subtitle: "Agile & économique", icon: Zap },
];

type StepType = "zone" | "dates" | "type";

interface WhereToSearchSectionProps {
  compact?: boolean;
  onSearchSuccess?: () => void;
}

export const WhereToSearchSection: React.FC<WhereToSearchSectionProps> = ({
  compact = false,
  onSearchSuccess,
}) => {
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

    onSearchSuccess?.();
    router.push(`/vehicles?${params.toString()}`);
  };

  const handleMouseEnterSearch = () => {
    const params = new URLSearchParams();
    if (zone) params.set("zone", zone);
    if (type) params.set("type", type);
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);

    router.prefetch(`/vehicles?${params.toString()}`);
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
    <div className="w-full overflow-hidden rounded-3xl border border-[#041912]/8 bg-white shadow-[0_20px_48px_-16px_rgba(4,25,18,0.18)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D2E]/8 px-2.5 py-1 text-[10.5px] font-semibold text-[#0A3D2E]">
            <Sparkles className="h-3 w-3" />
            Recherche rapide · Dakar
          </div>
          <h2 className="mt-1.5 font-fraunces text-xl leading-tight text-[#041912]">
            Où & quand louer ?
          </h2>
        </div>
        {durationDays !== null && (
          <div className="flex items-center gap-1 rounded-full bg-[#0A3D2E]/8 px-3 py-1 text-[12px] font-semibold text-[#0A3D2E]">
            {durationDays} jrs
          </div>
        )}
      </div>

      {/* Étapes */}
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {/* STEP 1 : ZONE */}
        <div
          className={`overflow-hidden rounded-2xl border transition-all ${activeStep === "zone"
              ? "border-[#041912] bg-white"
              : "border-slate-100 bg-slate-50/40 hover:border-slate-200"
            }`}
        >
          {activeStep !== "zone" ? (
            <button
              onClick={() => setActiveStep("zone")}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div>
                <span className="block text-[10.5px] font-medium text-slate-400">Périmètre</span>
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#041912]">
                  <selectedZoneObj.icon className="h-3.5 w-3.5 text-[#059669]" />
                  {selectedZoneObj.label}
                </span>
              </div>
              <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-600">
                Modifier
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A3D2E]/8 text-[#0A3D2E]">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-[12px] font-semibold text-[#041912]">
                  Où voulez-vous rouler ?
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {ZONES.map((z) => {
                  const isSelected = zone === z.value;
                  const ZoneIcon = z.icon;
                  return (
                    <button
                      key={z.value}
                      onClick={() => {
                        setZone(z.value);
                        setActiveStep("dates");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${isSelected
                          ? "border-[#041912] bg-[#041912] text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <ZoneIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#4ADE80]' : 'text-[#059669]'}`} />
                        <div>
                          <p className={`text-[13px] font-semibold ${isSelected ? "text-white" : "text-[#041912]"}`}>
                            {z.label}
                          </p>
                          <p className={`text-[11.5px] ${isSelected ? "text-[#F1DFB6]/70" : "text-slate-500"}`}>
                            {z.subtitle}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-[#4ADE80] bg-[#4ADE80] text-[#041912]" : "border-slate-300"
                          }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2 : DATES */}
        <div
          className={`overflow-hidden rounded-2xl border transition-all ${activeStep === "dates"
              ? "border-[#041912] bg-white"
              : "border-slate-100 bg-slate-50/40 hover:border-slate-200"
            }`}
        >
          {activeStep !== "dates" ? (
            <button
              onClick={() => setActiveStep("dates")}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div>
                <span className="block text-[10.5px] font-medium text-slate-400">Dates de location</span>
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#041912]">
                  <CalendarIcon className="h-3.5 w-3.5 text-[#059669]" />
                  {datesSummaryText}
                </span>
              </div>
              <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-600">
                Modifier
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A3D2E]/8 text-[#0A3D2E]">
                  <CalendarIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[12px] font-semibold text-[#041912]">
                  Quand souhaitez-vous louer ?
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePresetWeekEnd}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D2E]/8 px-3 py-1.5 text-[12px] font-semibold text-[#0A3D2E] transition-colors hover:bg-[#0A3D2E]/12"
                >
                  <Zap className="h-3 w-3" />
                  Ce week-end
                </button>
                <button
                  type="button"
                  onClick={handlePreset7Days}
                  className="rounded-full bg-[#0A3D2E]/8 px-3 py-1.5 text-[12px] font-semibold text-[#0A3D2E] transition-colors hover:bg-[#0A3D2E]/12"
                >
                  7 jours
                </button>
                <button
                  type="button"
                  onClick={handlePreset14Days}
                  className="rounded-full bg-[#0A3D2E]/8 px-3 py-1.5 text-[12px] font-semibold text-[#0A3D2E] transition-colors hover:bg-[#0A3D2E]/12"
                >
                  14 jours
                </button>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-1">
                <AutoCalendar
                  startDate={dateDebut}
                  endDate={dateFin}
                  onSelectDates={handleSelectDates}
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveStep("type")}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#0A3D2E]/8 px-4 py-2.5 text-[12.5px] font-semibold text-[#0A3D2E] transition-colors hover:bg-[#0A3D2E]/12"
              >
                Valider les dates
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* STEP 3 : TYPE */}
        <div
          className={`overflow-hidden rounded-2xl border transition-all ${activeStep === "type"
              ? "border-[#041912] bg-white"
              : "border-slate-100 bg-slate-50/40 hover:border-slate-200"
            }`}
        >
          {activeStep !== "type" ? (
            <button
              onClick={() => setActiveStep("type")}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left"
            >
              <div>
                <span className="block text-[10.5px] font-medium text-slate-400">Catégorie de véhicule</span>
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#041912]">
                  <selectedTypeObj.icon className="h-3.5 w-3.5 text-[#059669]" />
                  {selectedTypeObj.label}
                </span>
              </div>
              <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-600">
                Modifier
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A3D2E]/8 text-[#0A3D2E]">
                  <Car className="h-3.5 w-3.5" />
                </div>
                <span className="text-[12px] font-semibold text-[#041912]">
                  Quel type de véhicule ?
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TYPES.map((t) => {
                  const isSelected = type === t.value;
                  const TypeIcon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${isSelected
                          ? "border-[#041912] bg-[#041912] text-white"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <TypeIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#4ADE80]' : 'text-[#059669]'}`} />
                        <div>
                          <p className={`text-[12.5px] font-semibold ${isSelected ? "text-white" : "text-[#041912]"}`}>
                            {t.label}
                          </p>
                          <p className={`text-[10.5px] ${isSelected ? "text-[#F1DFB6]/70" : "text-slate-500"}`}>
                            {t.subtitle}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4ADE80] text-[#041912]">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
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

      {/* Pied de recherche */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 p-4">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 transition-colors hover:text-slate-700"
        >
          <RotateCcw className="h-3 w-3" />
          Effacer
        </button>

        <button
          onClick={handleSearch}
          onMouseEnter={handleMouseEnterSearch}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#041912] px-6 py-3 text-[13.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E]"
        >
          <Search className="h-4 w-4 text-[#4ADE80]" />
          Rechercher
        </button>
      </div>
    </div>
  );
};