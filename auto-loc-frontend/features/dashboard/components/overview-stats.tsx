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
   MOBILE STAT CARD — Dark Mode Carousel (Inspired by Apple/Linear)
════════════════════════════════════════════════════════════════ */
function MobileStatCardDark({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden flex-shrink-0",
            "w-[85vw] max-w-[340px] h-[200px]",
            "rounded-[32px]",
            "bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]",
            "border border-white/[0.08]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_1px_2px_rgba(255,255,255,0.05)_inset]",
            "backdrop-blur-xl",
        )}>
            {/* Premium glass reflection at top */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Colored ambient glow */}
            <div className={cn(
                "absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-[100px] pointer-events-none transition-opacity duration-700 group-hover:opacity-40",
                a.glowColor
            )} />

            {/* Noise texture overlay for depth */}
            <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between p-6">
                {/* Header: Icon + Label */}
                <div className="space-y-3">
                    <div className="flex items-start justify-between">
                        {/* Icon with premium gradient */}
                        <div className={cn(
                            "relative w-12 h-12 rounded-2xl flex items-center justify-center",
                            "shadow-[0_8px_24px_rgba(0,0,0,0.4)]",
                            "transition-transform duration-500 group-hover:scale-110",
                            a.iconBg,
                        )}>
                            <Icon className={cn("w-6 h-6", a.iconColor)} strokeWidth={2.5} />

                            {/* Icon inner glow */}
                            <div className={cn(
                                "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 blur-lg transition-opacity duration-500",
                                a.glowColor
                            )} />
                        </div>

                        {/* Trend indicator - floating badge */}
                        {!loading && stat.trend !== "neutral" && (
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md",
                                "border transition-all duration-300",
                                stat.trend === "up"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
                                {stat.trend === "up" && (
                                    <Sparkles className="w-3 h-3 animate-pulse" strokeWidth={2.5} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Label */}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
                        {stat.label}
                    </p>
                </div>

                {/* Value + Delta */}
                <div className="space-y-2">
                    {/* Value */}
                    {loading ? (
                        <div className="h-16 w-36 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 animate-pulse" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-[56px] font-black tabular-nums tracking-[-0.03em] leading-none bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                                {stat.value}
                            </span>
                            <span className="text-[13px] font-bold text-white/30 uppercase tracking-wide mb-2">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {/* Delta text */}
                    {loading ? (
                        <div className="h-4 w-32 rounded-lg bg-white/5 animate-pulse" />
                    ) : stat.delta ? (
                        <p className="text-[12px] font-semibold text-white/50">
                            {stat.delta}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Bottom edge subtle highlight */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   MOBILE STAT CARD — Light Mode Grid (Inspired by Stripe/Vercel)
════════════════════════════════════════════════════════════════ */
function MobileStatCardLight({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden",
            "rounded-[24px]",
            "bg-white",
            "border border-slate-200/80",
            "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
            "hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)]",
            "hover:border-slate-300/80",
            "transition-all duration-300",
            "p-4",
        )}>
            {/* Subtle gradient overlay */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-br",
                a.gradientFrom,
                a.gradientTo,
                "pointer-events-none"
            )} />

            {/* Top highlight line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50" />

            <div className="relative z-10 space-y-3">
                {/* Header: Icon + Trend */}
                <div className="flex items-start justify-between">
                    {/* Icon */}
                    <div className={cn(
                        "relative w-10 h-10 rounded-xl flex items-center justify-center",
                        "shadow-sm shadow-black/5",
                        "transition-all duration-300 group-hover:scale-105",
                        a.iconBg,
                    )}>
                        <Icon className={cn("w-5 h-5", a.iconColor)} strokeWidth={2.5} />
                    </div>

                    {/* Trend badge */}
                    {!loading && stat.trend !== "neutral" && (
                        <div className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md",
                            "transition-all duration-300",
                            stat.trend === "up"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        )}>
                            <TrendIcon className="w-2.5 h-2.5" strokeWidth={3} />
                        </div>
                    )}
                </div>

                {/* Label */}
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    {stat.label}
                </p>

                {/* Value */}
                {loading ? (
                    <div className="h-9 w-24 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse" />
                ) : (
                    <div className="flex items-baseline gap-1">
                        <span className="text-[32px] font-black tabular-nums tracking-[-0.02em] leading-none text-slate-900">
                            {stat.value}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">
                            {stat.unit}
                        </span>
                    </div>
                )}

                {/* Delta */}
                {loading ? (
                    <div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" />
                ) : stat.delta ? (
                    <p className="text-[10px] font-semibold text-slate-500 truncate">
                        {stat.delta}
                    </p>
                ) : null}
            </div>

            {/* Bottom gradient highlight */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-r from-transparent via-slate-300 to-transparent"
            )} />
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   STAT CARD — Premium Desktop (Inspired by Arc/Notion)
════════════════════════════════════════════════════════════════ */
function StatCard({ stat, loading }: { stat: StatItem; loading: boolean }) {
    const Icon = stat.icon;
    const TrendIcon = TREND_CONFIG[stat.trend].icon;
    const a = ACCENT_MAP[stat.accent];

    return (
        <div className={cn(
            "group relative overflow-hidden",
            "rounded-[28px]",
            "bg-white",
            "border border-slate-200/80",
            "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]",
            "hover:shadow-[0_12px_24px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.04)]",
            "hover:border-slate-300",
            "hover:-translate-y-1",
            "transition-all duration-400 ease-out",
            "p-6",
        )}>
            {/* Glass reflection at top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

            {/* Animated colored gradient overlay */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                "bg-gradient-to-br",
                a.gradientFrom,
                a.gradientTo,
                "pointer-events-none"
            )} />

            {/* Ambient glow from icon color */}
            <div className={cn(
                "absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-0 group-hover:opacity-[0.15] blur-[80px] transition-all duration-700 pointer-events-none",
                a.glowColor
            )} />

            <div className="relative z-10 flex flex-col gap-6">
                {/* Header: Icon + Trend Badge */}
                <div className="flex items-start justify-between">
                    {/* Icon with modern gradient */}
                    <div className={cn(
                        "relative w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0",
                        "shadow-lg shadow-black/[0.08]",
                        "transition-all duration-500",
                        "group-hover:scale-110 group-hover:rotate-3",
                        a.iconBg,
                    )}>
                        <Icon className={cn("w-7 h-7", a.iconColor)} strokeWidth={2.5} />

                        {/* Icon glow */}
                        <div className={cn(
                            "absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500",
                            a.glowColor
                        )} />
                    </div>

                    {/* Trend indicator badge */}
                    {!loading && stat.trend !== "neutral" && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-sm",
                            "border transition-all duration-300",
                            stat.trend === "up"
                                ? "bg-emerald-50 border-emerald-200/60 text-emerald-600"
                                : "bg-red-50 border-red-200/60 text-red-600"
                        )}>
                            <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                            {stat.trend === "up" && (
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" strokeWidth={2.5} />
                            )}
                        </div>
                    )}
                </div>

                {/* Label */}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {stat.label}
                </p>

                {/* Value Section */}
                <div className="space-y-3">
                    {/* Value */}
                    {loading ? (
                        <div className="h-14 w-32 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-[52px] font-black tabular-nums tracking-[-0.03em] leading-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                                {stat.value}
                            </span>
                            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                                {stat.unit}
                            </span>
                        </div>
                    )}

                    {/* Delta */}
                    {loading ? (
                        <div className="h-5 w-36 rounded-lg bg-slate-100 animate-pulse" />
                    ) : stat.delta ? (
                        <p className="text-[12px] font-semibold text-slate-600">
                            {stat.delta}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Bottom edge highlight */}
            <div className={cn(
                "absolute inset-x-0 bottom-0 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-r from-transparent",
                stat.trend === "up" ? "via-emerald-400" : stat.trend === "down" ? "via-red-400" : "via-slate-300",
                "to-transparent"
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