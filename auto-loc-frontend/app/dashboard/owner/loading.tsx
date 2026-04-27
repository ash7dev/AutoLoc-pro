import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 mb-2">
        <Skeleton className="h-10 w-48 bg-slate-200" />
        <Skeleton className="h-4 w-72 bg-slate-100" />
      </div>

      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-7 h-44 flex flex-col justify-between">
             <div className="flex justify-between items-start">
               <Skeleton className="w-12 h-12 rounded-2xl bg-slate-100" />
               <Skeleton className="w-2 h-2 rounded-full bg-slate-100" />
             </div>
             <div className="space-y-3">
                <Skeleton className="h-3 w-20 bg-slate-50" />
                <Skeleton className="h-8 w-32 bg-slate-100" />
             </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Box */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 h-[400px]">
          <div className="flex justify-between mb-8">
            <Skeleton className="h-6 w-32 bg-slate-100" />
            <Skeleton className="h-6 w-24 bg-slate-100" />
          </div>
          <Skeleton className="w-full h-64 bg-slate-50 rounded-xl" />
        </div>

        {/* Wallet Box */}
        <div className="bg-black rounded-[2rem] p-8 h-[400px] flex flex-col">
          <Skeleton className="h-6 w-32 bg-white/10 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-48 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <div className="grid grid-cols-2 gap-4">
               <Skeleton className="h-20 bg-white/5 rounded-xl" />
               <Skeleton className="h-20 bg-white/5 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations Skeleton */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 h-96">
         <Skeleton className="h-6 w-48 bg-slate-100 mb-6" />
         <div className="space-y-4">
            {[1, 2, 3].map(i => (
               <Skeleton key={i} className="h-16 w-full bg-slate-50 rounded-xl" />
            ))}
         </div>
      </div>
    </div>
  );
}
