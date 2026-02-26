import React from 'react';

export default function VehicleLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-slate-200" />
          <div className="space-y-4">
            <div className="h-6 w-1/2 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-10 w-40 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
