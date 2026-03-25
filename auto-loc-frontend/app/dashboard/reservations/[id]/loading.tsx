import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function BackSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400">
      <Skeleton className="w-4 h-4 rounded-md bg-slate-200 animate-pulse" />
      <Skeleton className="h-4 w-56 rounded-md bg-slate-200 animate-pulse" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] shadow-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl animate-pulse" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative p-6 lg:p-8 space-y-6">
        {/* Top badges */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Skeleton className="h-8 w-44 rounded-full bg-white/10 animate-pulse" />
          <Skeleton className="h-8 w-40 rounded-full bg-white/5 animate-pulse" />
        </div>

        {/* Title + total pill */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-[320px] rounded-md bg-white/10 animate-pulse" />
            <Skeleton className="h-4 w-[240px] rounded-md bg-white/10 animate-pulse" />
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-5 space-y-3">
            <Skeleton className="h-3 w-56 rounded-md bg-emerald-400/20 animate-pulse" />
            <Skeleton className="h-10 w-48 rounded-md bg-emerald-400/20 animate-pulse" />
            <Skeleton className="h-4 w-56 rounded-md bg-emerald-400/10 animate-pulse" />
          </div>
        </div>

        {/* Dates strip */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 sm:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-xl bg-emerald-500/10 animate-pulse border border-emerald-500/20" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded-md bg-white/10 animate-pulse" />
                <Skeleton className="h-4 w-36 rounded-md bg-white/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionStackSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-7 h-7 rounded-lg bg-emerald-100 animate-pulse border border-emerald-200 mt-0.5" />
            <div className="space-y-3 w-full">
              <Skeleton className="h-4 w-72 rounded-md bg-emerald-200/60 animate-pulse" />
              <Skeleton className="h-4 w-96 rounded-md bg-emerald-200/40 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContractBannerSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-4">
      <Skeleton className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 animate-pulse" />
      <div className="flex-1 min-w-0 space-y-3">
        <Skeleton className="h-4 w-64 rounded-md bg-slate-100 animate-pulse" />
        <Skeleton className="h-3 w-80 rounded-md bg-slate-100 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24 rounded-xl bg-slate-100 animate-pulse" />
        <Skeleton className="h-10 w-20 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 animate-pulse" />
        <Skeleton className="h-3 w-24 rounded-md bg-slate-200 animate-pulse" />
      </div>
      <div className="px-5 py-4 space-y-4">
        <Skeleton className="w-full h-36 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
        <Skeleton className="h-5 w-[70%] rounded-md bg-slate-100 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24 rounded-md bg-slate-100 animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 animate-pulse" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-40 rounded-md bg-slate-100 animate-pulse" />
              <Skeleton className="h-4 w-52 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 animate-pulse" />
        <Skeleton className="h-3 w-16 rounded-md bg-slate-200 animate-pulse" />
      </div>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
          <Skeleton className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 animate-pulse" />
          <div className="space-y-3 w-full">
            <Skeleton className="h-3 w-44 rounded-md bg-slate-100 animate-pulse" />
            <Skeleton className="h-4 w-56 rounded-md bg-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-3.5 py-3">
              <Skeleton className="h-3 w-28 rounded-md bg-slate-100 animate-pulse" />
              <Skeleton className="h-4 w-24 rounded-md bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 animate-pulse" />
        <Skeleton className="h-3 w-28 rounded-md bg-slate-200 animate-pulse" />
      </div>
      <div className="px-5 py-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              <Skeleton className="w-8 h-8 rounded-full bg-slate-100 border border-slate-100 animate-pulse" />
              {i !== 3 && <Skeleton className="w-px h-10 bg-slate-100 animate-pulse" />}
            </div>
            <div className="flex-1">
              <Skeleton className="h-4 w-56 rounded-md bg-slate-100 animate-pulse" />
              <Skeleton className="h-3 w-56 rounded-md bg-slate-100 animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        <Skeleton className="h-4 w-40 rounded-md bg-slate-100 animate-pulse" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-video rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TenantReservationDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">
        <BackSkeleton />
        <HeroSkeleton />
        <ActionStackSkeleton />
        <ContractBannerSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VehicleCardSkeleton />
          <PaymentCardSkeleton />
        </div>

        <PhotosSkeleton />
        <TimelineCardSkeleton />

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-6 animate-pulse">
          <Skeleton className="h-4 w-64 bg-slate-100 rounded-md animate-pulse" />
          <Skeleton className="mt-4 h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

