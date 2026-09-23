import React from 'react';

export const NeutralAppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col animate-pulse">
      {/* Neutral Top Header Skeleton */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200" />
          <div className="h-5 w-32 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 rounded-full bg-slate-200" />
          <div className="w-9 h-9 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main Body Skeleton Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Banner Placeholder */}
        <div className="h-32 w-full rounded-2xl bg-slate-200/70" />

        {/* Grid Stat Tiles Placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-4 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-4 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-4 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
          </div>
          <div className="h-28 rounded-xl bg-white border border-slate-200/70 p-4 space-y-2">
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-8 w-3/4 rounded bg-slate-200" />
          </div>
        </div>

        {/* Content Table / Card Placeholder */}
        <div className="h-64 rounded-2xl bg-white border border-slate-200/70 p-6 space-y-4">
          <div className="h-6 w-1/4 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
};
