import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/features/landing/Footer";

function ReservationsHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-9 w-72 bg-slate-100 rounded-md animate-pulse" />
      <Skeleton className="h-4 w-[520px] bg-slate-100 rounded-md animate-pulse mt-2" />
    </div>
  );
}

function TabsSearchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-md bg-slate-200 animate-pulse" />
          <Skeleton className="w-full h-11 rounded-xl bg-slate-50/50 border border-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ReservationCardSkeleton() {
  return (
    <div className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
      <Skeleton className="w-full sm:w-36 h-28 rounded-xl bg-slate-100" />
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-56 rounded-md bg-slate-100" />
            <Skeleton className="h-7 w-28 rounded-full bg-slate-100" />
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <Skeleton className="h-3 w-44 rounded-md bg-slate-100" />
            <Skeleton className="h-3 w-60 rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <Skeleton className="h-6 w-32 rounded-md bg-slate-100" />
          <Skeleton className="h-3 w-44 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function TenantReservationsLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
        <ReservationsHeaderSkeleton />
        <TabsSearchSkeleton />
        <div className="grid grid-cols-1 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <ReservationCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}

