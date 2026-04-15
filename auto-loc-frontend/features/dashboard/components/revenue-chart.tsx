"use client";

import { TrendingUp, BarChart2, Banknote, ChevronDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RevenuePoint {
    day: string;
    value: number;
    highlight?: boolean;
}

const defaultChartData: RevenuePoint[] = [
    { day: "01 Nov", value: 5000 },
    { day: "05 Nov", value: 2000 },
    { day: "10 Nov", value: 8000 },
    { day: "15 Nov", value: 5000, highlight: true },
    { day: "20 Nov", value: 2000 },
    { day: "25 Nov", value: 3800 },
    { day: "30 Nov", value: 2000 },
];

const monthOptions = [
    { value: "current", label: "Ce mois-ci" },
    { value: "last", label: "Mois dernier" },
    { value: "2months", label: "Il y a 2 mois" },
];

export function RevenueChart({
    data = defaultChartData,
    total = "400,000",
    change = "+12%",
    loading = false,
    selectedMonth = "current",
    onMonthChange,
}: {
    data?: RevenuePoint[];
    total?: string;
    change?: string;
    loading?: boolean;
    selectedMonth?: string;
    onMonthChange?: (m: string) => void;
}) {
    const maxValue = Math.max(1, ...data.map((d) => d.value));
    const isEmpty = maxValue <= 1;

    // Dynamic Y-axis labels
    const yLabels = (() => {
        if (maxValue <= 1) return ["150K", "100K", "50K", "0"];
        const top = Math.ceil(maxValue / 1000) * 1000;
        const fmt = (v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
            : v >= 1_000 ? `${Math.round(v / 1_000)}K`
            : `${v}`;
        return [fmt(top), fmt(Math.round(top * 2 / 3)), fmt(Math.round(top / 3)), "0"];
    })();

    const handleMonthChange = (val: string) => {
        onMonthChange?.(val);
    };

    return (
        <TooltipProvider>
            <div className={cn(
                "relative overflow-hidden rounded-2xl",
                "border border-l-[3px] border-white/70 border-l-emerald-500",
                "bg-white/70 backdrop-blur-xl",
                "shadow-sm hover:shadow-xl hover:shadow-emerald-500/5",
                "transition-all duration-300",
                "p-5 sm:p-6 h-full flex flex-col min-h-[260px] sm:min-h-[320px]",
            )}>

                {/* Decorative gradient orb */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-[0.04] pointer-events-none blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-[0.03] pointer-events-none blur-2xl" />

                {/* ── Header ───────────────────────────────── */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 sm:mb-6">
                    <div className="space-y-2">
                        {/* Title with icon */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Banknote className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                            </div>
                            <h3 className="text-[15px] font-black tracking-tight text-slate-800">
                                Revenus cumulés
                            </h3>
                        </div>

                        {/* Big number */}
                        <div className="flex items-baseline gap-2.5 mt-1">
                            <span className="text-[28px] sm:text-[34px] font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                                {loading ? "—" : total}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                FCFA
                            </span>
                            {!loading && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                    <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                                    {change}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Period selector — glass style */}
                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger className={cn(
                            "w-full sm:w-[150px] h-9",
                            "rounded-xl border border-slate-200/60",
                            "bg-white/80 backdrop-blur-sm",
                            "text-[12px] font-bold text-slate-600",
                            "shadow-sm hover:shadow-md transition-shadow",
                            "focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-300",
                        )}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-xl bg-white/95 backdrop-blur-xl">
                            {monthOptions.map((m) => (
                                <SelectItem key={m.value} value={m.value} className="text-[12px] font-medium rounded-lg">
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* ── Chart ─────────────────────────────────── */}
                <div className="relative flex-1 min-h-[140px] sm:min-h-[200px] z-10">
                    {isEmpty && !loading ? (
                        /* Empty state */
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                                <BarChart2 className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Aucun revenu ce mois-ci
                                </p>
                                <p className="text-[11px] font-medium text-slate-300 mt-1 max-w-[220px]">
                                    Les données apparaîtront dès votre première location confirmée
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
                                {yLabels.map((label) => (
                                    <span key={label} className="text-[10px] font-bold text-slate-300 w-10 text-right tabular-nums">
                                        {label}
                                    </span>
                                ))}
                            </div>

                            {/* Grid lines — subtle dotted */}
                            <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="w-full h-px bg-slate-100" style={{ backgroundImage: i > 0 ? "linear-gradient(to right, transparent 0%, rgb(226 232 240 / 0.5) 20%, rgb(226 232 240 / 0.5) 80%, transparent 100%)" : undefined }} />
                                ))}
                            </div>

                            {/* Bars */}
                            <div className="absolute left-12 right-0 top-0 bottom-8 flex gap-1.5 sm:gap-2 items-stretch">
                                {loading
                                    ? Array.from({ length: 7 }).map((_, i) => (
                                        <div key={i} className="flex min-h-0 flex-1 flex-col gap-2 animate-pulse">
                                            <div className="flex min-h-0 flex-1 flex-col justify-end">
                                                <div className="h-[40%] w-full rounded-t-lg bg-slate-100" />
                                            </div>
                                            <span className="shrink-0 text-center text-[9px] text-slate-300 font-bold">—</span>
                                        </div>
                                    ))
                                    : data.map((point) => {
                                        const heightPct = Math.max(3, (point.value / maxValue) * 100);
                                        return (
                                            <Tooltip key={point.day}>
                                                <TooltipTrigger asChild>
                                                    <div className="group flex min-h-0 flex-1 cursor-default flex-col gap-2">
                                                        <div className="flex min-h-0 flex-1 flex-col justify-end px-0.5">
                                                            <div
                                                                className={cn(
                                                                    "w-full rounded-t-lg transition-all duration-300 ease-out relative overflow-hidden",
                                                                    point.highlight
                                                                        ? "bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30"
                                                                        : "bg-gradient-to-t from-emerald-200 to-emerald-100 group-hover:from-emerald-300 group-hover:to-emerald-200",
                                                                )}
                                                                style={{ height: `${heightPct}%` }}
                                                            >
                                                                {/* Glass shimmer on highlight */}
                                                                {point.highlight && (
                                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "w-full shrink-0 truncate text-center font-bold tabular-nums",
                                                            point.highlight
                                                                ? "text-[10px] text-emerald-600"
                                                                : "text-[9px] text-slate-300",
                                                        )}>
                                                            {point.day.split(" ")[0]}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    className="rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-xl px-3 py-2.5"
                                                >
                                                    <p className="font-black text-[10px] uppercase tracking-widest text-slate-800">{point.day}</p>
                                                    <p className="text-[13px] font-black text-emerald-600 tabular-nums mt-0.5">
                                                        {point.value.toLocaleString("fr-FR")}
                                                        <span className="text-[9px] font-bold text-slate-300 ml-1">FCFA</span>
                                                    </p>
                                                    {point.highlight && (
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide mt-1">
                                                            ● Total du mois
                                                        </p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
