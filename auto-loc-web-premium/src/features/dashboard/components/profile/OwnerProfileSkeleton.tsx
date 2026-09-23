'use client';

import React from 'react';

export const OwnerProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-2">
        <div className="space-y-2">
          <div className="h-10 w-48 rounded-2xl bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-36 rounded-2xl bg-slate-200 shrink-0" />
      </div>

      {/* Hero Card Skeleton */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Skeleton */}
          <div className="h-28 w-28 rounded-full bg-slate-200 shrink-0" />

          {/* Info Skeleton */}
          <div className="flex-1 space-y-3 text-center sm:text-left w-full">
            <div className="h-8 w-64 rounded-xl bg-slate-200 mx-auto sm:mx-0" />
            <div className="h-4 w-44 rounded bg-slate-100 mx-auto sm:mx-0" />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="h-7 w-32 rounded-full bg-slate-200" />
              <div className="h-7 w-28 rounded-full bg-slate-100" />
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="h-11 w-40 rounded-2xl bg-slate-200 shrink-0" />
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6">
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
          <div className="h-16 rounded-2xl bg-slate-100" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xs" />
        <div className="h-80 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xs" />
      </div>

      {/* Security Card Skeleton */}
      <div className="h-48 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xs" />
    </div>
  );
};
