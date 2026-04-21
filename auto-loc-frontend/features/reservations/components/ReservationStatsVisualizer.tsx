"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import Link from "next/link";
import {
  PieChart as PieChartIcon,
  Zap, CheckCircle2, Timer, Clock,
  XCircle, AlertTriangle, ChevronRight, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ReservationStatut } from "@/lib/nestjs/reservations";

/* ════════════════════════════════════════════════════════════════
   STATUS CONFIG
   Premium color palette using HSL for consistency
════════════════════════════════════════════════════════════════ */

interface StatusConfig {
  label: string;
  color: string;       // Legend dot bg
  hex: string;         // Recharts hex
  hexHover: string;    // Recharts hover hex
  textCls: string;     // Text color class
  badgeCls: string;    // Badge style class
  icon: React.ElementType;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  PAYEE: {
    label: "À valider",
    color: "bg-amber-500",
    hex: "#f59e0b",
    hexHover: "#fbbf24",
    textCls: "text-amber-600",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Zap,
  },
  CONFIRMEE: {
    label: "Confirmées",
    color: "bg-emerald-500",
    hex: "#10b981",
    hexHover: "#34d399",
    textCls: "text-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: "En cours",
    color: "bg-indigo-500",
    hex: "#6366f1",
    hexHover: "#818cf8",
    textCls: "text-indigo-600",
    badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-100",
    icon: Timer,
  },
  TERMINEE: {
    label: "Terminées",
    color: "bg-slate-400",
    hex: "#94a3b8",
    hexHover: "#cbd5e1",
    textCls: "text-slate-500",
    badgeCls: "bg-slate-50 text-slate-600 border-slate-200",
    icon: Clock,
  },
  ANNULEE: {
    label: "Annulées",
    color: "bg-rose-500",
    hex: "#f43f5e",
    hexHover: "#fb7185",
    textCls: "text-rose-600",
    badgeCls: "bg-rose-50 text-rose-600 border-rose-100",
    icon: XCircle,
  },
  LITIGE: {
    label: "Litiges",
    color: "bg-orange-500",
    hex: "#f97316",
    hexHover: "#fb923c",
    textCls: "text-orange-600",
    badgeCls: "bg-orange-50 text-orange-700 border-orange-100",
    icon: AlertTriangle,
  },
};

const STATUS_ORDER: ReservationStatut[] = [
  "PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE", "LITIGE",
];

/* ════════════════════════════════════════════════════════════════
   CUSTOM ACTIVE SHAPE
   Ultra-smooth animated hover with glow
════════════════════════════════════════════════════════════════ */

function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload,
  } = props;

  const hexHover = STATUS_MAP[payload.statut]?.hexHover ?? fill;

  return (
    <g>
      {/* Outer Glow */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 1}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={hexHover}
        cornerRadius={6}
        style={{ filter: "url(#glow)" }}
        className="transition-all duration-500 ease-out"
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 1}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="rgba(255,255,255,0.2)"
        cornerRadius={6}
      />
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEGEND ITEM
════════════════════════════════════════════════════════════════ */

function LegendRow({
  config,
  count,
  percent,
  isActive,
  onHover,
  onLeave,
}: {
  config: StatusConfig;
  count: number;
  percent: number;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const Icon = config.icon;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-300 cursor-default",
        isActive
          ? "border-slate-200 bg-white shadow-lg shadow-slate-900/5 scale-[1.02] z-10"
          : "border-transparent hover:bg-white/40",
      )}
    >
      <div className={cn(
        "w-2.5 h-2.5 rounded-full ring-2 ring-white transition-all duration-300",
        config.color,
        isActive && "scale-125 ring-offset-1",
      )} />

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={cn("w-3.5 h-3.5 shrink-0", config.textCls)} strokeWidth={2.2} />
        <span className={cn(
          "text-[12px] font-bold tracking-tight truncate transition-colors",
          isActive ? "text-slate-900" : "text-slate-500",
        )}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "text-[13px] font-black tabular-nums transition-colors",
          isActive ? "text-slate-900" : "text-slate-700",
        )}>
          {count}
        </span>
        <span className={cn(
          "text-[9px] font-black tabular-nums px-1.5 py-0.5 rounded-md border tracking-tighter transition-all",
          config.badgeCls,
          isActive ? "opacity-100" : "opacity-60",
        )}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════════════ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
        <PieChartIcon className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
          Aucune donnée
        </p>
        <p className="text-[10px] font-bold text-slate-300 mt-1 max-w-[180px] mx-auto leading-tight">
          Commencez à recevoir des réservations pour voir les stats.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */

export function ReservationStatsVisualizer({
  reservations = [],
  className,
}: {
  reservations?: Reservation[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { chartData, total, activeCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let activeC = 0;

    for (const r of reservations) {
      counts[r.statut] = (counts[r.statut] || 0) + 1;
      if (["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut)) activeC++;
    }

    const totalC = reservations.length;
    const data = STATUS_ORDER
      .map((statut) => ({
        statut,
        name: STATUS_MAP[statut]?.label ?? statut,
        value: counts[statut] || 0,
        percent: totalC > 0 ? Math.round(((counts[statut] || 0) / totalC) * 100) : 0,
      }))
      .filter((d) => d.value > 0);

    return { chartData: data, total: totalC, activeCount: activeC };
  }, [reservations]);

  const isEmpty = total === 0;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl flex flex-col h-full",
      "border border-l-[3px] border-white/70 border-l-violet-500",
      "bg-white/70 backdrop-blur-xl",
      "shadow-sm hover:shadow-xl hover:shadow-violet-500/5",
      "transition-all duration-300",
      className,
    )}>
      {/* Decorative orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-[0.05] pointer-events-none blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 opacity-[0.03] pointer-events-none blur-2xl" />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 pb-4 flex items-center justify-between border-b border-white/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200 flex items-center justify-center shadow-sm">
            <PieChartIcon className="w-4.5 h-4.5 text-violet-600" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[15px] font-black tracking-tight text-slate-800 leading-tight">
              Répartition
            </h3>
            <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-0.5 uppercase tracking-[0.05em]">
              États des rés.
            </p>
          </div>
        </div>

        {!isEmpty && (
          <Link
            href="/dashboard/owner/reservations"
            className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-violet-600 transition-all group"
          >
            Détails
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 flex-1 flex flex-col justify-center gap-6">
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {/* Chart Area */}
            <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-10">
              <div className="relative w-[180px] h-[180px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="90%"
                      paddingAngle={4}
                      cornerRadius={6}
                      strokeWidth={0}
                      // @ts-ignore
                      activeIndex={activeIndex as any}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.statut}
                          fill={STATUS_MAP[entry.statut]?.hex ?? "#94a3b8"}
                          className="transition-all duration-500 ease-in-out cursor-pointer"
                          style={{ outline: "none" }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {activeIndex !== null && chartData[activeIndex] ? (
                    <div className="animate-in fade-in zoom-in duration-300 text-center">
                      <span className={cn(
                        "text-[28px] font-black tabular-nums leading-none tracking-tighter",
                        STATUS_MAP[chartData[activeIndex].statut]?.textCls ?? "text-slate-900",
                      )}>
                        {chartData[activeIndex].value}
                      </span>
                      <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest truncate max-w-[100px]">
                        {chartData[activeIndex].name}
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500 text-center">
                      <span className="text-[32px] font-black text-slate-900 tabular-nums leading-none tracking-tighter">
                        {total}
                      </span>
                      <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-[0.2em]">
                        Total
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legend Area */}
              <div className="flex-1 w-full space-y-1.5 self-center">
                {chartData.map((entry, index) => {
                  const config = STATUS_MAP[entry.statut];
                  if (!config) return null;
                  return (
                    <LegendRow
                      key={entry.statut}
                      config={config}
                      count={entry.value}
                      percent={entry.percent}
                      isActive={activeIndex === index}
                      onHover={() => setActiveIndex(index)}
                      onLeave={() => setActiveIndex(null)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom summary badge */}
            {activeCount > 0 && (
              <div className="mt-auto py-2.5 px-3 rounded-xl bg-violet-50/50 border border-violet-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-600">Flux actif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[12px] font-black text-emerald-700 tabular-nums">
                    {activeCount} encours
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
