import React from 'react';

export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200 lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}
