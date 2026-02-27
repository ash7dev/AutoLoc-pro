"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
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
  loading = false 
}: MobileRevenueCardProps) {
  const isPositive = change.startsWith('+');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="lg:hidden bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-black/40 uppercase tracking-wider">
          {period}
        </span>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold",
          isPositive 
            ? "bg-emerald-50 text-emerald-600" 
            : "bg-red-50 text-red-600"
        )}>
          <TrendIcon className="w-3 h-3" />
          {change}
        </div>
      </div>
      
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-black/40">
          Revenus
        </span>
        {loading ? (
          <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <div className="text-2xl font-bold text-black tracking-tight">
            {total} FCFA
          </div>
        )}
      </div>
    </div>
  );
}
