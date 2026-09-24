'use client';

import React from 'react';

export const TenantProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-2">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded-full bg-slate-200" />
          <div className="h-10 w-64 rounded-2xl bg-slate-200" />
          <div className="h-4 w-96 rounded-lg bg-slate-100" />
        </div>
        <div className="h-10 w-32 rounded-2xl bg-slate-200" />
      </div>

      {/* 2. Hero Card Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 p-8 sm:p-10">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="h-32 w-32 rounded-full bg-slate-800" />
            <div className="space-y-3">
              <div className="h-8 w-48 rounded-xl bg-slate-800" />
              <div className="h-4 w-36 rounded-lg bg-slate-800/60" />
              <div className="h-5 w-40 rounded-lg bg-slate-800/40" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 rounded-xl bg-slate-800" />
            <div className="h-10 w-36 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      {/* 3. Cards Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="h-6 w-48 rounded-xl bg-slate-200" />
          <div className="space-y-4 divide-y divide-slate-100">
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
            <div className="h-12 w-full rounded-xl bg-slate-100" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="h-6 w-48 rounded-xl bg-slate-200" />
          <div className="h-24 w-full rounded-2xl bg-slate-100" />
          <div className="space-y-3">
            <div className="h-8 w-full rounded-xl bg-slate-100" />
            <div className="h-8 w-full rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>

      {/* 4. Security Settings Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
        <div className="h-6 w-48 rounded-xl bg-slate-200" />
        <div className="h-20 w-full rounded-2xl bg-slate-100" />
        <div className="h-20 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
};
