"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OccupancyDay {
  date: string; // YYYY-MM-DD
  isOccupied: boolean;
  bookingsCount: number;
}

interface OccupancyHeatmapProps {
  data: OccupancyDay[];
  loading?: boolean;
}

export function OccupancyHeatmap({ data, loading = false }: OccupancyHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get days for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Calculate stats
  const occupiedDays = data.filter(d => d.isOccupied).length;
  const totalDays = data.length;
  const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

  const monthName = currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Calendrier d'occupation
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Vue mensuelle des réservations
            </p>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <div className="min-w-[160px] text-center">
              <p className="text-sm font-bold text-slate-900">{monthName}</p>
            </div>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-emerald-500" />
            <p className="text-xs font-medium text-slate-600">
              Occupé ({occupiedDays}j)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-slate-100 border border-slate-200" />
            <p className="text-xs font-medium text-slate-600">
              Disponible ({totalDays - occupiedDays}j)
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-xs font-medium text-slate-500">
              Taux: <span className="font-bold text-emerald-600">{occupancyRate.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
            <div key={day} className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {day}
              </p>
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = new Date(year, month, day).toISOString().split("T")[0];
            const dayData = data.find(d => d.date === dateStr);
            const isOccupied = dayData?.isOccupied ?? false;
            const bookingsCount = dayData?.bookingsCount ?? 0;

            return (
              <div
                key={day}
                className={cn(
                  "group relative aspect-square rounded-lg border transition-all cursor-default",
                  isOccupied
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 hover:scale-105 shadow-sm shadow-emerald-500/25"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                  <p className={cn(
                    "text-sm font-bold leading-none",
                    isOccupied ? "text-white" : "text-slate-700"
                  )}>
                    {day}
                  </p>
                  {bookingsCount > 0 && (
                    <p className="text-[8px] font-bold text-white/80 mt-0.5">
                      {bookingsCount}x
                    </p>
                  )}
                </div>

                {/* Tooltip */}
                {isOccupied && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {bookingsCount} réservation{bookingsCount > 1 ? "s" : ""}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
