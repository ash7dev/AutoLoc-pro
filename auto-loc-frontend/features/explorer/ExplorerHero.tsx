'use client';

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExplorerHeroProps {
    totalResults: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilterCount: number;
    onToggleMobileFilters: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ExplorerHero({
    totalResults,
    searchQuery,
    onSearchChange,
    activeFilterCount,
    onToggleMobileFilters,
}: ExplorerHeroProps): React.ReactElement {
    return (
        <section className="relative overflow-hidden bg-black">
            {/* Glow */}
            <div
                className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-8 lg:px-8 lg:pt-16 lg:pb-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                        {totalResults} véhicule{totalResults !== 1 ? 's' : ''} disponible{totalResults !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black tracking-tight text-white leading-tight lg:text-5xl max-w-xl">
                    Explorez nos{' '}
                    <span className="text-emerald-400">véhicules</span>
                </h1>
                <p className="mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-white/50">
                    Parcourez des centaines de véhicules vérifiés. Filtrez, comparez, réservez.
                </p>

                {/* Search bar row */}
                <div className="mt-7 flex items-center gap-3 max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" strokeWidth={2} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Rechercher par marque, modèle…"
                            className={cn(
                                'w-full rounded-xl border border-white/15 bg-white/10 pl-11 pr-4 py-3',
                                'text-[14px] font-medium text-white placeholder-white/30 backdrop-blur-sm',
                                'focus:border-emerald-400/60 focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-emerald-400/40',
                                'transition-all duration-200',
                            )}
                        />
                    </div>

                    {/* Mobile filter toggle */}
                    <button
                        type="button"
                        onClick={onToggleMobileFilters}
                        className={cn(
                            'lg:hidden flex items-center gap-2 px-4 h-[46px] rounded-xl',
                            'border border-white/15 bg-white/10 text-white/70',
                            'hover:border-emerald-400/40 hover:text-emerald-400',
                            'transition-all duration-200 flex-shrink-0',
                        )}
                        aria-label="Filtres"
                    >
                        <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                        {activeFilterCount > 0 && (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400 text-black text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}
