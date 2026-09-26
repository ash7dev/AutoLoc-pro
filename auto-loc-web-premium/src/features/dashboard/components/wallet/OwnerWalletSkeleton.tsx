'use client';

import React from 'react';

export const OwnerWalletSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse pb-16">
      {/* Hero Banner Skeleton */}
      <div className="relative overflow-hidden rounded-[24px] bg-brand-main p-5 sm:rounded-[32px] sm:p-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="h-6 w-48 rounded-full bg-champagne/20" />
              <div className="h-4 w-36 rounded bg-champagne/15" />
              <div className="h-12 w-64 rounded-xl bg-champagne/25" />
            </div>
            <div className="h-12 w-44 rounded-2xl bg-champagne/30 shrink-0" />
          </div>

          {/* Cards operator grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-2xl bg-champagne/10 border border-white/10" />
            <div className="h-20 rounded-2xl bg-champagne/10 border border-white/10" />
          </div>

          <div className="h-4 w-72 rounded bg-champagne/15 pt-2" />
        </div>
      </div>

      {/* Transaction Ledger Skeleton */}
      <div className="space-y-6 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-60 rounded-xl bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-100" />
          </div>
          <div className="h-10 w-full sm:w-72 rounded-2xl bg-slate-100" />
        </div>

        {/* Tab filters skeleton */}
        <div className="flex gap-2 border-b border-slate-100 pb-3">
          <div className="h-8 w-32 rounded-xl bg-slate-200" />
          <div className="h-8 w-28 rounded-xl bg-slate-100" />
          <div className="h-8 w-32 rounded-xl bg-slate-100" />
        </div>

        {/* Rows skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-slate-200" />
                  <div className="h-3 w-28 rounded bg-slate-100" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 w-24 rounded bg-slate-200 ml-auto" />
                <div className="h-3 w-16 rounded bg-slate-100 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
