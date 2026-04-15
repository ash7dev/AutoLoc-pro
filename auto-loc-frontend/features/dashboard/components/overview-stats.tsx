"use client";

import type { LucideIcon } from "lucide-react";
import {
    TrendingUp, Car, Activity, Shield,
    ArrowUpRight, ArrowDownRight, Minus,
    Banknote, Gauge, AlertTriangle,
} from "lucide-react";
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
    accent: "emerald" | "blue" | "amber" | "red";
    gradient: string;
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
            icon: Banknote,
            accent: "emerald",
            gradient: "from-emerald-500 to-teal-500",
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
            accent: "blue",
            gradient: "from-blue-500 to-indigo-500",
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
            trend: data.tauxOccupation >= 50 ? "up" : "neutral",
            icon: Gauge,
            accent: "amber",
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Litiges ouverts",
            value: String(data.litigesOuverts),
            unit: data.litigesOuverts !== 1 ? "litiges" : "litige",
            delta: data.litigesOuverts === 0 ? "Aucun problème" : "Nécessite attention",
            trend: data.litigesOuverts === 0 ? "neutral" : "down",
            icon: data.litigesOuverts === 0 ? Shield : AlertTriangle,
            accent: data.litigesOuverts === 0 ? "emerald" : "red",
            gradient: data.litigesOuverts === 0 ? "from-emerald-500 to-teal-500" : "from-red-500 to-rose-500",
        },
    ];
}

const SKELETON_STATS: StatItem[] = [
    { label: "Revenus du mois", value: "—", unit: "FCFA", delta: "", trend: "neutral", icon: Banknote, accent: "emerald", gradient: "from-emerald-500 to-teal-500" },
    { label: "Réservations actives", value: "—", unit: "en cours", delta: "", trend: "neutral", icon: Car, accent: "blue", gradient: "from-blue-500 to-indigo-500" },
    { label: "Taux d'occupation", value: "—", unit: "%", delta: "", trend: "neutral", icon: Gauge, accent: "amber", gradient: "from-amber-500 to-orange-500" },
    { label: "Litiges ouverts", value: "—", unit: "litige", delta: "", trend: "neutral", icon: Shield, accent: "emerald", gradient: "from-emerald-500 to-teal-500" },
];

/* ── Accent token maps ──────────────────────────────────────── */
const ACCENT_MAP: Record<StatItem["accent"], {
    iconBg: string;
    iconColor: string;
    valueBg: string;
    borderAccent: string;
    glowShadow: string;
    trendBg: string;
    trendText: string;
}> = {
    emerald: {
        iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200",
        iconColor: "text-emerald-600",
        valueBg: "text-slate-900",
        borderAccent: "border-l-emerald-500",
        glowShadow: "hover:shadow-emerald-500/5",
        trendBg: "bg-emerald-50",
        trendText: "text-emerald-600",
    },
    blue: {
        iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200",
        iconColor: "text-blue-600",
        valueBg: "text-slate-900",
        borderAccent: "border-l-blue-500",
        glowShadow: "hover:shadow-blue-500/5",
        trendBg: "bg-blue-50",
        trendText: "text-blue-600",
    },
    amber: {
        iconBg: "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200",
        iconColor: "text-amber-600",
        valueBg: "text-slate-900",
        borderAccent: "border-l-amber-500",
        glowShadow: "hover:shadow-amber-500/5",
        trendBg: "bg-amber-50",
        trendText: "text-amber-600",
    },
    red: {
        iconBg: "bg-gradient-to-br from-red-100 to-rose-100 border-red-200",
        iconColor: "text-red-600",
        valueBg: "text-red-700",
        borderAccent: "border-l-red-500",
        glowShadow: "hover:shadow-red-500/5",
        trendBg: "bg-red-50",
        trendText: "text-red-600",
    },
};

const TREND_CONFIG = {
    up: { icon: ArrowUpRight, cls: "text-emerald-600" },
    down: { icon: ArrowDownRight, cls: "text-red-600" },
    neutral: { icon: Minus, cls: "text-slate-400" },
};

/* ════════════════════════════════════════════════════════════════
   STAT CARD — Glassmorphism
════════════════════════════════════════════════════════════════ */
function StatCard({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-2xl",
            "border border-l-[3px] border-white/70",
            a.borderAccent,
            /* Glass */
            "bg-white/70 backdrop-blur-xl",
            "shadow-sm",
            a.glowShadow,
            "hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-[2px]",
            "transition-all duration-300 ease-out",
            "p-5",
        )}>

            {/* Decorative gradient orb — top right */}
            <div className={cn(
                "absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.07] pointer-events-none blur-2xl",
                `bg-gradient-to-br ${stat.gradient}`,
            )} />

            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3 leading-tight">
                        {stat.label}
                    </p>

                    {/* Value */}
                    {loading ? (
                        <div className="h-9 w-20 rounded-xl bg-slate-100 animate-pulse mb-2" />
                    ) : (
                        <div className="flex items-baseline gap-1.5 mb-2.5">
                            <span className={cn(
                                "text-[32px] sm:text-[38px] font-black tabular-nums tracking-tighter leading-none",
                                a.valueBg,
                            )}>
                                {stat.value}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {/* Delta */}
                    {loading ? (
                        <div className="h-4 w-24 rounded-lg bg-slate-100 animate-pulse" />
                    ) : stat.delta ? (
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                            a.trendBg,
                            a.trendText,
                            "border-transparent",
                        )}>
                            <TrendIcon className={cn("w-3 h-3", TREND_CONFIG[stat.trend].cls)} strokeWidth={2.5} />
                            {stat.delta}
                        </div>
                    ) : null}
                </div>

                {/* Icon */}
                <div className={cn(
                    "w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm",
                    a.iconBg,
                )}>
                    <Icon className={cn("w-5 h-5", a.iconColor)} strokeWidth={1.75} />
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