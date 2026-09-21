"use client";

import React from "react";

interface VehiclesGridSkeletonProps {
  count?: number;
}

export const VehiclesGridSkeleton: React.FC<VehiclesGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl bg-white border border-slate-200/70 p-3 shadow-sm overflow-hidden animate-pulse flex flex-col gap-3"
        >
          {/* Image Placeholder */}
          <div className="w-full h-52 md:h-56 bg-slate-200 rounded-2xl" />

          {/* Details Placeholder */}
          <div className="px-2 pt-1 pb-2 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-5 bg-slate-200 rounded-full w-12" />
            </div>

            <div className="h-4 bg-slate-150 rounded w-1/2" />

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <div className="h-7 bg-slate-100 rounded-lg w-1/3" />
              <div className="h-7 bg-slate-100 rounded-lg w-1/3" />
              <div className="h-7 bg-slate-100 rounded-lg w-1/3" />
            </div>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
              <div className="h-6 bg-slate-200 rounded w-24" />
              <div className="h-8 bg-slate-200 rounded-full w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
