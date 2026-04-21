"use client";

import { Trophy, Car, ArrowRight, TrendingUp, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import type { Reservation } from "@/lib/nestjs/reservations";
import Link from "next/link";
import { useMemo } from "react";

interface FleetPerformanceProps {
    vehicles: Vehicle[];
    reservations?: Reservation[];
    loading?: boolean;
    className?: string;
}

export function FleetPerformance({ vehicles, reservations = [], loading, className }: FleetPerformanceProps) {
    // ── Analytics Logic ─────────────────────────────────────────────────────────

    const fleetStats = useMemo(() => {
        if (!vehicles.length) return { topVehicles: [], avgOccupancy: 0 };

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Map vehicles with their calculated stats
        const stats = vehicles.map(v => {
            // Filter reservations for this vehicle that are "money-making"
            const vRes = reservations.filter(r =>
                r.vehicule.id === v.id &&
                ["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)
            );

            // Revenue: All-time for simplicity, OR could be month-to-date
            const revenue = vRes.reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);

            // Occupancy: Days rented in the last 30 days
            let daysRented = 0;
            vRes.forEach(r => {
                const start = new Date(r.dateDebut);
                const end = new Date(r.dateFin);

                // Only count days within the last 30 days window
                const effectiveStart = start < thirtyDaysAgo ? thirtyDaysAgo : start;
                const effectiveEnd = end > now ? now : end;

                if (effectiveEnd > effectiveStart) {
                    const diffTime = Math.abs(effectiveEnd.getTime() - effectiveStart.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    daysRented += diffDays;
                }
            });

            const occupancyRate = Math.min(100, (daysRented / 30) * 100);

            return {
                ...v,
                calculatedRevenue: revenue,
                calculatedOccupancy: occupancyRate,
            };
        });

        // 2. Sort by revenue descending
        const sorted = stats.sort((a, b) => b.calculatedRevenue - a.calculatedRevenue);

        // 3. Overall fleet occupancy
        const avgOccupancy = stats.reduce((sum, s) => sum + s.calculatedOccupancy, 0) / stats.length;

        return {
            topVehicles: sorted.slice(0, 4), // Show top 4 for better fill since reviews are gone
            avgOccupancy,
        };
    }, [vehicles, reservations]);

    if (loading) {
        return (
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/70 border-l-[3px] border-l-blue-500 p-6 shadow-sm animate-pulse h-full">
                <div className="h-6 w-48 bg-slate-100 rounded-lg mb-8" />
                <div className="space-y-4">
                    <div className="h-20 bg-slate-50 rounded-xl" />
                    <div className="h-20 bg-slate-50 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl flex flex-col h-full",
            "border border-l-[3px] border-white/70 border-l-blue-500",
            "bg-white/70 backdrop-blur-xl",
            "shadow-sm hover:shadow-xl hover:shadow-blue-500/5",
            "transition-all duration-300",
            className,
        )}>

            {/* Decorative gradient orb */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 opacity-[0.04] pointer-events-none blur-3xl" />
            
            {/* Header */}
            <div className="relative z-10 p-4 sm:p-6 pb-4 flex items-center justify-between border-b border-white/40">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center shadow-sm">
                        <Trophy className="w-4.5 h-4.5 text-blue-600" strokeWidth={1.75} />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-black tracking-tight text-slate-800 leading-tight">
                            Performance
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-0.5">
                            Classement flotte
                        </p>
                    </div>
                </div>

                {fleetStats.avgOccupancy > 0 && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                            <TrendingUp className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest tabular-nums">
                                {Math.round(fleetStats.avgOccupancy)}% actifs
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 p-4 sm:p-6 pt-4 flex-1 flex flex-col justify-center gap-5">

                {/* Top Vehicles Section */}
                <section className="flex-1">
                    <h4 className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-400 flex items-center gap-2 mb-4">
                        <BarChart3 className="w-3.5 h-3.5" strokeWidth={2} />
                        Rentabilité
                    </h4>

                    <div className="space-y-4">
                        {fleetStats.topVehicles.length > 0 ? (
                            fleetStats.topVehicles.map((v, i) => (
                                <div key={v.id} className="group relative">
                                    <div className="flex items-center gap-3 sm:gap-4 mb-2.5">
                                        {/* Rank Badge */}
                                        <div className={cn(
                                            "w-7 h-7 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 shadow-sm transition-all duration-300",
                                            i === 0 ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-500/20 group-hover:scale-110" :
                                                i === 1 ? "bg-slate-800 text-white group-hover:scale-105" :
                                                    i === 2 ? "bg-slate-600 text-white group-hover:scale-105" :
                                                        "bg-white border border-slate-200 text-slate-400 group-hover:bg-slate-50"
                                        )}>
                                            {i + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-[13px] font-black text-slate-800 truncate">
                                                    {v.marque} <span className="text-blue-600">{v.modele}</span>
                                                </p>
                                                <span className="text-[13px] font-black text-slate-900 tabular-nums">
                                                    {Math.round(v.calculatedRevenue).toLocaleString("fr-FR")} <span className="text-[9px] font-bold text-slate-400 ml-0.5">FCFA</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                                    <span>Occupation: <span className="text-slate-600 tabular-nums">{Math.round(v.calculatedOccupancy)}%</span></span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{v.totalLocations} loc.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar container */}
                                    <div className="ml-10 sm:ml-11 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
                                                i === 0 ? "bg-gradient-to-r from-blue-400 to-indigo-500" : "bg-gradient-to-r from-slate-300 to-slate-400"
                                            )}
                                            style={{
                                                width: `${Math.max(2, (v.calculatedRevenue / (fleetStats.topVehicles[0]?.calculatedRevenue || 1)) * 100)}%`
                                            }}
                                        >
                                            {/* Micro-shimmer effect */}
                                            {i === 0 && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 px-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                                <Car className="w-10 h-10 text-slate-200 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
                                    Aucun véhicule enregistré
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Footer Link */}
                <div className="mt-auto pt-2">
                    <Link
                        href="/dashboard/owner/vehicles"
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-700 rounded-xl text-[12px] font-bold shadow-sm transition-all group"
                    >
                        Voir le détail de ma flotte
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
