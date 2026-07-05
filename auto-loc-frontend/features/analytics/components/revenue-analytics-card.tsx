"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Sparkles } from "lucide-react";
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
      <div className="relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/50 to-white p-8 shadow-xl shadow-slate-950/[0.04]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-xl bg-slate-200/70" />
          <div className="h-16 w-80 rounded-2xl bg-slate-200/70" />
          <div className="grid grid-cols-3 gap-5">
            <div className="h-28 rounded-2xl bg-slate-100/70" />
            <div className="h-28 rounded-2xl bg-slate-100/70" />
            <div className="h-28 rounded-2xl bg-slate-100/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/50 to-white shadow-xl shadow-slate-950/[0.04] hover:shadow-2xl hover:shadow-slate-950/[0.08] transition-all duration-500">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.04),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(99,102,241,0.03),transparent_50%)]" />

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Top border accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="relative p-8 space-y-7">
        {/* Header section */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            {/* Label with premium badge */}
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-900/5 to-slate-900/[0.02] border border-slate-900/[0.08]">
                <Sparkles className="h-3 w-3 text-slate-600" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">Revenus du mois</span>
              </div>
            </div>

            {/* Main revenue display */}
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-3">
                <h2 className="text-6xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-[-0.02em] leading-none">
                  {totalRevenue.toLocaleString("fr-FR")}
                </h2>
                <span className="text-2xl font-bold text-slate-400 tracking-tight">FCFA</span>
              </div>

              {/* Trend indicator */}
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
                  isPositive
                    ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                    : "bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20"
                )}>
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" strokeWidth={3} />
                  )}
                  <span className={cn(
                    "text-sm font-black tabular-nums",
                    isPositive ? "text-emerald-600" : "text-red-600"
                  )}>
                    {isPositive ? "+" : ""}{percentChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  vs {previousMonthRevenue.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </div>
          </div>

          {/* Floating icon with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Wallet className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Glass divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent" />

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Average per booking */}
          <div className="group/stat relative overflow-hidden rounded-2xl border border-slate-950/[0.06] bg-gradient-to-br from-white to-slate-50/50 p-5 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <div className="relative space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/10 group-hover/stat:scale-110 transition-transform">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                  Moy. / Location
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                    {averagePerBooking.toLocaleString("fr-FR")}
                  </p>
                  <span className="text-xs font-bold text-slate-400">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average per day */}
          <div className="group/stat relative overflow-hidden rounded-2xl border border-slate-950/[0.06] bg-gradient-to-br from-white to-slate-50/50 p-5 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <div className="relative space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/10 group-hover/stat:scale-110 transition-transform">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                  Moy. / Jour
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                    {averagePerDay.toLocaleString("fr-FR")}
                  </p>
                  <span className="text-xs font-bold text-slate-400">FCFA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly projection */}
          <div className="group/stat relative overflow-hidden rounded-2xl border border-slate-950/[0.06] bg-gradient-to-br from-white to-violet-50/30 p-5 hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <div className="relative space-y-3">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/10 group-hover/stat:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-violet-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                  Projection
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-3xl font-black bg-gradient-to-r from-violet-600 to-violet-700 bg-clip-text text-transparent tracking-tight tabular-nums">
                    {monthlyProjection.toLocaleString("fr-FR")}
                  </p>
                  <span className="text-xs font-bold text-slate-400">FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
