"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, Car, Activity, Shield, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OwnerStats } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
interface StatItem {
  label: string;
  value: string;
  unit: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  accentColor: "emerald" | "blue" | "amber" | "red";
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function formatRevenu(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(Math.round(n));
}

function buildStats(data: OwnerStats | null | undefined): StatItem[] {
  if (!data) return SKELETON_STATS;
  return [
    {
      label: "Revenus du mois",
      value: formatRevenu(data.revenusMois),
      unit: "FCFA",
      delta: data.revenusMois > 0 ? "Ce mois-ci" : "Aucun revenu",
      trend: data.revenusMois > 0 ? "up" : "neutral",
      icon: TrendingUp,
      accentColor: "emerald",
    },
    {
      label: "Réservations actives",
      value: String(data.reservationsActives),
      unit: "en cours",
      delta: data.reservationsActives > 0
        ? `${data.reservationsActives} location${data.reservationsActives > 1 ? "s" : ""}`
        : "Aucune active",
      trend: data.reservationsActives > 0 ? "up" : "neutral",
      icon: Car,
      accentColor: "blue",
    },
    {
      label: "Taux d'occupation",
      value: String(data.tauxOccupation),
      unit: "%",
      delta: data.tauxOccupation >= 70
        ? "Très bon taux"
        : data.tauxOccupation > 0
          ? "En activité"
          : "Aucune réservation",
      trend: data.tauxOccupation >= 50 ? "up" : data.tauxOccupation > 0 ? "neutral" : "neutral",
      icon: Activity,
      accentColor: "amber",
    },
    {
      label: "Litiges ouverts",
      value: String(data.litigesOuverts),
      unit: data.litigesOuverts !== 1 ? "litiges" : "litige",
      delta: data.litigesOuverts === 0 ? "Aucun problème" : "Nécessite attention",
      trend: data.litigesOuverts === 0 ? "neutral" : "down",
      icon: Shield,
      accentColor: data.litigesOuverts === 0 ? "emerald" : "red",
    },
  ];
}

const SKELETON_STATS: StatItem[] = [
  { label: "Revenus du mois", value: "—", unit: "FCFA", delta: "", trend: "neutral", icon: TrendingUp, accentColor: "emerald" },
  { label: "Réservations actives", value: "—", unit: "en cours", delta: "", trend: "neutral", icon: Car, accentColor: "blue" },
  { label: "Taux d'occupation", value: "—", unit: "%", delta: "", trend: "neutral", icon: Activity, accentColor: "amber" },
  { label: "Litiges ouverts", value: "—", unit: "litige", delta: "", trend: "neutral", icon: Shield, accentColor: "emerald" },
];

/* ── Accent token maps ──────────────────────────────────────── */
const ICON_BG: Record<StatItem["accentColor"], string> = {
  emerald: "bg-emerald-50 border-emerald-100",
  blue: "bg-blue-50 border-blue-100",
  amber: "bg-amber-50 border-amber-100",
  red: "bg-red-50 border-red-100",
};
const ICON_COLOR: Record<StatItem["accentColor"], string> = {
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  amber: "text-amber-600",
  red: "text-red-500",
};
const VALUE_COLOR: Record<StatItem["accentColor"], string> = {
  emerald: "text-emerald-700",
  blue: "text-slate-900",
  amber: "text-slate-900",
  red: "text-red-600",
};

const TREND_CONFIG = {
  up: { icon: ArrowUpRight, cls: "text-emerald-600 bg-emerald-50" },
  down: { icon: ArrowDownRight, cls: "text-red-500 bg-red-50" },
  neutral: { icon: Minus, cls: "text-slate-400 bg-slate-100" },
};

/* ════════════════════════════════════════════════════════════════
   STAT CARD
════════════════════════════════════════════════════════════════ */
function StatCard({ stat, loading }: { stat: StatItem; loading: boolean }) {
  const Icon = stat.icon;
  const TrendIcon = TREND_CONFIG[stat.trend].icon;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-100/60 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-200 transition-all duration-200 overflow-hidden group">

      {/* Subtle top accent line */}
      <div className={cn(
        "absolute top-0 left-5 right-5 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        stat.accentColor === "emerald" && "bg-emerald-400",
        stat.accentColor === "blue" && "bg-blue-400",
        stat.accentColor === "amber" && "bg-amber-400",
        stat.accentColor === "red" && "bg-red-400",
      )} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* Label */}
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 mb-3">
            {stat.label}
          </p>

          {/* Value */}
          {loading ? (
            <div className="h-8 w-20 rounded-xl bg-slate-100 animate-pulse mb-2" />
          ) : (
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className={cn(
                "text-[30px] font-black tabular-nums tracking-tight leading-none",
                VALUE_COLOR[stat.accentColor],
              )}>
                {stat.value}
              </span>
              <span className="text-[12px] font-semibold text-slate-400">
                {stat.unit}
              </span>
            </div>
          )}

          {/* Delta */}
          {loading ? (
            <div className="h-3.5 w-24 rounded-lg bg-slate-100 animate-pulse" />
          ) : stat.delta ? (
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold",
              TREND_CONFIG[stat.trend].cls,
            )}>
              <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
              {stat.delta}
            </div>
          ) : null}
        </div>

        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
          ICON_BG[stat.accentColor],
        )}>
          <Icon className={cn("w-5 h-5", ICON_COLOR[stat.accentColor])} strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EXPORT
════════════════════════════════════════════════════════════════ */
export function OverviewStats({
  data,
  loading = false,
}: {
  data?: OwnerStats | null;
  loading?: boolean;
}) {
  const stats = buildStats(data);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} loading={loading || !data} />
      ))}
    </div>
  );
}