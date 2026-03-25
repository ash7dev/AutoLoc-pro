import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function OwnerHeaderSkeleton({
  title,
  subtitle,
  withCta = true,
}: {
  title: string;
  subtitle: string;
  withCta?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl animate-pulse" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="h-3 w-28 rounded-md bg-white/10 animate-pulse" />
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
            <span className="block h-7 sm:h-8 w-60 sm:w-76 rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{title}</span>
          </h1>
          <p className="font-body text-sm text-white/40 tracking-normal">
            <span className="block h-4 w-[300px] rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{subtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          <div className="hidden md:block h-8 w-px bg-white/10" />
          {/* Notification bell */}
          <div className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />
          {withCta && (
            <div className="h-9 w-44 rounded-xl bg-emerald-500/20 border border-emerald-500/20 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

function ReservationCardSkeleton() {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden animate-pulse">
      {/* Urgency accent placeholder */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-slate-900 via-slate-600 to-slate-900 opacity-70" />

      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3.5">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-56 bg-slate-100 animate-pulse rounded-md" />
          <div className="mt-3">
            <Skeleton className="h-3 w-40 bg-slate-100 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="h-7 w-20 rounded-full bg-slate-100" />
      </div>

      <div className="mx-5 h-px bg-slate-100" />

      <div className="px-5 py-3.5 flex-1 space-y-2">
        <Skeleton className="h-4 w-52 bg-slate-100 animate-pulse rounded-md" />
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200" />
          <Skeleton className="h-4 w-40 bg-slate-100 animate-pulse rounded-md" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/40 mt-auto">
        <div>
          <Skeleton className="h-3 w-28 bg-slate-100 animate-pulse rounded-md" />
          <Skeleton className="mt-2 h-5 w-36 bg-slate-100 animate-pulse rounded-md" />
        </div>
        <div className="h-8 w-8 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function OwnerReservationsListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <Skeleton className="h-4 w-24 bg-white/20 animate-pulse rounded-md" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Skeleton className="h-4 w-24 bg-emerald-500/20 animate-pulse rounded-md" />
        </div>
        <div className="ml-auto">
          <Skeleton className="h-4 w-28 bg-slate-100 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="h-10 w-28 rounded-xl bg-white border border-slate-200/70 animate-pulse flex-shrink-0"
          />
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ReservationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function OwnerReservationsLoading() {
  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <OwnerHeaderSkeleton
        title="Gestion réservations"
        subtitle="Aperçu de vos réservations"
      />
      <OwnerReservationsListSkeleton />
    </div>
  );
}

