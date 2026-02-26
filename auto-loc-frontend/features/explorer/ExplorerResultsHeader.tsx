'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ExplorerFiltersState } from './ExplorerGrid';

// ─── Sort options ─────────────────────────────────────────────────────────────
export const SORT_OPTIONS_HEADER = [
    { value: 'popular', label: 'Pertinence' },
    { value: 'price-asc', label: 'Prix ↑' },
    { value: 'price-desc', label: 'Prix ↓' },
    { value: 'rating', label: 'Note' },
    { value: 'newest', label: 'Récent' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExplorerResultsHeaderProps {
    totalResults: number;
    sort: string;
    onSortChange: (sort: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ExplorerResultsHeader({
    totalResults,
    sort,
    onSortChange,
}: ExplorerResultsHeaderProps): React.ReactElement {
    return (
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
            {/* Count */}
            <p className="text-[14px] font-medium text-black/50">
                <span className="text-black font-bold">{totalResults}</span>{' '}
                véhicule{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
            </p>

            {/* Sort pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {SORT_OPTIONS_HEADER.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onSortChange(opt.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-200',
                            sort === opt.value
                                ? 'bg-black text-emerald-400 shadow-sm'
                                : 'text-black/40 hover:bg-slate-100 hover:text-black/70',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
