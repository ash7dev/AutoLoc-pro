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
        <section className="relative overflow-hidden bg-slate-950 border-b border-white/5">
            {/* dynamic glow effects */}
            <div
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-[100px] pointer-events-none animate-pulse"
                style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
            />
            <div
                className="absolute top-1/2 left-2/3 w-[600px] h-[600px] rounded-full opacity-10 blur-[130px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 pt-14 pb-10 lg:px-8 lg:pt-20 lg:pb-14">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                    <div className="max-w-2xl">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 mb-6 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/90">
                                {totalResults} véhicule{totalResults !== 1 ? 's' : ''} prêt{totalResults !== 1 ? 's' : ''} au départ
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl font-black tracking-tight text-white leading-[1.1] lg:text-6xl">
                            Trouvez la voiture <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                parfaite pour vous
                            </span>
                        </h1>
                        <p className="mt-5 max-w-lg text-[16px] font-medium leading-relaxed text-slate-400">
                            De la citadine agile au SUV de luxe, parcourez notre sélection vérifiée et réservez en quelques clics.
                        </p>
                    </div>

                    {/* Search bar integration */}
                    <div className="w-full lg:max-w-md">
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" strokeWidth={2.5} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        placeholder="Marque, modèle..."
                                        className="w-full bg-transparent pl-10 pr-4 py-2.5 text-[14px] font-bold text-white placeholder-slate-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onToggleMobileFilters}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300',
                                        activeFilterCount > 0 
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    )}
                                >
                                    <SlidersHorizontal className="h-4 w-4" strokeWidth={2.5} />
                                    <span className="hidden sm:inline text-[12px] font-black uppercase tracking-wider">Filtres</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
