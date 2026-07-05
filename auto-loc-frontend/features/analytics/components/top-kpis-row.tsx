"use client";

import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopKPIsRowProps {
  occupancyRate: number; // Percentage 0-100
  totalBookings: number;
  revPAD: number; // Revenue Per Available Day
  loading?: boolean;
}

export function TopKPIsRow({
  occupancyRate,
  totalBookings,
  revPAD,
  loading = false,
}: TopKPIsRowProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-8 w-32 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Taux d'occupation",
      value: `${occupancyRate.toFixed(1)}%`,
      icon: BarChart3,
      color: "emerald",
      trend: occupancyRate >= 60 ? "good" : occupancyRate >= 40 ? "medium" : "low",
    },
    {
      label: "Réservations totales",
      value: totalBookings.toString(),
      icon: Calendar,
      color: "blue",
      trend: totalBookings > 0 ? "good" : "low",
    },
    {
      label: "Revenue/Jour Dispo",
      value: `${revPAD.toLocaleString("fr-FR")} F`,
      icon: TrendingUp,
      color: "violet",
      trend: revPAD > 0 ? "good" : "low",
    },
  ];

  const colorMap = {
    emerald: {
      bg: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-500/25",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-200/60",
      badgeText: "text-emerald-600",
    },
    blue: {
      bg: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/25",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-200/60",
      badgeText: "text-blue-600",
    },
    violet: {
      bg: "from-violet-500 to-violet-600",
      shadow: "shadow-violet-500/25",
      badgeBg: "bg-violet-50",
      badgeBorder: "border-violet-200/60",
      badgeText: "text-violet-600",
    },
  } as const;

  return (
    <div className="grid grid-cols-3 gap-4">
      {kpis.map((kpi, index) => {
        const colors = colorMap[kpi.color as keyof typeof colorMap];
        return (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            {/* Ambient glow */}
            <div className={cn(
              "absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500",
              kpi.color === "emerald" && "bg-emerald-500",
              kpi.color === "blue" && "bg-blue-500",
              kpi.color === "violet" && "bg-violet-500",
            )} />

            <div className="relative p-5 space-y-4">
              {/* Icon */}
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                colors.bg,
                colors.shadow
              )}>
                <kpi.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>

              {/* Label */}
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {kpi.label}
              </p>

              {/* Value */}
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {kpi.value}
                </p>
              </div>

              {/* Trend indicator */}
              <div className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold border",
                kpi.trend === "good" && colors.badgeBg + " " + colors.badgeBorder + " " + colors.badgeText,
                kpi.trend === "medium" && "bg-amber-50 border-amber-200/60 text-amber-600",
                kpi.trend === "low" && "bg-slate-50 border-slate-200/60 text-slate-500"
              )}>
                {kpi.trend === "good" && "✓ Excellent"}
                {kpi.trend === "medium" && "→ Moyen"}
                {kpi.trend === "low" && "↓ Faible"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
