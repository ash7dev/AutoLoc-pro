import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerFleetSkeleton } from "@/features/vehicles/owner/OwnerFleet";

function OwnerHeaderWithStatsSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
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
            <span className="block h-7 sm:h-8 w-56 sm:w-72 rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{title}</span>
          </h1>
          <p className="font-body text-sm text-white/40 tracking-normal">
            <span className="block h-4 w-[280px] rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{subtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          {/* Stats cards placeholders (visible on lg in real component) */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                  <div className="h-4 w-4 rounded bg-white/20 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-white/10 animate-pulse rounded-md" />
                  <Skeleton className="h-5 w-14 bg-white/10 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block h-8 w-px bg-white/10" />

          {/* Notification bell */}
          <div className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />

          {/* CTA button */}
          <div className="h-9 w-44 rounded-xl bg-emerald-500/20 border border-emerald-500/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function FleetToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/20 p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-lg bg-muted animate-pulse"
            aria-hidden
          />
        ))}
      </div>

      <div className="flex-1" />

      <div className="hidden sm:block h-9 w-44 rounded-xl bg-muted animate-pulse" />

      <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/20 p-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function OwnerVehiclesLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <OwnerHeaderWithStatsSkeleton
        title="Gestion véhicules"
        subtitle="Vue d'ensemble de votre flotte et des statuts en cours."
      />

      <div className="font-body space-y-6">
        <FleetToolbarSkeleton />
        <OwnerFleetSkeleton />
      </div>
    </div>
  );
}

