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
    // Ajout de la période pour synchroniser avec le graphique de revenus
    year?: number;
    month?: number;
}

export function FleetPerformance({ vehicles, reservations = [], loading, className, year, month }: FleetPerformanceProps) {
    // ── Analytics Logic ─────────────────────────────────────────────────────────

    const fleetStats = useMemo(() => {
        if (!vehicles.length) return { topVehicles: [], avgOccupancy: 0 };

        // Si month/year ne sont pas fournis, on utilise le mois actuel par défaut
        const now = new Date();
        const targetYear = year ?? now.getFullYear();
        const targetMonth = month ?? now.getMonth();
        
        // Fenêtre pour le calcul d'occupation (le mois complet sélectionné)
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0);
        const daysInMonth = endOfMonth.getDate();

        // 1. Map vehicles with their calculated stats
        const stats = vehicles.map(v => {
            // Filtrer les réservations pour ce véhicule sur le mois/année cible
            const vRes = reservations.filter(r => {
                if (r.vehicule?.id !== v.id) return false;
                if (!["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)) return false;
                
                const start = new Date(r.dateDebut);
                return start.getMonth() === targetMonth && start.getFullYear() === targetYear;
            });

            // Revenu sur la période sélectionnée
            const revenue = vRes.reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);

            // Taux d'occupation sur ce mois précis
            let daysRentedInMonth = 0;
            vRes.forEach(r => {
                const start = new Date(r.dateDebut);
                const end = new Date(r.dateFin);

                // On ne compte que les jours qui tombent dans le mois sélectionné
                const effectiveStart = start < startOfMonth ? startOfMonth : start;
                const effectiveEnd = end > endOfMonth ? endOfMonth : end;

                if (effectiveEnd > effectiveStart) {
                    const diffTime = Math.abs(effectiveEnd.getTime() - effectiveStart.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    daysRentedInMonth += diffDays;
                }
            });

            const occupancyRate = Math.min(100, (daysRentedInMonth / daysInMonth) * 100);

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
            topVehicles: sorted.slice(0, 4),
            avgOccupancy,
            isFiltered: year !== undefined && month !== undefined
        };
    }, [vehicles, reservations, year, month]);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl ring-1 ring-slate-900/5 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)] animate-pulse h-full">
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
            "group relative overflow-hidden rounded-2xl flex flex-col h-full",
            "bg-white",
            "ring-1 ring-slate-900/5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
            "hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:ring-slate-900/10",
            "transition-all duration-400",
            className,
        )}>

            {/* Top edge glare */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500 opacity-[0.04] pointer-events-none blur-3xl" />
            
            {/* Header */}
            <div className="relative z-10 p-4 sm:p-6 pb-4 flex items-center justify-between border-b border-white/40">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
                        <Trophy className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-[15px] font-black tracking-tight text-slate-800 leading-tight">
                            Performance
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 tracking-wide mt-0.5">
                            {year !== undefined && month !== undefined 
                                ? `Classement ${new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}` 
                                : "Classement flotte"}
                        </p>
                    </div>
                </div>

                {fleetStats.avgOccupancy > 0 && (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-md ring-1 ring-emerald-500/20">
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
                                            i === 0 ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 group-hover:scale-110" :
                                                i === 1 ? "bg-slate-800 text-white group-hover:scale-105" :
                                                    i === 2 ? "bg-slate-600 text-white group-hover:scale-105" :
                                                        "bg-white border border-slate-200 text-slate-400 group-hover:bg-slate-50"
                                        )}>
                                            {i + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-[13px] font-black text-slate-800 truncate">
                                                    {v.marque} <span className="text-emerald-600">{v.modele}</span>
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
                                                i === 0 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-slate-300 to-slate-400"
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
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white ring-1 ring-slate-900/5 hover:ring-slate-900/10 hover:bg-slate-50 text-slate-700 rounded-xl text-[12px] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all group"
                    >
                        Voir le détail de ma flotte
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
