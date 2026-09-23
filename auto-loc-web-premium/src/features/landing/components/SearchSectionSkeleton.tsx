import React from "react";

export const SearchSectionSkeleton: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-[#041912]/8 bg-white shadow-[0_20px_48px_-16px_rgba(4,25,18,0.18)] animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-full bg-slate-200/80" />
          <div className="h-6 w-48 rounded-md bg-slate-200" />
        </div>
      </div>

      {/* Accordion Steps Skeleton */}
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {/* Step 1 Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-200/80" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* Step 2 Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-4 w-40 rounded bg-slate-200/80" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* Step 3 Skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-slate-200" />
              <div className="h-4 w-36 rounded bg-slate-200/80" />
            </div>
            <div className="h-7 w-16 rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 p-4">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-11 flex-1 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
};
