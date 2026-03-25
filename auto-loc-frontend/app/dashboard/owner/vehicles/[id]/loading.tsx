import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function TopBarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors group">
        <Skeleton className="h-4 w-4 rounded-md bg-slate-100 animate-pulse" />
        <Skeleton className="h-4 w-36 rounded-md bg-slate-100 animate-pulse" />
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block h-10 w-44 rounded-xl border border-slate-200 bg-white animate-pulse" />
        <div className="h-9 w-28 rounded-xl border border-slate-200 bg-white animate-pulse" />
      </div>
    </div>
  );
}

function HeroCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/80">
      <div className="lg:grid lg:grid-cols-[480px_1fr]">
        <div className="relative h-[260px] lg:h-full bg-slate-100 overflow-hidden">
          <Skeleton className="absolute inset-0 bg-slate-200 animate-pulse" />
        </div>
        <div className="flex flex-col justify-between gap-5 p-6 lg:p-8">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Skeleton className="h-8 w-72 rounded-md bg-slate-100 animate-pulse" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-xl bg-slate-100 animate-pulse" />
                  <Skeleton className="h-8 w-28 rounded-xl bg-slate-100 animate-pulse" />
                  <Skeleton className="h-8 w-20 rounded-xl bg-slate-100 animate-pulse" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-36 rounded-md bg-slate-100 animate-pulse" />
                <Skeleton className="h-10 w-52 rounded-md bg-slate-100 animate-pulse" />
              </div>
              <Skeleton className="h-9 w-44 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 flex gap-2 overflow-x-auto bg-slate-50/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="w-20 h-14 rounded-xl bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="rounded-2xl border p-5 flex flex-col gap-3 bg-white"
        >
          <Skeleton className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
          <Skeleton className="h-7 w-36 rounded-md bg-slate-100 animate-pulse" />
          <Skeleton className="h-4 w-48 rounded-md bg-slate-100 animate-pulse" />
          <Skeleton className="h-3 w-44 rounded-md bg-slate-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SectionCardSkeleton({
  titleWidth = "w-44",
  bodyHeight = "h-72",
}: {
  titleWidth?: string;
  bodyHeight?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 animate-pulse border border-emerald-100" />
          <Skeleton className={`${titleWidth} h-4 rounded-md bg-slate-100 animate-pulse`} />
        </div>
        <Skeleton className="h-8 w-28 rounded-md bg-slate-100 animate-pulse" />
      </div>
      <div className="p-5">
        <div className={`rounded-xl bg-slate-50 border border-slate-100 ${bodyHeight} animate-pulse`} />
      </div>
    </div>
  );
}

export default function OwnerVehicleDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <TopBarSkeleton />

        <HeroCardSkeleton />

        <KpiGridSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCardSkeleton titleWidth="w-44" bodyHeight="h-72" />
          <SectionCardSkeleton titleWidth="w-52" bodyHeight="h-72" />
        </div>
      </div>
    </div>
  );
}

