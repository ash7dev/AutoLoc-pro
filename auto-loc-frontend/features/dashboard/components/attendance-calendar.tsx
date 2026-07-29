"use client";

import { ChevronLeft, ChevronRight, PlaneLanding, PlaneTakeoff, Info, CalendarRange, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import type { Reservation } from "@/lib/nestjs/reservations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const daysOfWeek = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

export interface CalendarDay {
  day: number;
  dateStr: string;
  status: "reserved" | null;
  hasCheckIn?: boolean;
  hasCheckOut?: boolean;
  reservedVehicles?: string[];
}

interface AttendanceCalendarProps {
  month?: string;
  days?: CalendarDay[];
  onPrev?: () => void;
  onNext?: () => void;
  reservations?: Reservation[];
  loading?: boolean;
}

export function AttendanceCalendar({
  month = "Juin 2025",
  days = [],
  onPrev,
  onNext,
  reservations = [],
  loading = false,
}: AttendanceCalendarProps) {
  const [selectedDayDigit, setSelectedDayDigit] = useState<number>(() => new Date().getDate());

  // Derive selected day info
  const selectedDayData = useMemo(() => {
    return (days || []).find(d => d.day === selectedDayDigit);
  }, [days, selectedDayDigit]);

  // Movements for the selected day
  const dailyAgenda = useMemo(() => {
    if (!selectedDayData || !reservations.length) return { checkins: [], checkouts: [] };
    
    const dateStr = selectedDayData.dateStr;
    
    const checkins = reservations.filter(r => 
      r.dateDebut.split("T")[0] === dateStr && ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut)
    );
    
    const checkouts = reservations.filter(r => 
      r.dateFin.split("T")[0] === dateStr && ["EN_COURS", "TERMINEE"].includes(r.statut)
    );

    return { checkins, checkouts };
  }, [selectedDayData, reservations]);

  const reservedCount = days.filter((d) => d.status === "reserved").length;

  return (
    <div className={cn(
      "relative overflow-hidden flex flex-col lg:flex-row rounded-2xl",
      "bg-white",
      "ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
    )}>
      {/* Top edge glare */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500 opacity-[0.04] pointer-events-none blur-3xl" />

      {/* ── Left Side: Calendar Grid ─────────────────────────── */}
      <div className="relative z-10 flex-1 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-100/80">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
              <CalendarRange className="w-4 h-4 text-emerald-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[15px] font-black tracking-tight text-slate-800">Agenda Logistique</h3>
              {!loading && (
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  {reservedCount} jour{reservedCount > 1 ? "s" : ""} occupé{reservedCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-50 hover:shadow-sm transition-all" onClick={onPrev}>
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
            </Button>
            <span className="text-[11px] sm:text-[12px] font-bold min-w-[80px] sm:min-w-[100px] text-center uppercase tracking-widest text-slate-800">
              {loading ? "..." : month}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-50 hover:shadow-sm transition-all" onClick={onNext}>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2 sm:mb-3">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {loading ? (
            Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg sm:rounded-xl bg-slate-100 animate-pulse" />
            ))
          ) : (
            <TooltipProvider>
              {days.map((item) => (
                <Tooltip key={item.day} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedDayDigit(item.day)}
                      className={cn(
                        "relative aspect-square rounded-lg sm:rounded-xl text-[12px] sm:text-[13px] font-bold transition-all group",
                        selectedDayDigit === item.day 
                          ? "bg-slate-900 text-white shadow-xl ring-2 sm:ring-4 ring-slate-900/10" 
                          : item.status === "reserved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                            : "text-slate-600 hover:bg-slate-50 hover:border hover:border-slate-100"
                      )}
                    >
                      {item.day}
                      
                      {/* Movement Indicators */}
                      <div className="absolute bottom-1 sm:bottom-1.5 left-0 right-0 flex justify-center gap-0.5 sm:gap-1">
                        {item.hasCheckIn && (
                          <div className={cn("w-1 h-1 rounded-full bg-blue-500", selectedDayDigit === item.day && "bg-white")} />
                        )}
                        {item.hasCheckOut && (
                          <div className={cn("w-1 h-1 rounded-full bg-emerald-500", selectedDayDigit === item.day && "bg-white")} />
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  
                  {item.reservedVehicles && item.reservedVehicles.length > 0 && (
                    <TooltipContent side="top" className="p-3 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-xl rounded-xl min-w-[160px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                          <Car className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Véhicules occupés</span>
                        </div>
                        <div className="space-y-1">
                          {item.reservedVehicles.map((v, i) => (
                            <p key={i} className="text-[12px] font-bold text-slate-800 leading-tight">
                              • {v}
                            </p>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </TooltipProvider>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">Départ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">Retour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-200 border border-emerald-300" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">Occupé</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Agenda for Selected Day ──────────────── */}
      <div className="relative z-10 lg:w-[320px] bg-slate-50/40 p-4 sm:p-6 flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h4 className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">
            Agenda du jour
          </h4>
          <p className="text-[14px] sm:text-[15px] font-black text-slate-800">
            {selectedDayDigit} {month}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 flex-1 overflow-auto">
          {/* Section Check-ins */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneTakeoff className="w-3.5 h-3.5 text-blue-500" />
              <h5 className="text-[11px] sm:text-[12px] font-bold text-slate-800 uppercase tracking-tight">Départs ({dailyAgenda.checkins.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkins.length > 0 ? (
                dailyAgenda.checkins.map(r => (
                  <div key={r.id} className="bg-white/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-0.5">
                    <p className="text-[12px] sm:text-[13px] font-bold text-slate-800 truncate">{r.vehicule ? `${r.vehicule.marque ?? ''} ${r.vehicule.modele ?? ''}` : "Véhicule"}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                      <span className="text-blue-500">CLI :</span> {r.locataire ? `${r.locataire.prenom ?? ''} ${r.locataire.nom?.charAt(0) ?? ''}.` : "Locataire"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] italic text-slate-400">Aucun départ prévu</p>
              )}
            </div>
          </section>

          {/* Section Check-outs */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneLanding className="w-3.5 h-3.5 text-emerald-500" />
              <h5 className="text-[11px] sm:text-[12px] font-bold text-slate-800 uppercase tracking-tight">Retours ({dailyAgenda.checkouts.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkouts.length > 0 ? (
                dailyAgenda.checkouts.map(r => (
                  <div key={r.id} className="bg-white/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-0.5">
                    <p className="text-[12px] sm:text-[13px] font-bold text-slate-800 truncate">{r.vehicule ? `${r.vehicule.marque ?? ''} ${r.vehicule.modele ?? ''}` : "Véhicule"}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                      <span className="text-emerald-500">CLI :</span> {r.locataire ? `${r.locataire.prenom ?? ''} ${r.locataire.nom?.charAt(0) ?? ''}.` : "Locataire"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] italic text-slate-400">Aucun retour prévu</p>
              )}
            </div>
          </section>
        </div>

        {/* Help Tip */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100 flex gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[10.5px] text-slate-500 leading-snug">
            Cliquez sur un jour pour voir les mouvements logistiques détaillés.
          </p>
        </div>
      </div>
    </div>
  );
}
