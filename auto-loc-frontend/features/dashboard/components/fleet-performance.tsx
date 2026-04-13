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
}

export function FleetPerformance({ vehicles, reservations = [], loading }: FleetPerformanceProps) {
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
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm animate-pulse h-full">
        <div className="h-6 w-48 bg-slate-100 rounded-lg mb-8" />
        <div className="space-y-4">
          <div className="h-20 bg-slate-50 rounded-xl" />
          <div className="h-20 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/60 flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] sm:text-[14px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 sm:w-4 h-4 text-emerald-500" />
            Performance de la flotte
          </h3>
          <p className="text-[11px] sm:text-[12px] text-slate-400 mt-1 font-medium">
            Analyse de rentabilité et taux d'occupation
          </p>
        </div>
        
        {fleetStats.avgOccupancy > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
            <TrendingUp className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600" />
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-700 uppercase tracking-tight">
              {Math.round(fleetStats.avgOccupancy)}% actifs
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col gap-6">
        
        {/* Top Vehicles Section */}
        <section className="flex-1">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              Classement Rentabilité
            </h4>
          </div>

          <div className="space-y-4">
            {fleetStats.topVehicles.length > 0 ? (
              fleetStats.topVehicles.map((v, i) => (
                <div key={v.id} className="group relative">
                  <div className="flex items-center gap-3 sm:gap-4 mb-2">
                    {/* Rank Badge */}
                    <div className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[11px] sm:text-[12px] font-black shrink-0 shadow-sm",
                      i === 0 ? "bg-emerald-500 text-white" :
                      i === 1 ? "bg-slate-800 text-white" :
                      i === 2 ? "bg-slate-400 text-white" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {i + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[12px] sm:text-[13px] font-bold text-slate-800 truncate">
                          {v.marque} {v.modele}
                        </p>
                        <span className="text-[12px] sm:text-[13px] font-black text-emerald-600 tabular-nums">
                          {Math.round(v.calculatedRevenue).toLocaleString("fr-FR")} <span className="hidden xs:inline text-[9px] font-bold">FCFA</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 sm:w-3 h-3" />
                          <span className="hidden xs:inline">Occupation :</span> {Math.round(v.calculatedOccupancy)}%
                        </div>
                        <span> {v.totalLocations} loc.</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar container */}
                  <div className="ml-9 sm:ml-11 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        i === 0 ? "bg-emerald-500" : "bg-slate-400"
                      )}
                      style={{ 
                        width: `${Math.min(100, (v.calculatedRevenue / (fleetStats.topVehicles[0].calculatedRevenue || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Car className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 mb-3" />
                <p className="text-[12px] sm:text-[13px] font-bold text-slate-400 text-center">
                  Aucun véhicule enregistré ou actif
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info Box */}
        <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Conseil :</span> Optimisez vos tarifs sur les véhicules à faible taux d'occupation.
          </p>
        </div>

        {/* Footer Link */}
        <Link 
          href="/dashboard/owner/vehicles"
          className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all group mt-auto"
        >
          Voir le détail de ma flotte
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
