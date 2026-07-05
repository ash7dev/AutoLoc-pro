"use client";

import { useState, useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight, ArrowDownRight, Minus,
    Banknote, Car, Gauge, Shield, AlertTriangle,
    TrendingUp, Sparkles, LayoutGrid, Layers,
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
    gradientFrom: string;
    gradientTo: string;
    borderGlow: string;
}> = {
    emerald: {
        iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        iconColor: "text-white",
        glowColor: "bg-emerald-500",
        trendBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
        trendText: "text-emerald-600",
        gradientFrom: "from-emerald-500/5",
        gradientTo: "to-emerald-500/0",
        borderGlow: "group-hover:shadow-emerald-500/10",
    },
    slate: {
        iconBg: "bg-gradient-to-br from-slate-700 to-slate-800",
        iconColor: "text-white",
        glowColor: "bg-slate-400",
        trendBg: "bg-slate-50 text-slate-500 ring-1 ring-slate-500/20",
        trendText: "text-slate-500",
        gradientFrom: "from-slate-500/5",
        gradientTo: "to-slate-500/0",
        borderGlow: "group-hover:shadow-slate-500/10",
    },
    red: {
        iconBg: "bg-gradient-to-br from-red-500 to-red-600",
        iconColor: "text-white",
        glowColor: "bg-red-500",
        trendBg: "bg-red-50 text-red-600 ring-1 ring-red-500/20",
        trendText: "text-red-600",
        gradientFrom: "from-red-500/5",
        gradientTo: "to-red-500/0",
        borderGlow: "group-hover:shadow-red-500/10",
    },
};

const TREND_CONFIG = {
    up: { icon: ArrowUpRight, cls: "text-emerald-600" },
    down: { icon: ArrowDownRight, cls: "text-red-600" },
    neutral: { icon: Minus, cls: "text-slate-400" },
};

/* ════════════════════════════════════════════════════════════════
   MOBILE STAT CARD — Dark Mode Carousel
════════════════════════════════════════════════════════════════ */
function MobileStatCardDark({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-3xl flex-shrink-0",
            "w-[85vw] max-w-[340px]",
            "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800",
            "border border-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            "p-6",
        )}>
            {/* Animated gradient overlay */}
            <div className={cn(
                "absolute inset-0 opacity-20",
                "bg-gradient-to-br",
                a.gradientFrom,
                a.gradientTo,
                "pointer-events-none"
            )} />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header: Icon + Sparkle */}
                <div className="flex items-start justify-between">
                    <div className={cn(
                        "relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                        "shadow-lg shadow-black/30",
                        a.iconBg,
                    )}>
                        <Icon className={cn("w-7 h-7", a.iconColor)} strokeWidth={2.5} />
                    </div>

                    {!loading && stat.trend === "up" && (
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" strokeWidth={2} />
                    )}
                </div>

                {/* Label */}
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/50 leading-tight">
                    {stat.label}
                </p>

                {/* Value */}
                {loading ? (
                    <div className="h-14 w-32 rounded-xl bg-white/10 animate-pulse mb-3" />
                ) : (
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-[52px] font-black tabular-nums tracking-tighter leading-none text-white">
                            {stat.value}
                        </span>
                        <span className="text-[14px] font-bold text-white/40 uppercase tracking-wider mb-3">
                            {stat.unit}
                        </span>
                    </div>
                )}

                {/* Delta/Trend */}
                {loading ? (
                    <div className="h-6 w-36 rounded-lg bg-white/10 animate-pulse" />
                ) : stat.delta ? (
                    <div className="flex items-center gap-2.5">
                        <div className={cn(
                            "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5",
                            "bg-white/10 backdrop-blur-sm",
                            "border border-white/10"
                        )}>
                            <TrendIcon className={cn("w-4 h-4", TREND_CONFIG[stat.trend].cls)} strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-bold text-white/70 tracking-tight">
                            {stat.delta}
                        </span>
                    </div>
                ) : null}
            </div>

            {/* Decorative glow */}
            <div className={cn(
                "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none",
                a.glowColor
            )} />
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MOBILE STAT CARD — Light Mode Grid
════════════════════════════════════════════════════════════════ */
function MobileStatCardLight({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl",
            "bg-white",
            "border border-slate-200",
            "shadow-sm",
            "p-4",
        )}>
            <div className="relative z-10 flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                    "shadow-sm",
                    a.iconBg,
                )}>
                    <Icon className={cn("w-5 h-5", a.iconColor)} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400 leading-tight mb-2">
                        {stat.label}
                    </p>

                    {/* Value */}
                    {loading ? (
                        <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse mb-2" />
                    ) : (
                        <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-[28px] font-black tabular-nums tracking-tighter leading-none text-slate-900">
                                {stat.value}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {/* Delta */}
                    {loading ? (
                        <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
                    ) : stat.delta ? (
                        <div className="flex items-center gap-1.5">
                            <TrendIcon className={cn("w-3 h-3", TREND_CONFIG[stat.trend].cls)} strokeWidth={2.5} />
                            <span className="text-[10px] font-semibold text-slate-500">
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
   STAT CARD — Ultra Premium Modern (Desktop)
════════════════════════════════════════════════════════════════ */
function StatCard({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-3xl",
            "bg-gradient-to-br from-white via-white to-slate-50/30",
            "border border-slate-200/60",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
            "hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
            "hover:border-slate-300/60",
            "hover:-translate-y-0.5",
            "transition-all duration-500 ease-out",
            "p-6",
            a.borderGlow,
        )}>
            {/* Animated gradient overlay on hover */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                "bg-gradient-to-br",
                a.gradientFrom,
                a.gradientTo,
                "pointer-events-none"
            )} />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </div>

            {/* Top decorative line */}
            <div className={cn(
                "absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                a.glowColor
            )} />

            <div className="relative z-10 flex flex-col gap-5">
                {/* Header: Icon + Label */}
                <div className="flex items-start justify-between gap-3">
                    <div className={cn(
                        "relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                        "shadow-lg shadow-black/10",
                        "transition-all duration-500",
                        "group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl",
                        a.iconBg,
                    )}>
                        <Icon className={cn("w-6 h-6", a.iconColor)} strokeWidth={2.5} />

                        {/* Icon glow effect */}
                        <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500",
                            a.glowColor
                        )} />
                    </div>

                    {/* Sparkle indicator for positive trends */}
                    {!loading && stat.trend === "up" && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" strokeWidth={2} />
                        </div>
                    )}
                </div>

                {/* Label */}
                <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500 leading-tight">
                        {stat.label}
                    </p>
                </div>

                {/* Body: Value */}
                <div>
                    {loading ? (
                        <div className="h-12 w-28 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse mb-4" />
                    ) : (
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className={cn(
                                "text-[42px] sm:text-[48px] font-black tabular-nums tracking-tighter leading-none",
                                "bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent"
                            )}>
                                {stat.value}
                            </span>
                            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {/* Delta/Trend */}
                    {loading ? (
                        <div className="h-6 w-32 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
                    ) : stat.delta ? (
                        <div className="flex items-center gap-2.5">
                            <div className={cn(
                                "inline-flex items-center justify-center rounded-lg px-2 py-1",
                                "shadow-sm",
                                a.trendBg,
                                "transition-transform duration-300 group-hover:scale-105"
                            )}>
                                <TrendIcon className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-bold text-slate-600 tracking-tight">
                                {stat.delta}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Bottom right decorative element */}
            <div className={cn(
                "absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-5 blur-2xl transition-all duration-700 pointer-events-none",
                a.glowColor
            )} />
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
    const [mobileView, setMobileView] = useState<'carousel' | 'grid'>('carousel');
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll carousel
    useEffect(() => {
        if (mobileView !== 'carousel' || loading) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stats.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [mobileView, stats.length, loading]);

    // Scroll to current index
    useEffect(() => {
        if (!scrollContainerRef.current || mobileView !== 'carousel') return;

        const container = scrollContainerRef.current;
        const cardWidth = container.scrollWidth / stats.length;
        container.scrollTo({
            left: cardWidth * currentIndex,
            behavior: 'smooth',
        });
    }, [currentIndex, stats.length, mobileView]);

    return (
        <div className="space-y-3">
            {/* Mobile View Toggle */}
            <div className="flex items-center justify-between md:hidden">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Vue d'ensemble</h2>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setMobileView('carousel')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                            mobileView === 'carousel'
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setMobileView('grid')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                            mobileView === 'grid'
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Mobile Carousel View (Dark) */}
            <div className={cn("md:hidden", mobileView === 'grid' && "hidden")}>
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {stats.map((stat) => (
                        <MobileStatCardDark key={stat.label} stat={stat} loading={loading || !data} />
                    ))}
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-1.5 mt-4">
                    {stats.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                currentIndex === index
                                    ? "w-6 bg-slate-900"
                                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Grid View (Light) */}
            <div className={cn("grid grid-cols-2 gap-3 md:hidden", mobileView === 'carousel' && "hidden")}>
                {stats.map((stat) => (
                    <MobileStatCardLight key={stat.label} stat={stat} loading={loading || !data} />
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'backwards',
                            animationDuration: '600ms',
                        }}
                    >
                        <StatCard stat={stat} loading={loading || !data} />
                    </div>
                ))}
            </div>
        </div>
    );
}