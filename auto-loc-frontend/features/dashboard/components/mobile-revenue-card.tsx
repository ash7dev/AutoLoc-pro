"use client";

import { TrendingUp, TrendingDown, Minus, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileRevenueCardProps {
  total: string;
  change: string;
  period: string;
  loading?: boolean;
}

export function MobileRevenueCard({
  total,
  change,
  period,
  loading = false,
}: MobileRevenueCardProps) {
  const isPositive = change.startsWith("+");
  const isNeutral = change === "0%" || change === "—";

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const trendCls = isNeutral
    ? "bg-slate-50 text-slate-400 border-slate-100"
    : isPositive
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : "bg-red-50 text-red-600 border-red-100";

  return (
    <div className={cn(
      "lg:hidden relative overflow-hidden rounded-2xl p-5",
      "border border-l-[3px] border-white/70 border-l-emerald-500",
      "bg-white/70 backdrop-blur-xl",
      "shadow-sm",
    )}>
      {/* Decorative orb */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-[0.05] pointer-events-none blur-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center shadow-sm">
            <Banknote className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {period}
          </p>
        </div>

        {/* Trend badge */}
        <div className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold",
          trendCls,
        )}>
          <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
          {change}
        </div>
      </div>

      {/* Revenue */}
      <div className="relative z-10 space-y-1">
        <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 mb-1">Revenus</p>
        {loading ? (
          <div className="h-8 w-28 rounded-xl bg-slate-100 animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-black text-slate-900 tabular-nums tracking-tighter leading-none">
              {total}
            </span>
            <span className="text-[12px] font-bold text-slate-300">FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
}