import React from "react";
import { LogoLoader } from "@/components/ui/logo-loader";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Logo Loader - Mobile uniquement pour feedback visuel immédiat */}
      <div className="lg:hidden">
        <LogoLoader message="Chargement du tableau de bord..." />
      </div>

      {/* Skeleton détaillé - Desktop pour un effet élégant */}
      <div className="hidden lg:flex flex-col gap-6 p-6 animate-in fade-in duration-300">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-56 bg-slate-200/80" />
          <Skeleton className="h-4 w-96 bg-slate-100/60" />
        </div>

        {/* Stats Row - 4 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { icon: "emerald", label: "Revenu total" },
            { icon: "sky", label: "Réservations" },
            { icon: "violet", label: "Taux occupation" },
            { icon: "amber", label: "Véhicules" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-[2rem] p-7 flex flex-col justify-between h-44"
            >
              <div className="flex justify-between items-start">
                <Skeleton className={`w-14 h-14 rounded-2xl bg-${stat.icon}-100/50`} />
                <Skeleton className="w-2 h-2 rounded-full bg-slate-100" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-3 w-28 bg-slate-100/50" />
                <Skeleton className="h-9 w-36 bg-slate-200/60" />
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart + Wallet Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 h-[420px] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 bg-slate-100" />
                <Skeleton className="h-8 w-48 bg-slate-200" />
              </div>
              <Skeleton className="h-9 w-32 bg-slate-100 rounded-xl" />
            </div>
            {/* Chart Area */}
            <div className="flex-1 flex items-end gap-2 pb-4">
              {[20, 40, 30, 60, 45, 70, 55, 80, 65, 90, 75, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <Skeleton
                    className="w-full bg-gradient-to-t from-emerald-100 to-emerald-50 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-full bg-slate-50 rounded mt-4" />
          </div>

          {/* Wallet Card - Dark Background */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 h-[420px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <Skeleton className="h-6 w-24 bg-white/10" />
              <Skeleton className="h-9 w-28 bg-white/10 rounded-xl" />
            </div>
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-12 w-56 bg-white/15" />
              </div>
              <Skeleton className="h-px w-full bg-white/10" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20 bg-white/10" />
                  <Skeleton className="h-7 w-28 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-white/10" />
                  <Skeleton className="h-7 w-24 bg-white/10" />
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 space-y-2">
                <Skeleton className="h-3 w-20 bg-white/10" />
                <Skeleton className="h-6 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Todo Card + Quick Actions Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Todo Card */}
          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 h-80">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-40 bg-slate-200" />
              <Skeleton className="h-8 w-24 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                  <Skeleton className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-slate-200" />
                    <Skeleton className="h-3 w-full bg-slate-100" />
                    <Skeleton className="h-3 w-1/2 bg-slate-100" />
                  </div>
                  <Skeleton className="w-5 h-5 rounded-full bg-slate-100 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="xl:col-span-1 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[2rem] p-8 h-80 flex flex-col">
            <Skeleton className="h-6 w-32 bg-white/20 mb-6" />
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-6 w-20 bg-white/30" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reservations + Analytics Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Reservations Pipeline */}
          <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-8 h-96">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-48 bg-slate-200" />
              <Skeleton className="h-8 w-32 bg-slate-100 rounded-xl" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <Skeleton className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 bg-slate-200" />
                    <Skeleton className="h-3 w-full bg-slate-100" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-5 w-24 bg-slate-200 ml-auto" />
                    <Skeleton className="h-6 w-20 bg-emerald-100 rounded-lg ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Column */}
          <div className="xl:col-span-1 space-y-6">
            {/* Reservation Stats */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 h-44">
              <Skeleton className="h-5 w-36 bg-slate-200 mb-4" />
              <div className="flex items-center justify-center h-24">
                <Skeleton className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100" />
              </div>
            </div>

            {/* Fleet Performance */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 h-44">
              <Skeleton className="h-5 w-40 bg-slate-200 mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-32 bg-slate-100" />
                      <Skeleton className="h-3 w-12 bg-slate-200" />
                    </div>
                    <Skeleton className="h-2 w-full bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 h-96">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-48 bg-slate-200" />
            <div className="flex gap-2">
              <Skeleton className="w-9 h-9 rounded-xl bg-slate-100" />
              <Skeleton className="w-9 h-9 rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
              <Skeleton key={i} className="h-8 bg-slate-50 rounded-lg" />
            ))}
            {/* Calendar Days */}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-12 rounded-lg ${
                  i % 7 === 5 || i % 7 === 6 ? 'bg-slate-50' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
