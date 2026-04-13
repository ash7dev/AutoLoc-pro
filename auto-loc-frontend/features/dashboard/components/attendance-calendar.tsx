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
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[400px] sm:min-h-[480px] flex flex-col lg:flex-row">
      
      {/* ── Left Side: Calendar Grid ─────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-50">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 className="text-[14px] sm:text-[15px] font-black tracking-tight text-slate-900">Agenda Logistique</h3>
            {!loading && (
              <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium">
                {reservedCount} jour{reservedCount > 1 ? "s" : ""} occupé{reservedCount > 1 ? "s" : ""} ce mois
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={onPrev}>
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
            </Button>
            <span className="text-[11px] sm:text-[12px] font-black min-w-[80px] sm:min-w-[100px] text-center uppercase tracking-wider text-slate-700">
              {loading ? "..." : month}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={onNext}>
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
            </Button>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2 sm:mb-3">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 py-1.5 sm:py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {loading ? (
            Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg sm:rounded-xl bg-slate-50 animate-pulse" />
            ))
          ) : (
            days.map((item) => (
              <button
                key={item.day}
                onClick={() => setSelectedDayDigit(item.day)}
                className={cn(
                  "relative aspect-square rounded-lg sm:rounded-xl text-[12px] sm:text-[13px] font-black transition-all group",
                  selectedDayDigit === item.day 
                    ? "bg-slate-900 text-white shadow-lg ring-2 sm:ring-4 ring-slate-100" 
                    : item.status === "reserved"
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "text-slate-400 hover:bg-slate-50"
                )}
              >
                {item.day}
                
                {/* Movement Indicators */}
                <div className="absolute bottom-1 sm:bottom-1.5 left-0 right-0 flex justify-center gap-0.5 sm:gap-1">
                  {item.hasCheckIn && (
                    <div className={cn("w-0.8 h-0.8 sm:w-1 sm:h-1 rounded-full bg-blue-500", selectedDayDigit === item.day && "bg-white")} />
                  )}
                  {item.hasCheckOut && (
                    <div className={cn("w-0.8 h-0.8 sm:w-1 sm:h-1 rounded-full bg-amber-500", selectedDayDigit === item.day && "bg-white")} />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Départ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Retour</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">Occupé</span>
          </div>
        </div>
      </div>

      {/* ── Right Side: Agenda for Selected Day ──────────────── */}
      <div className="lg:w-[320px] bg-slate-50/50 p-4 sm:p-6 flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">
            Agenda du jour
          </h4>
          <p className="text-[13px] sm:text-[14px] font-black text-slate-700">
            {selectedDayDigit} {month}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 flex-1 overflow-auto">
          {/* Section Check-ins */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneTakeoff className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-500" />
              <h5 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-tight">Départs ({dailyAgenda.checkins.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkins.length > 0 ? (
                dailyAgenda.checkins.map(r => (
                  <div key={r.id} className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-0.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-900 truncate">{r.vehicule.marque} {r.vehicule.modele}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 uppercase font-black tracking-wider">
                      <span className="text-blue-500">CLI :</span> {r.locataire.prenom} {r.locataire.nom.charAt(0)}.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] sm:text-[11px] italic text-slate-400">Aucun départ prévu</p>
              )}
            </div>
          </section>

          {/* Section Check-outs */}
          <section>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PlaneLanding className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
              <h5 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-tight">Retours ({dailyAgenda.checkouts.length})</h5>
            </div>
            <div className="space-y-2">
              {dailyAgenda.checkouts.length > 0 ? (
                dailyAgenda.checkouts.map(r => (
                  <div key={r.id} className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-0.5">
                    <p className="text-[11px] sm:text-[12px] font-bold text-slate-900 truncate">{r.vehicule.marque} {r.vehicule.modele}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 uppercase font-black tracking-wider">
                      <span className="text-amber-500">CLI :</span> {r.locataire.prenom} {r.locataire.nom.charAt(0)}.
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] sm:text-[11px] italic text-slate-400">Aucun retour prévu</p>
              )}
            </div>
          </section>
        </div>

        {/* Help Tip */}
        <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-100 flex gap-2">
          <Info className="w-3 w-3 sm:w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[10.5px] text-slate-400 leading-snug">
            Cliquez sur un jour pour voir les mouvementslogistiques détaillés.
          </p>
        </div>
      </div>
    </div>
  );
}
