"use client";

import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight, ArrowDownRight, Minus,
    Banknote, Car, Gauge, Shield, AlertTriangle,
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
    accent: "emerald" | "slate" | "red";
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
            delta: data.revenusMois > 0 ? "Ce mois-ci" : "En attente de revenus",
            trend: data.revenusMois > 0 ? "up" : "neutral",
            icon: Banknote,
            accent: "emerald",
        },
        {
            label: "Réservations actives",
            value: String(data.reservationsActives),
            unit: "en cours",
            delta: data.reservationsActives > 0
                ? `${data.reservationsActives} location${data.reservationsActives > 1 ? "s" : ""}`
                : "Prêt à louer",
            trend: data.reservationsActives > 0 ? "up" : "neutral",
            icon: Car,
            accent: "emerald",
        },
        {
            label: "Taux d'occupation",
            value: String(data.tauxOccupation),
            unit: "%",
            delta: data.tauxOccupation >= 70
                ? "Très bon taux"
                : data.tauxOccupation > 0
                    ? "En activité"
                    : "Catalogue disponible",
            trend: data.tauxOccupation >= 50 ? "up" : "neutral",
            icon: Gauge,
            accent: "slate",
        },
        {
            label: "Litiges ouverts",
            value: String(data.litigesOuverts),
            unit: data.litigesOuverts !== 1 ? "litiges" : "litige",
            delta: data.litigesOuverts === 0 ? "Sain et sécurisé" : "Nécessite attention",
            trend: data.litigesOuverts === 0 ? "neutral" : "down",
            icon: data.litigesOuverts === 0 ? Shield : AlertTriangle,
            accent: data.litigesOuverts === 0 ? "emerald" : "red",
        },
    ];
}

const SKELETON_STATS: StatItem[] = [
    { label: "Revenus du mois", value: "—", unit: "FCFA", delta: "", trend: "neutral", icon: Banknote, accent: "emerald" },
    { label: "Réservations actives", value: "—", unit: "en cours", delta: "", trend: "neutral", icon: Car, accent: "emerald" },
    { label: "Taux d'occupation", value: "—", unit: "%", delta: "", trend: "neutral", icon: Gauge, accent: "slate" },
    { label: "Litiges ouverts", value: "—", unit: "litige", delta: "", trend: "neutral", icon: Shield, accent: "emerald" },
];

/* ── Accent token maps — Premium palette ──────────────────── */
const ACCENT_MAP: Record<StatItem["accent"], {
    iconBg: string;
    iconColor: string;
    glowColor: string;
    trendBg: string;
    trendText: string;
}> = {
    emerald: {
        iconBg: "bg-emerald-500/10 ring-1 ring-emerald-500/20",
        iconColor: "text-emerald-600",
        glowColor: "bg-emerald-500",
        trendBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
        trendText: "text-emerald-600",
    },
    slate: {
        iconBg: "bg-slate-500/10 ring-1 ring-slate-500/20",
        iconColor: "text-slate-600",
        glowColor: "bg-slate-400",
        trendBg: "bg-slate-50 text-slate-500 ring-1 ring-slate-500/20",
        trendText: "text-slate-500",
    },
    red: {
        iconBg: "bg-red-500/10 ring-1 ring-red-500/20",
        iconColor: "text-red-600",
        glowColor: "bg-red-500",
        trendBg: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
        trendText: "text-red-600",
    },
};

const TREND_CONFIG = {
    up: { icon: ArrowUpRight, cls: "text-emerald-600" },
    down: { icon: ArrowDownRight, cls: "text-red-600" },
    neutral: { icon: Minus, cls: "text-slate-400" },
};

/* ════════════════════════════════════════════════════════════════
   STAT CARD — Ultra Premium Pro
════════════════════════════════════════════════════════════════ */
function StatCard({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl",
            "bg-white",
            "ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
            "hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:ring-slate-900/10 hover:-translate-y-[1px]",
            "transition-all duration-400 ease-out",
            "p-5 sm:p-6",
        )}>
            {/* Top edge glare / reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            {/* Subtle ambient hover glow in the top-right corner */}
            <div className={cn(
                "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 ease-out pointer-events-none",
                "group-hover:opacity-[0.08]",
                a.glowColor
            )} />

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header: Label + Icon */}
                <div className="flex items-start justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-1">
                        {stat.label}
                    </p>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3",
                        a.iconBg,
                    )}>
                        <Icon className={cn("w-4.5 h-4.5", a.iconColor)} strokeWidth={2} />
                    </div>
                </div>

                {/* Body: Value + Delta */}
                <div>
                    {loading ? (
                        <div className="h-10 w-24 rounded-lg bg-slate-100 animate-pulse mb-3" />
                    ) : (
                        <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-[34px] sm:text-[40px] font-black tabular-nums tracking-tighter leading-none text-slate-900">
                                {stat.value}
                            </span>
                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {loading ? (
                        <div className="h-5 w-28 rounded-md bg-slate-100 animate-pulse" />
                    ) : stat.delta ? (
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "inline-flex items-center justify-center rounded-md p-0.5",
                                a.trendBg
                            )}>
                                <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </div>
                            <span className="text-[11.5px] font-semibold text-slate-500">
                                {stat.delta}
                            </span>
                        </div>
                    ) : null}
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