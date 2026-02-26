"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

export interface CalendarDay {
  day: number;
  status: "reserved" | null;
}

const defaultCalendarData: CalendarDay[] = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  status: [7, 8, 9, 10].includes(i + 1) ? "reserved" : null,
}));

export function AttendanceCalendar({
  month = "Juin 2025",
  days = defaultCalendarData,
  onPrev,
  onNext,
  onSelectDay,
  loading = false,
}: {
  month?: string;
  days?: CalendarDay[];
  onPrev?: () => void;
  onNext?: () => void;
  onSelectDay?: (day: CalendarDay) => void;
  loading?: boolean;
}) {
  const reservedCount = days.filter((d) => d.status === "reserved").length;

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--border))]">
        <div>
          <h3 className="text-xl font-bold">Disponibilité</h3>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {reservedCount} jour{reservedCount > 1 ? "s" : ""} réservé{reservedCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[96px] text-center">
            {loading ? "—" : month}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar body */}
      <div className="p-6">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-muted-foreground py-1.5"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {loading
            ? Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md bg-muted animate-pulse"
                />
              ))
            : days.map((item) => (
                <button
                  key={item.day}
                  onClick={() => onSelectDay?.(item)}
                  className={cn(
                    "aspect-square rounded-md text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item.status === "reserved"
                      ? "bg-emerald-400 text-white hover:bg-emerald-500 shadow-sm"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.day}
                </button>
              ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-muted-foreground">Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-muted border border-[hsl(var(--border))]" />
            <span className="text-xs text-muted-foreground">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
