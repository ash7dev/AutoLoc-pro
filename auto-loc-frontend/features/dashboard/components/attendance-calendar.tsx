"use client";

import { ChevronLeft, ChevronRight, PlaneLanding, PlaneTakeoff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import type { Reservation } from "@/lib/nestjs/reservations";

const daysOfWeek = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

export interface CalendarDay {
  day: number;
  dateStr: string;
  status: "reserved" | null;
  hasCheckIn?: boolean;
  hasCheckOut?: boolean;
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
    return days.find(d => d.day === selectedDayDigit);
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
    <div className="flex flex-col lg:flex-row bg-white rounded-2xl border border-black/[0.06] shadow-sm shadow-black/[0.02] overflow-hidden">
      {/* ── Left Side: Calendar Grid ─────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-black/[0.04]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-black">Agenda Logistique</h3>
            {!loading && (
              <p className="text-[12px] text-black/30 font-medium tracking-tight mt-0.5">
                {reservedCount} jour{reservedCount > 1 ? "s" : ""} occupé{reservedCount > 1 ? "s" : ""} ce mois
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-black/5 p-1 rounded-xl border border-black/[0.06]">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={onPrev}>
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/60" />
            </Button>
            <span className="text-[11px] sm:text-[12px] font-bold min-w-[80px] sm:min-w-[100px] text-center uppercase tracking-widest text-black/80">
              {loading ? "..." : month}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={onNext}>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black/60" />
            </Button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2 sm:mb-3">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-[9.5px] font-black uppercase tracking-[0.2em] text-black/20 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {loading ? (
            Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg sm:rounded-xl bg-black/5 animate-pulse" />
            ))
          ) : (
            days.map((item) => (
              <button
                key={item.day}
                onClick={() => setSelectedDayDigit(item.day)}
                className={cn(
                  "relative aspect-square rounded-lg sm:rounded-xl text-[12px] sm:text-[13px] font-bold transition-all group",
                  selectedDayDigit === item.day 
                    ? "bg-black text-white shadow-xl ring-2 sm:ring-4 ring-black/5" 
                    : item.status === "reserved"
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "text-black/40 hover:bg-black/5"
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
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-black/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-black/40">Départ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-black/40">Retour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
            <span className="text-[10px] sm:text-[11px] font-bold text-black/40">Occupé</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Agenda for Selected Day ──────────────── */}
      <div className="lg:w-[320px] bg-black/[0.02] p-4 sm:p-6 flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h4 className="text-[9.5px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">
            Agenda du jour
          </h4>
          <p className="text-[13px] sm:text-[14px] font-bold text-black">
            {selectedDayDigit} {month}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 flex-1 overflow-auto">
          {/* Section Check-ins */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneTakeoff className="w-3.5 h-3.5 text-blue-500" />
              <h5 className="text-[11px] sm:text-[12px] font-bold text-black uppercase tracking-tight">Départs ({dailyAgenda.checkins.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkins.length > 0 ? (
                dailyAgenda.checkins.map(r => (
                  <div key={r.id} className="bg-white p-2.5 sm:p-3 rounded-xl border border-black/[0.06] shadow-sm flex flex-col gap-0.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-black truncate">{r.vehicule.marque} {r.vehicule.modele}</p>
                    <p className="text-[10px] sm:text-[11px] text-black/40 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                      <span className="text-blue-500">CLI :</span> {r.locataire.prenom} {r.locataire.nom.charAt(0)}.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] sm:text-[11px] italic text-black/30">Aucun départ prévu</p>
              )}
            </div>
          </section>

          {/* Section Check-outs */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneLanding className="w-3.5 h-3.5 text-emerald-500" />
              <h5 className="text-[11px] sm:text-[12px] font-bold text-black uppercase tracking-tight">Retours ({dailyAgenda.checkouts.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkouts.length > 0 ? (
                dailyAgenda.checkouts.map(r => (
                  <div key={r.id} className="bg-white p-2.5 sm:p-3 rounded-xl border border-black/[0.06] shadow-sm flex flex-col gap-0.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-black truncate">{r.vehicule.marque} {r.vehicule.modele}</p>
                    <p className="text-[10px] sm:text-[11px] text-black/40 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                      <span className="text-emerald-500">CLI :</span> {r.locataire.prenom} {r.locataire.nom.charAt(0)}.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] sm:text-[11px] italic text-black/30">Aucun retour prévu</p>
              )}
            </div>
          </section>
        </div>

        {/* Help Tip */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-black/[0.06] flex gap-2">
          <Info className="w-3.5 h-3.5 text-black/20 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[10.5px] text-black/40 leading-snug">
            Cliquez sur un jour pour voir les mouvements logistiques détaillés.
          </p>
        </div>
      </div>
    </div>
  );
}
