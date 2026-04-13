"use client";

import { Star, Trophy, MessageSquare, Car, ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import type { Review } from "@/lib/nestjs/reviews";
import Link from "next/link";

interface FleetPerformanceProps {
  vehicles: Vehicle[];
  reviews?: Review[] | null;
  loading?: boolean;
}

export function FleetPerformance({ vehicles, reviews, loading }: FleetPerformanceProps) {
  // ── Logic ────────────────────────────────────────────────────────────────────
  
  // Rank top 3 vehicles by rentals
  const topVehicles = [...vehicles]
    .sort((a, b) => (b.totalLocations || 0) - (a.totalLocations || 0))
    .slice(0, 3);

  // Calculate fleet average rating
  const vehiclesWithRating = vehicles.filter(v => v.totalAvis > 0);
  const avgRating = vehiclesWithRating.length > 0
    ? vehiclesWithRating.reduce((sum, v) => sum + v.note, 0) / vehiclesWithRating.length
    : 0;

  // Filter only tenant reviews (LOCATAIRE_NOTE_PROPRIO)
  const recentReviews = (reviews || [])
    .filter(r => r.typeAvis === "LOCATAIRE_NOTE_PROPRIO")
    .slice(0, 3); // Showing up to 3 for better fill

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
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Performance de la flotte
          </h3>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Analyse de rentabilité et satisfaction
          </p>
        </div>
        
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-[13px] font-black text-amber-700">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        
        {/* Top Vehicles Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Top Véhicules
            </h4>
          </div>

          <div className="space-y-3">
            {topVehicles.length > 0 ? (
              topVehicles.map((v, i) => (
                <div key={v.id} className="group flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black shrink-0 transition-colors",
                    i === 0 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    i === 1 ? "bg-slate-50 text-slate-600 border border-slate-100" :
                    "bg-orange-50 text-orange-600 border border-orange-100"
                  )}>
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-[13px] font-bold text-slate-700 truncate group-hover:text-emerald-600 transition-colors">
                        {v.marque} {v.modele}
                      </p>
                      <span className="text-[11px] font-black text-slate-400">
                        {v.totalLocations} loc.
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (v.totalLocations / (topVehicles[0].totalLocations || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Car className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-[12px] font-bold text-slate-400 text-center">
                  Aucun véhicule enregistré
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Reviews Section */}
        <section className="flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Derniers Avis
            </h4>
          </div>

          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((rev) => (
                <div key={rev.id} className="relative bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "w-2.5 h-2.5",
                            i < Math.round(rev.note) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                          )} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      • {rev.auteur.prenom}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed italic line-clamp-2">
                    &ldquo;{rev.commentaire || "Excellent service, véhicule impeccable !"}&rdquo;
                  </p>
                  {rev.reservation?.vehicule && (
                    <div className="mt-2 text-[10px] font-black text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3" />
                      {rev.reservation.vehicule.marque} {rev.reservation.vehicule.modele}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4 scale-in-center">
                   <MessageSquare className="w-6 h-6 text-slate-200" />
                </div>
                <h5 className="text-[13px] font-black text-slate-600 mb-1">Pas encore d'avis</h5>
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  La qualité de votre service sera bientôt récompensée par vos premiers locataires.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer Link */}
        <Link 
          href="/dashboard/owner/vehicles"
          className="mt-auto flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all group"
        >
          Gérer ma flotte
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
