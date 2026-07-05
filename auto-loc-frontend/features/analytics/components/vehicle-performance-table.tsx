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
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Performance par véhicule
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Classement et statistiques détaillées
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200/60 px-3 py-1.5">
              <p className="text-xs font-bold text-emerald-600">
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
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3 text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Véhicule
                </p>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("revenue")}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Revenue
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("bookingsCount")}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Locations
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("occupancyRate")}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Occupation
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("averageRating")}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Note
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("revPAD")}
                  className="flex items-center gap-1 ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors"
                >
                  RevPAD
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedVehicles.map((vehicle, index) => {
              const isTopPerformer = vehicle.id === topPerformer?.id;
              const isLowOccupancy = vehicle.occupancyRate < 30;

              return (
                <tr
                  key={vehicle.id}
                  className={cn(
                    "group hover:bg-slate-50 transition-colors",
                    isTopPerformer && "bg-emerald-50/30"
                  )}
                >
                  {/* Vehicle */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
                        index === 0 && "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/25",
                        index === 1 && "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-400/25",
                        index === 2 && "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md shadow-orange-500/25",
                        index > 2 && "bg-slate-100 text-slate-500"
                      )}>
                        {index + 1}
                      </div>

                      {/* Photo */}
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {vehicle.photoUrl ? (
                          <Image
                            src={vehicle.photoUrl}
                            alt={vehicle.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Name + badges */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {vehicle.name}
                          </p>
                          {isTopPerformer && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300/60 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700">
                              <Crown className="h-2.5 w-2.5" />
                              Top
                            </span>
                          )}
                          {isLowOccupancy && !isTopPerformer && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200/60 px-2 py-0.5 text-[9px] font-black uppercase text-red-600">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Faible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {vehicle.revenue.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-xs font-medium text-slate-500">FCFA</p>
                  </td>

                  {/* Bookings */}
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {vehicle.bookingsCount}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      location{vehicle.bookingsCount > 1 ? "s" : ""}
                    </p>
                  </td>

                  {/* Occupancy */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-slate-900">
                        {vehicle.occupancyRate.toFixed(0)}%
                      </p>
                      {/* Mini progress bar */}
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            vehicle.occupancyRate >= 60 && "bg-emerald-500",
                            vehicle.occupancyRate >= 30 && vehicle.occupancyRate < 60 && "bg-amber-500",
                            vehicle.occupancyRate < 30 && "bg-red-500"
                          )}
                          style={{ width: `${Math.min(vehicle.occupancyRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={2} />
                      <p className="text-sm font-bold text-slate-900">
                        {vehicle.averageRating > 0 ? vehicle.averageRating.toFixed(1) : "—"}
                      </p>
                    </div>
                  </td>

                  {/* RevPAD */}
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-200/60 px-2.5 py-1">
                      <TrendingUp className="h-3 w-3 text-violet-600" strokeWidth={2.5} />
                      <p className="text-xs font-bold text-violet-700">
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
