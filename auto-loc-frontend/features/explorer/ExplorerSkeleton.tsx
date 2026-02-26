'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Skeleton card ────────────────────────────────────────────────────────────
export function VehicleCardSkeleton(): React.ReactElement {
    return (
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white overflow-hidden animate-pulse">
            {/* Photo skeleton */}
            <div className="aspect-[16/10] bg-slate-100" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-slate-100" />
                    <div className="h-3 w-12 rounded bg-slate-100" />
                </div>
                <div>
                    <div className="h-5 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-28 rounded bg-slate-100 mt-2" />
                </div>
                <div className="flex gap-3">
                    <div className="h-4 w-16 rounded bg-slate-100" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                </div>
                <div className="border-t border-slate-50" />
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="h-4 w-10 rounded bg-slate-100" />
                        <div className="h-4 w-14 rounded bg-slate-100" />
                    </div>
                    <div className="h-8 w-24 rounded-xl bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton grid ────────────────────────────────────────────────────────────
export function VehicleGridSkeleton({ count = 6 }: { count?: number }): React.ReactElement {
    return (
        <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3')}>
            {Array.from({ length: count }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
            ))}
        </div>
    );
}
