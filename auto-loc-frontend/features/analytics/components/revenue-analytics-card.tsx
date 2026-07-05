"use client";

import { TrendingUp, TrendingDown, DollarSign, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueAnalyticsCardProps {
  totalRevenue: number;
  averagePerBooking: number;
  averagePerDay: number;
  monthlyProjection: number;
  previousMonthRevenue: number;
  loading?: boolean;
}

export function RevenueAnalyticsCard({
  totalRevenue,
  averagePerBooking,
  averagePerDay,
  monthlyProjection,
  previousMonthRevenue,
  loading = false,
}: RevenueAnalyticsCardProps) {
  const percentChange = previousMonthRevenue > 0
    ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : totalRevenue > 0 ? 100 : 0;

  const isPositive = percentChange >= 0;

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded-lg bg-slate-200" />
          <div className="h-12 w-60 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="h-20 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Revenus du mois
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">
                {totalRevenue.toLocaleString("fr-FR")}
              </h2>
              <span className="text-xl font-semibold text-slate-500">FCFA</span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            <DollarSign className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Trend badge */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold",
            isPositive
              ? "bg-emerald-50 border border-emerald-200/60 text-emerald-600"
              : "bg-red-50 border border-red-200/60 text-red-600"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
            )}
            <span>
              {isPositive ? "+" : ""}{percentChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            vs mois précédent ({previousMonthRevenue.toLocaleString("fr-FR")} FCFA)
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

        {/* Sub metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Average per booking */}
          <div className="group/card relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-emerald-300/60 hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Target className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Moy / Location
                </p>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {averagePerBooking.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">FCFA</p>
            </div>
          </div>

          {/* Average per day */}
          <div className="group/card relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-emerald-300/60 hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" strokeWidth={2.5} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Moy / Jour
                </p>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {averagePerDay.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">FCFA</p>
            </div>
          </div>

          {/* Monthly projection */}
          <div className="group/card relative overflow-hidden rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-4 hover:border-violet-300/60 hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                  <TrendingUp className="h-3.5 w-3.5 text-violet-600" strokeWidth={2.5} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Projection
                </p>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {monthlyProjection.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">FCFA fin mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
