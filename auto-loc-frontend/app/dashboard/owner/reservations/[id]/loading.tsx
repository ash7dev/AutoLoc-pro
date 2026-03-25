import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function BackLinkSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 hover:text-slate-800 transition-colors group">
      <Skeleton className="w-4 h-4 rounded-md bg-slate-200 animate-pulse" />
      <Skeleton className="h-4 w-64 rounded-md bg-slate-200 animate-pulse" />
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

      <div className="relative p-6 lg:p-8">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Skeleton className="h-8 w-40 rounded-full bg-white/10 animate-pulse" />
          <Skeleton className="h-8 w-32 rounded-full bg-white/5 animate-pulse" />
          <Skeleton className="h-8 w-48 rounded-full bg-white/10 animate-pulse" />
          <Skeleton className="h-8 w-28 rounded-full bg-white/5 animate-pulse" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-4">
            <Skeleton className="h-9 w-72 rounded-md bg-white/10 animate-pulse" />
            <Skeleton className="h-4 w-56 rounded-md bg-white/10 animate-pulse" />
          </div>
          <div className="flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 space-y-2">
            <Skeleton className="h-3 w-44 rounded-md bg-emerald-400/20 animate-pulse" />
            <Skeleton className="h-10 w-40 rounded-md bg-emerald-400/20 animate-pulse" />
            <Skeleton className="h-4 w-24 rounded-md bg-emerald-400/10 animate-pulse" />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 sm:gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" />
              <div>
                <Skeleton className="h-3 w-24 rounded-md bg-white/10 animate-pulse" />
                <Skeleton className="h-4 w-36 rounded-md bg-white/10 animate-pulse mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReservationActionsSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-6 animate-pulse">
      <Skeleton className="h-4 w-56 rounded-md bg-slate-100 animate-pulse" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-10 w-40 rounded-xl bg-slate-100 animate-pulse" />
        <Skeleton className="h-10 w-32 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function ContractCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-4 animate-pulse">
      <Skeleton className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-48 rounded-md bg-slate-100" />
        <Skeleton className="h-3 w-64 rounded-md bg-slate-100" />
      </div>
      <Skeleton className="h-10 w-28 rounded-xl bg-emerald-600/20" />
    </div>
  );
}

function InfoCardSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100" />
        <Skeleton className="h-3.5 w-32 rounded-md bg-slate-100" />
      </div>
      <div className="px-5 py-4 space-y-4">
        <Skeleton className="h-4 w-56 rounded-md bg-slate-100" />
        <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
        <Skeleton className="h-4 w-40 rounded-md bg-slate-100" />
      </div>
    </div>
  );
}

function FinancierCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden animate-pulse lg:col-span-2">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100" />
        <Skeleton className="h-3.5 w-44 rounded-md bg-slate-100" />
      </div>
      <div className="px-5 py-4 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="w-8 h-8 rounded-xl bg-slate-100" />
              <Skeleton className="h-3 w-28 rounded-md bg-slate-100" />
              <Skeleton className="h-4 w-24 rounded-md bg-slate-100" />
              <Skeleton className="h-3 w-20 rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-64 rounded-md bg-slate-100" />
          <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-3 w-56 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function TimelineCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <Skeleton className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100" />
        <Skeleton className="h-3.5 w-44 rounded-md bg-slate-100" />
      </div>
      <div className="px-5 py-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="w-8 h-8 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded-md bg-slate-100" />
              <Skeleton className="h-3 w-56 rounded-md bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerReservationDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">
        <BackLinkSkeleton />

        <HeroSkeleton />

        <ReservationActionsSkeleton />

        <ContractCardSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InfoCardSkeleton title="Locataire" />
          <InfoCardSkeleton title="Véhicule" />
          <FinancierCardSkeleton />
        </div>

        <TimelineCardSkeleton />
      </div>
    </div>
  );
}

