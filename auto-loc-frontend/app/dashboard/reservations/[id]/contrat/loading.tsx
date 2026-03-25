import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function BackLinkSkeleton() {
  return (
    <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors group print:hidden">
      <Skeleton className="w-4 h-4 rounded-md bg-slate-200 animate-pulse" />
      <Skeleton className="h-4 w-44 rounded-md bg-slate-200 animate-pulse" />
    </div>
  );
}

function DocumentHeaderSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100">
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
        <Skeleton className="h-9 w-32 rounded-md bg-slate-100 animate-pulse" />
        <Skeleton className="h-9 w-40 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <Skeleton className="h-6 w-[70%] rounded-md bg-slate-100 animate-pulse" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-64 rounded-md bg-slate-100 animate-pulse" />
        ))}
      </div>

      <div className="mt-3 print:hidden">
        <Skeleton className="h-9 w-32 rounded-md bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function PartiesSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-slate-50/60 border-b border-slate-100">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-28 rounded-md bg-slate-200 animate-pulse" />
            <Skeleton className="h-4 w-52 rounded-md bg-slate-100 animate-pulse" />
            <Skeleton className="h-3 w-64 rounded-md bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationSkeleton() {
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 sm:mb-4">
          <Skeleton className="h-3 w-56 rounded-md bg-emerald-100 animate-pulse" />
        </p>

        <div className="sm:hidden rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-emerald-700 px-4 py-2">
            <Skeleton className="h-4 w-40 rounded-md bg-white/20 animate-pulse" />
          </div>
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-64 rounded-md bg-slate-100 animate-pulse" />
            <Skeleton className="h-3 w-44 rounded-md bg-slate-100 animate-pulse" />
            <Skeleton className="h-3 w-[80%] rounded-md bg-slate-100 animate-pulse" />

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-md bg-slate-100 animate-pulse" />
                  <Skeleton className="h-3 w-20 rounded-md bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <Skeleton className="h-12 w-full rounded-xl bg-slate-50 animate-pulse" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FeesAndRevenueSkeleton() {
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <Skeleton className="h-4 w-56 rounded-md bg-slate-100 animate-pulse" />
        <div className="sm:hidden space-y-2 mt-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-emerald-50 animate-pulse" />
          ))}
        </div>
        <div className="hidden sm:block overflow-x-auto mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <Skeleton className="h-14 w-full rounded-xl bg-emerald-50 border border-emerald-200 animate-pulse" />
      </div>
    </>
  );
}

function CancellationPolicySkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
      <Skeleton className="h-4 w-56 rounded-md bg-emerald-50 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <Skeleton className="h-3 w-52 rounded-md bg-slate-100 animate-pulse" />
            {Array.from({ length: 3 }).map((__, j) => (
              <Skeleton key={j} className="h-4 w-full rounded-md bg-slate-200 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConditionsSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <Skeleton className="h-4 w-56 rounded-md bg-emerald-50 animate-pulse" />
        <Skeleton className="h-4 w-36 rounded-md bg-slate-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4 space-y-2">
            <Skeleton className="h-3 w-48 rounded-md bg-slate-100 animate-pulse" />
            <Skeleton className="h-4 w-full rounded-md bg-slate-200 animate-pulse" />
            <Skeleton className="h-4 w-full rounded-md bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SignaturesSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
      <Skeleton className="h-3 w-44 rounded-md bg-emerald-50 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
            <Skeleton className="h-1 w-full bg-emerald-500 animate-pulse" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-3 w-40 rounded-md bg-slate-200 animate-pulse" />
              <Skeleton className="h-4 w-56 rounded-md bg-slate-200 animate-pulse" />
              <Skeleton className="h-3 w-64 rounded-md bg-slate-200 animate-pulse" />
              <div className="flex gap-2.5 sm:gap-3">
                <Skeleton className="flex-1 h-10 rounded-lg bg-slate-50 border border-dashed border-slate-300 animate-pulse" />
                <Skeleton className="w-28 h-10 rounded-lg bg-slate-50 border border-dashed border-slate-300 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TenantContractLoading() {
  return (
    <div className="min-h-screen bg-slate-50/80 print:bg-white">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:px-6 lg:py-10 space-y-4 sm:space-y-6 print:py-0 print:px-0 print:space-y-0">
        <BackLinkSkeleton />

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">
          <DocumentHeaderSkeleton />
          <PartiesSkeleton />

          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-5 px-3 sm:px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 sm:gap-3">
            <Skeleton className="w-4 h-4 rounded-md bg-amber-200 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-56 rounded-md bg-amber-100 animate-pulse" />
              <Skeleton className="h-4 w-[90%] rounded-md bg-amber-100 animate-pulse" />
            </div>
          </div>

          <LocationSkeleton />
          <FeesAndRevenueSkeleton />

          <CancellationPolicySkeleton />
          <ConditionsSkeleton />
          <SignaturesSkeleton />

          <div className="px-4 sm:px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-100 text-center print:bg-white">
            <Skeleton className="h-3 w-80 mx-auto rounded-md bg-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
          <Skeleton className="h-12 w-full sm:w-40 rounded-xl bg-slate-100 animate-pulse" />
          <Skeleton className="h-12 w-full sm:flex-1 rounded-xl bg-white border border-slate-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

