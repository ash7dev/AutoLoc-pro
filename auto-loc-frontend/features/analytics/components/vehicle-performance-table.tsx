"use client";

import { useState } from "react";
import { Car, TrendingUp, Star, Crown, AlertTriangle, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface VehiclePerformance {
  id: number | string;
  name: string;
  photoUrl?: string;
  revenue: number;
  bookingsCount: number;
  occupancyRate: number; // 0-100
  averageRating: number; // 0-5
  revPAD: number; // Revenue Per Available Day
}

interface VehiclePerformanceTableProps {
  vehicles: VehiclePerformance[];
  loading?: boolean;
}

type SortKey = "revenue" | "bookingsCount" | "occupancyRate" | "averageRating" | "revPAD";

export function VehiclePerformanceTable({ vehicles, loading = false }: VehiclePerformanceTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [sortDesc, setSortDesc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortDesc ? bVal - aVal : aVal - bVal;
  });

  // Identify top performer
  const topPerformer = sortedVehicles[0];

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded-lg bg-slate-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="h-3 w-60 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Car className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-500">Aucun véhicule avec des données</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-950/[0.06] bg-gradient-to-br from-white via-slate-50/30 to-white shadow-xl shadow-slate-950/[0.04]">
      {/* Top accent border */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(139,92,246,0.02),transparent_50%)]" />

      {/* Header */}
      <div className="relative border-b border-slate-950/[0.06] bg-gradient-to-b from-slate-50/50 to-white/50 backdrop-blur-sm px-7 py-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent tracking-[-0.01em]">
              Performance par véhicule
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Classement et statistiques détaillées
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 px-4 py-2">
              <p className="text-sm font-black text-emerald-700 tabular-nums">
                {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-950/[0.06] bg-slate-50/40 backdrop-blur-sm">
              <th className="px-7 py-4 text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">
                  Véhicule
                </p>
              </th>
              <th className="px-4 py-4 text-right">
                <button
                  onClick={() => handleSort("revenue")}
                  className="group flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Revenue
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
              </th>
              <th className="px-4 py-4 text-right">
                <button
                  onClick={() => handleSort("bookingsCount")}
                  className="group flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Locations
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
              </th>
              <th className="px-4 py-4 text-right">
                <button
                  onClick={() => handleSort("occupancyRate")}
                  className="group flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Occupation
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
              </th>
              <th className="px-4 py-4 text-right">
                <button
                  onClick={() => handleSort("averageRating")}
                  className="group flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Note
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
              </th>
              <th className="px-6 py-4 text-right">
                <button
                  onClick={() => handleSort("revPAD")}
                  className="group flex items-center gap-1.5 ml-auto text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 hover:text-slate-900 transition-colors"
                >
                  RevPAD
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-950/[0.04]">
            {sortedVehicles.map((vehicle, index) => {
              const isTopPerformer = vehicle.id === topPerformer?.id;
              const isLowOccupancy = vehicle.occupancyRate < 30;

              return (
                <tr
                  key={vehicle.id}
                  className={cn(
                    "group hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-200",
                    isTopPerformer && "bg-gradient-to-r from-emerald-500/[0.03] to-transparent"
                  )}
                >
                  {/* Vehicle */}
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      {/* Rank badge */}
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black shadow-lg",
                        index === 0 && "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-amber-500/40",
                        index === 1 && "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-slate-400/40",
                        index === 2 && "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white shadow-orange-500/40",
                        index > 2 && "bg-slate-100/70 text-slate-500 shadow-slate-900/5"
                      )}>
                        {index + 1}
                      </div>

                      {/* Photo */}
                      <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-950/[0.06] flex-shrink-0 shadow-sm">
                        {vehicle.photoUrl ? (
                          <Image
                            src={vehicle.photoUrl}
                            alt={vehicle.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-6 w-6 text-slate-400" strokeWidth={2} />
                          </div>
                        )}
                      </div>

                      {/* Name + badges */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-slate-900 tracking-tight">
                            {vehicle.name}
                          </p>
                          {isTopPerformer && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700 tracking-wide">
                              <Crown className="h-3 w-3" strokeWidth={2.5} />
                              Top
                            </span>
                          )}
                          {isLowOccupancy && !isTopPerformer && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-700 tracking-wide">
                              <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
                              Faible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-5 text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">
                      {vehicle.revenue.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-xs font-bold text-slate-400">FCFA</p>
                  </td>

                  {/* Bookings */}
                  <td className="px-4 py-5 text-right">
                    <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">
                      {vehicle.bookingsCount}
                    </p>
                    <p className="text-xs font-bold text-slate-400">
                      location{vehicle.bookingsCount > 1 ? "s" : ""}
                    </p>
                  </td>

                  {/* Occupancy */}
                  <td className="px-4 py-5 text-right">
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">
                        {vehicle.occupancyRate.toFixed(0)}%
                      </p>
                      {/* Progress bar */}
                      <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            vehicle.occupancyRate >= 60 && "bg-gradient-to-r from-emerald-500 to-emerald-600",
                            vehicle.occupancyRate >= 30 && vehicle.occupancyRate < 60 && "bg-gradient-to-r from-amber-500 to-amber-600",
                            vehicle.occupancyRate < 30 && "bg-gradient-to-r from-red-500 to-red-600"
                          )}
                          style={{ width: `${Math.min(vehicle.occupancyRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" strokeWidth={2} />
                      <p className="text-lg font-black text-slate-900 tracking-tight tabular-nums">
                        {vehicle.averageRating > 0 ? vehicle.averageRating.toFixed(1) : "—"}
                      </p>
                    </div>
                  </td>

                  {/* RevPAD */}
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-violet-600/5 border border-violet-500/20 px-3.5 py-2 shadow-sm">
                      <TrendingUp className="h-4 w-4 text-violet-600" strokeWidth={2.5} />
                      <p className="text-sm font-black text-violet-700 tabular-nums">
                        {vehicle.revPAD.toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
