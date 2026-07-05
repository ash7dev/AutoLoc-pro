"use client";

import { BarChart3, Calendar, Zap, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
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
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-lg shadow-slate-950/[0.03]">
            <div className="animate-pulse space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200/70" />
              <div className="h-5 w-32 rounded-lg bg-slate-200/70" />
              <div className="h-10 w-40 rounded-xl bg-slate-200/70" />
              <div className="h-6 w-24 rounded-full bg-slate-100/70" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Taux d'occupation",
      value: occupancyRate.toFixed(1),
      unit: "%",
      icon: BarChart3,
      accentColor: "emerald",
      trend: occupancyRate >= 60 ? "good" : occupancyRate >= 40 ? "medium" : "low",
      trendLabel: occupancyRate >= 60 ? "Excellent" : occupancyRate >= 40 ? "Correct" : "À améliorer",
    },
    {
      label: "Réservations totales",
      value: totalBookings.toString(),
      unit: "",
      icon: Calendar,
      accentColor: "blue",
      trend: totalBookings > 0 ? "good" : "low",
      trendLabel: totalBookings > 10 ? "Très actif" : totalBookings > 0 ? "En croissance" : "Aucune",
    },
    {
      label: "Revenu / Jour dispo",
      value: revPAD.toLocaleString("fr-FR"),
      unit: " FCFA",
      icon: Zap,
      accentColor: "violet",
      trend: revPAD > 0 ? "good" : "low",
      trendLabel: revPAD > 10000 ? "Performant" : revPAD > 0 ? "En progression" : "Inactif",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-5">
      {kpis.map((kpi, index) => {
        const isGood = kpi.trend === "good";
        const isMedium = kpi.trend === "medium";

        return (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/30 to-white shadow-lg shadow-slate-950/[0.03] hover:shadow-2xl hover:shadow-slate-950/[0.06] hover:-translate-y-1 transition-all duration-500"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Gradient mesh overlay */}
            <div className={cn(
              "absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_0%,var(--glow),transparent_60%)]",
              kpi.accentColor === "emerald" && "[--glow:rgba(16,185,129,1)]",
              kpi.accentColor === "blue" && "[--glow:rgba(59,130,246,1)]",
              kpi.accentColor === "violet" && "[--glow:rgba(139,92,246,1)]"
            )} />

            {/* Shimmer on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>

            {/* Top accent border */}
            <div className={cn(
              "absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-60",
              kpi.accentColor === "emerald" && "text-emerald-500",
              kpi.accentColor === "blue" && "text-blue-500",
              kpi.accentColor === "violet" && "text-violet-500"
            )} />

            <div className="relative p-6 space-y-5">
              {/* Icon with glow effect */}
              <div className="relative inline-block">
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity",
                  kpi.accentColor === "emerald" && "bg-gradient-to-br from-emerald-400 to-emerald-600",
                  kpi.accentColor === "blue" && "bg-gradient-to-br from-blue-400 to-blue-600",
                  kpi.accentColor === "violet" && "bg-gradient-to-br from-violet-400 to-violet-600"
                )} />
                <div className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
                  kpi.accentColor === "emerald" && "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-emerald-500/40",
                  kpi.accentColor === "blue" && "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/40",
                  kpi.accentColor === "violet" && "bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 shadow-violet-500/40"
                )}>
                  <kpi.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Label */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 mb-3">
                  {kpi.label}
                </p>

                {/* Value with unit */}
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-5xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-[-0.02em] leading-none tabular-nums">
                    {kpi.value}
                  </h3>
                  <span className="text-xl font-bold text-slate-400 tracking-tight">
                    {kpi.unit}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className="pt-1">
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border backdrop-blur-sm",
                  isGood && kpi.accentColor === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-700",
                  isGood && kpi.accentColor === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-700",
                  isGood && kpi.accentColor === "violet" && "bg-violet-500/10 border-violet-500/20 text-violet-700",
                  isMedium && "bg-amber-500/10 border-amber-500/20 text-amber-700",
                  !isGood && !isMedium && "bg-slate-500/10 border-slate-500/20 text-slate-600"
                )}>
                  {isGood && <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {isMedium && <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  {!isGood && !isMedium && <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} />}
                  <span className="text-xs font-black tracking-tight">
                    {kpi.trendLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
