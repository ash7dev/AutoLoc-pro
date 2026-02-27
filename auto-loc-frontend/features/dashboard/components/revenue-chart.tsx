"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RevenuePoint {
  day: string;
  value: number;
  highlight?: boolean;
}

const defaultChartData: RevenuePoint[] = [
  { day: "01 Nov", value: 5000 },
  { day: "05 Nov", value: 2000 },
  { day: "10 Nov", value: 8000 },
  { day: "15 Nov", value: 5000, highlight: true },
  { day: "20 Nov", value: 2000 },
  { day: "25 Nov", value: 3800 },
  { day: "30 Nov", value: 2000 },
];

const monthOptions = [
  { value: "current", label: "Ce mois-ci" },
  { value: "last", label: "Mois dernier" },
  { value: "2months", label: "Il y a 2 mois" },
];

export function RevenueChart({
  data = defaultChartData,
  total = "400,000",
  change = "+12%",
  loading = false,
  selectedMonth = "current",
  onMonthChange,
}: {
  data?: RevenuePoint[];
  total?: string;
  change?: string;
  loading?: boolean;
  selectedMonth?: string;
  onMonthChange?: (m: string) => void;
}) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  const handleMonthChange = (val: string) => {
    onMonthChange?.(val);
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-[hsl(var(--border))] bg-card p-4 sm:p-6 shadow-sm h-full flex flex-col min-h-[260px] sm:min-h-[320px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Aperçu des revenus</p>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                {loading ? "—" : total}
                <span className="text-sm font-medium text-muted-foreground ml-1.5">FCFA</span>
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <TrendingUp className="h-3 w-3" />
                  {change}
                </span>
              )}
            </div>
          </div>

          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full sm:w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-sm">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="relative h-40 sm:h-56 flex-1 min-h-[160px] sm:min-h-[224px]">
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
            {["150K", "100K", "50K", "0"].map((label) => (
              <span key={label} className="text-xs text-muted-foreground w-10 text-right">
                {label}
              </span>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-full h-px bg-border/50" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end gap-2">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 animate-pulse">
                  <div
                    className="w-full rounded-t-md bg-muted"
                    style={{ height: "40%" }}
                  />
                  <span className="text-xs text-muted-foreground">—</span>
                </div>
              ))
              : data.map((point) => {
                const heightPct = (point.value / maxValue) * 100;
                return (
                  <Tooltip key={point.day}>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                        <div
                          className={cn(
                            "w-full rounded-t-md transition-all duration-200",
                            point.highlight
                              ? "bg-emerald-400 group-hover:bg-emerald-500"
                              : "bg-emerald-200 group-hover:bg-emerald-300"
                          )}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-xs text-muted-foreground truncate w-full text-center">
                          {point.day.split(" ")[0]}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="backdrop-blur-sm text-xs font-medium"
                    >
                      <p className="font-semibold">{point.day}</p>
                      <p className="text-muted-foreground">
                        {point.value.toLocaleString("fr-FR")} FCFA
                      </p>
                      {point.highlight && (
                        <p className="text-emerald-400 font-bold">Pic du mois 🏆</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
