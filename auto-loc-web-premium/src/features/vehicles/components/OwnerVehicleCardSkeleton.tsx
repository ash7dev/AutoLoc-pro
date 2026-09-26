'use client';

import React from 'react';

/**
 * Skeleton de chargement pour les cartes de véhicules Hôte.
 * Reproduit la disposition responsive exacte de OwnerVehicleCard avec animation pulse (0 spinner).
 */
export const OwnerVehicleCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-5 sm:rounded-[26px] animate-pulse shadow-xs"
    >
      {/* 📱 Vue Mobile Skeleton */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-start gap-3">
          <div className="h-[104px] w-[104px] shrink-0 rounded-xl bg-brand-main/[0.08]" />
          <div className="flex-1 space-y-2 min-h-[104px]">
            <div className="h-4 w-32 rounded-lg bg-brand-main/[0.08]" />
            <div className="h-3 w-24 rounded-md bg-brand-main/[0.05]" />
            <div className="h-5 w-20 rounded-md bg-brand-main/[0.08] mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5">
          <div className="h-9 rounded-xl bg-brand-main/[0.06]" />
          <div className="h-9 rounded-xl bg-brand-main/[0.08]" />
        </div>
      </div>

      {/* 💻 Vue Desktop Skeleton */}
      <div className="hidden sm:flex sm:flex-col">
        {/* Photo Header */}
        <div className="h-48 w-full rounded-2xl bg-brand-main/[0.08]" />

        {/* Title & Price */}
        <div className="mt-4 flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-6 w-44 rounded-xl bg-brand-main/[0.08]" />
            <div className="h-3.5 w-28 rounded-md bg-brand-main/[0.05]" />
          </div>
          <div className="h-6 w-24 rounded-lg bg-brand-main/[0.08]" />
        </div>

        {/* Specs line */}
        <div className="mt-4 flex items-center justify-between border-y border-slate-100 py-3">
          <div className="h-4 w-20 rounded bg-brand-main/[0.06]" />
          <div className="h-4 w-20 rounded bg-brand-main/[0.06]" />
          <div className="h-4 w-20 rounded bg-brand-main/[0.06]" />
        </div>

        {/* Performance line */}
        <div className="mt-3 flex items-center justify-between">
          <div className="h-3.5 w-32 rounded bg-brand-main/[0.05]" />
          <div className="h-3.5 w-28 rounded bg-brand-main/[0.05]" />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="h-10 rounded-xl bg-brand-main/[0.06]" />
          <div className="h-10 rounded-xl bg-brand-main/[0.08]" />
        </div>
      </div>
    </div>
  );
};
