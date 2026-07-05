"use client";

import { Filter, TrendingDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingFunnelProps {
  totalRequests: number;
  accepted: number;
  paid: number;
  confirmed: number;
  completed: number;
  loading?: boolean;
}

export function BookingFunnel({
  totalRequests,
  accepted,
  paid,
  confirmed,
  completed,
  loading = false,
}: BookingFunnelProps) {
  const stages = [
    { label: "Demandes reçues", value: totalRequests, color: "slate", icon: Filter },
    { label: "Acceptées", value: accepted, color: "blue", icon: CheckCircle2 },
    { label: "Payées", value: paid, color: "emerald", icon: CheckCircle2 },
    { label: "Confirmées", value: confirmed, color: "emerald", icon: CheckCircle2 },
    { label: "Terminées", value: completed, color: "emerald", icon: CheckCircle2 },
  ];

  // Calculate percentages
  const maxValue = totalRequests > 0 ? totalRequests : 1;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded-lg bg-slate-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Tunnel de conversion
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Suivi du parcours client
            </p>
          </div>
          {totalRequests > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/60 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Taux conversion
                </p>
                <p className="text-lg font-black text-emerald-700 leading-none">
                  {((completed / totalRequests) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Funnel */}
      <div className="p-6 space-y-3">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const prevStage = index > 0 ? stages[index - 1] : null;
          const dropOff = prevStage ? prevStage.value - stage.value : 0;
          const dropOffPercentage = prevStage && prevStage.value > 0
            ? ((dropOff / prevStage.value) * 100)
            : 0;

          return (
            <div key={stage.label} className="space-y-1">
              {/* Stage bar */}
              <div className="relative">
                {/* Background bar */}
                <div className="h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                  {/* Fill bar */}
                  <div
                    className={cn(
                      "h-full rounded-xl transition-all duration-500 relative overflow-hidden",
                      stage.color === "emerald" && "bg-gradient-to-r from-emerald-500 to-emerald-600",
                      stage.color === "blue" && "bg-gradient-to-r from-blue-500 to-blue-600",
                      stage.color === "slate" && "bg-gradient-to-r from-slate-500 to-slate-600"
                    )}
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        stage.color === "emerald" && "bg-emerald-600/20",
                        stage.color === "blue" && "bg-blue-600/20",
                        stage.color === "slate" && "bg-slate-600/20"
                      )}>
                        <stage.icon className={cn(
                          "h-4.5 w-4.5",
                          stage.color === "emerald" && "text-emerald-600",
                          stage.color === "blue" && "text-blue-600",
                          stage.color === "slate" && "text-slate-600"
                        )} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {stage.label}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500">
                          {percentage.toFixed(0)}% du total
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        {stage.value}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop-off indicator */}
              {dropOff > 0 && index < stages.length - 1 && (
                <div className="flex items-center gap-2 px-2">
                  <TrendingDown className="h-3 w-3 text-red-500" strokeWidth={2} />
                  <p className="text-[10px] font-semibold text-red-600">
                    -{dropOff} ({dropOffPercentage.toFixed(1)}% de perte)
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {totalRequests === 0 && (
        <div className="px-6 pb-6 pt-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
            <p className="text-sm font-semibold text-slate-500">
              Aucune donnée disponible
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Les statistiques apparaîtront après vos premières réservations
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
