"use client";

import { Users, UserCheck, CreditCard, ShieldCheck, CheckCircle, TrendingDown } from "lucide-react";
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
    { label: "Demandes reçues", value: totalRequests, color: "slate", gradient: "from-slate-500 via-slate-600 to-slate-700", icon: Users },
    { label: "Acceptées", value: accepted, color: "blue", gradient: "from-blue-500 via-blue-600 to-blue-700", icon: UserCheck },
    { label: "Payées", value: paid, color: "violet", gradient: "from-violet-500 via-violet-600 to-violet-700", icon: CreditCard },
    { label: "Confirmées", value: confirmed, color: "emerald", gradient: "from-emerald-500 via-emerald-600 to-emerald-700", icon: ShieldCheck },
    { label: "Terminées", value: completed, color: "teal", gradient: "from-teal-500 via-teal-600 to-teal-700", icon: CheckCircle },
  ];

  // Calculate percentages
  const maxValue = totalRequests > 0 ? totalRequests : 1;

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-xl shadow-slate-950/[0.04]">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-xl bg-slate-200/70" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/30 to-white shadow-xl shadow-slate-950/[0.04]">
      {/* Top accent border */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(20,184,166,0.02),transparent_50%)]" />

      {/* Header */}
      <div className="relative border-b border-slate-950/[0.06] bg-gradient-to-b from-slate-50/50 to-white/50 backdrop-blur-sm px-7 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-[-0.01em]">
              Tunnel de conversion
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Suivi du parcours client
            </p>
          </div>
          {totalRequests > 0 && (
            <div className="flex flex-col items-end gap-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/10 to-teal-600/5 border border-teal-500/20">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wide text-teal-700">
                  Taux conversion
                </span>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent tracking-tight tabular-nums leading-none">
                {((completed / totalRequests) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Funnel */}
      <div className="relative p-7 space-y-4">
        {stages.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const prevStage = index > 0 ? stages[index - 1] : null;
          const dropOff = prevStage ? prevStage.value - stage.value : 0;
          const dropOffPercentage = prevStage && prevStage.value > 0
            ? ((dropOff / prevStage.value) * 100)
            : 0;

          return (
            <div key={stage.label} className="group space-y-2">
              {/* Stage bar */}
              <div className="relative">
                {/* Background bar with glass effect */}
                <div className="h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-950/[0.06] overflow-hidden shadow-sm backdrop-blur-sm">
                  {/* Fill bar with triple gradient */}
                  <div
                    className={cn(
                      "h-full rounded-2xl transition-all duration-700 relative overflow-hidden shadow-lg",
                      `bg-gradient-to-r ${stage.gradient}`
                    )}
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                    {/* Inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                  </div>

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-center justify-between px-5">
                    <div className="flex items-center gap-4">
                      {/* Icon with glow */}
                      <div className="relative">
                        <div className={cn(
                          "absolute inset-0 rounded-xl blur-md opacity-40",
                          stage.color === "slate" && "bg-slate-500",
                          stage.color === "blue" && "bg-blue-500",
                          stage.color === "violet" && "bg-violet-500",
                          stage.color === "emerald" && "bg-emerald-500",
                          stage.color === "teal" && "bg-teal-500"
                        )} />
                        <div className={cn(
                          "relative flex h-11 w-11 items-center justify-center rounded-xl shadow-lg backdrop-blur-sm border",
                          stage.color === "slate" && "bg-slate-500/20 border-slate-400/30",
                          stage.color === "blue" && "bg-blue-500/20 border-blue-400/30",
                          stage.color === "violet" && "bg-violet-500/20 border-violet-400/30",
                          stage.color === "emerald" && "bg-emerald-500/20 border-emerald-400/30",
                          stage.color === "teal" && "bg-teal-500/20 border-teal-400/30"
                        )}>
                          <stage.icon className={cn(
                            "h-5 w-5",
                            stage.color === "slate" && "text-slate-700",
                            stage.color === "blue" && "text-blue-700",
                            stage.color === "violet" && "text-violet-700",
                            stage.color === "emerald" && "text-emerald-700",
                            stage.color === "teal" && "text-teal-700"
                          )} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Labels */}
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-slate-900 tracking-tight">
                          {stage.label}
                        </p>
                        <p className="text-xs font-bold text-slate-500 tabular-nums">
                          {percentage.toFixed(1)}% du total
                        </p>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-right">
                      <p className="text-3xl font-black text-slate-900 tracking-tight leading-none tabular-nums">
                        {stage.value}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {stage.value > 1 ? 'demandes' : 'demande'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drop-off indicator with better design */}
              {dropOff > 0 && index < stages.length - 1 && (
                <div className="flex items-center gap-2 px-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs font-bold text-red-700 tabular-nums">
                    -{dropOff} <span className="font-semibold text-red-600">({dropOffPercentage.toFixed(1)}% de perte)</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {totalRequests === 0 && (
        <div className="px-7 pb-7 pt-2">
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-950/[0.06] p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 mb-4">
              <Users className="h-8 w-8 text-slate-500" strokeWidth={2} />
            </div>
            <p className="text-base font-black text-slate-900 mb-1">
              Aucune donnée disponible
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Les statistiques apparaîtront après vos premières réservations
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
