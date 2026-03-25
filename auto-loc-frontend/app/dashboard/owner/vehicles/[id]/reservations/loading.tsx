import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function BackLinkSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors w-fit">
      <Skeleton className="w-4 h-4 rounded-md bg-slate-200 animate-pulse" />
      <Skeleton className="h-4 w-52 rounded-md bg-slate-200 animate-pulse" />
    </div>
  );
}

function OwnerHeaderLightSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl animate-pulse" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64 sm:w-72 rounded-md bg-white/10 animate-pulse" />
          <Skeleton className="h-4 w-[320px] rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          <Skeleton className="hidden md:block h-8 w-px bg-white/10 animate-pulse" />
          <Skeleton className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />
          <Skeleton className="h-9 w-44 rounded-xl bg-white/[0.06] border border-white/[0.08] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function OwnerVehicleReservationsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <BackLinkSkeleton />

      <OwnerHeaderLightSkeleton />

      {/* We rely on the internal loading prop handling for Reservation rows.
          OwnerReservationsList itself doesn't have a loading prop, so we show the list component
          in "loading" via its children pattern by passing empty data and using the skeleton wrapper
          from recent-reservations; instead, we keep it simple: show a block placeholder. */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-36 rounded-xl bg-white animate-pulse" />
          <Skeleton className="h-10 w-44 rounded-xl bg-emerald-50 animate-pulse" />
          <div className="ml-auto">
            <Skeleton className="h-4 w-28 rounded-md bg-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {Array.from({ length: 6 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={i} className="h-10 w-28 rounded-xl bg-white animate-pulse flex-shrink-0" />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className="group relative flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
              <div className="h-[2.5px] w-full bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900 opacity-70" />
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3.5">
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-4 w-56 rounded-md bg-slate-100 animate-pulse" />
                  <Skeleton className="h-3 w-40 rounded-md bg-slate-100 animate-pulse" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full bg-slate-100 animate-pulse" />
              </div>
              <div className="mx-5 h-px bg-slate-100" />
              <div className="px-5 py-3.5 flex-1 space-y-3">
                <Skeleton className="h-4 w-52 rounded-md bg-slate-100 animate-pulse" />
                <Skeleton className="h-3 w-40 rounded-md bg-slate-100 animate-pulse" />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/40 mt-auto">
                <Skeleton className="h-3 w-28 rounded-md bg-slate-100 animate-pulse" />
                <Skeleton className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

