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
    ? "bg-black/[0.04] text-black/40 border-black/[0.06]"
    : isPositive
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : "bg-red-500/10 text-red-600 border-red-500/20";

  return (
    <div className="lg:hidden rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm shadow-black/[0.02]">
      <div className="flex items-start justify-between gap-3 mb-4">

        {/* Period label */}
        <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-black/30">
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
      <div className="space-y-1">
        <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">Revenus</p>
        {loading ? (
          <div className="h-8 w-28 rounded-xl bg-black/[0.04] animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-black text-black tabular-nums tracking-tighter leading-none">
              {total}
            </span>
            <span className="text-[13px] font-bold text-black/30">FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
}