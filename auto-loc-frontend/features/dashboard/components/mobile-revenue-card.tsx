"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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
    ? "bg-slate-100 text-slate-500 border-slate-200"
    : isPositive
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-600 border-red-200";

  return (
    <div className="lg:hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100/60">
      <div className="flex items-start justify-between gap-3 mb-4">

        {/* Period label */}
        <p className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">
          {period}
        </p>

        {/* Trend badge */}
        <div className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold",
          trendCls,
        )}>
          <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
          {change}
        </div>
      </div>

      {/* Revenue */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 mb-1">Revenus</p>
        {loading ? (
          <div className="h-8 w-28 rounded-xl bg-slate-100 animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-black text-slate-900 tabular-nums tracking-tight leading-none">
              {total}
            </span>
            <span className="text-[13px] font-semibold text-slate-400">FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
}