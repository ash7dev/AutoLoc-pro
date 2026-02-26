'use client';

import React from 'react';
import { X, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExplorerFiltersState } from './ExplorerGrid';

// ─── Static data (exported for reuse in ActiveFilters) ────────────────────────
export const ZONES = [
    { value: '', label: 'Toutes les zones' },
    { value: 'almadies-ngor-mamelles', label: 'Almadies – Ngor – Mamelles' },
    { value: 'ouakam-yoff', label: 'Ouakam – Yoff' },
    { value: 'mermoz-sacrecoeur-ckg', label: 'Mermoz – Sacré-Cœur – CKG' },
    { value: 'plateau-medina-gueuletapee', label: 'Plateau – Médina – Gueule Tapée' },
    { value: 'liberte-sicap-granddakar', label: 'Liberté – Sicap – Grand Dakar' },
    { value: 'parcelles-grandyoff', label: 'Parcelles Assainies – Grand Yoff' },
    { value: 'pikine-guediawaye', label: 'Pikine – Guédiawaye' },
    { value: 'keurmassar-rufisque', label: 'Keur Massar – Rufisque' },
];

export const VEHICLE_TYPES = [
    { value: 'BERLINE', label: 'Berline' },
    { value: 'SUV', label: 'SUV' },
    { value: 'CITADINE', label: 'Citadine' },
    { value: '4X4', label: '4x4' },
    { value: 'PICKUP', label: 'Pick-up' },
    { value: 'MONOSPACE', label: 'Monospace' },
    { value: 'MINIBUS', label: 'Minibus' },
    { value: 'UTILITAIRE', label: 'Utilitaire' },
    { value: 'LUXE', label: 'Luxe' },
];

export const FUEL_TYPES = [
    { value: 'ESSENCE', label: 'Essence' },
    { value: 'DIESEL', label: 'Diesel' },
    { value: 'HYBRIDE', label: 'Hybride' },
    { value: 'ELECTRIQUE', label: 'Électrique' },
];

export const TRANSMISSIONS = [
    { value: 'AUTOMATIQUE', label: 'Automatique' },
    { value: 'MANUELLE', label: 'Manuelle' },
];

export const BUDGET_PRESETS = [
    { value: 15000, label: '15 000 FCFA' },
    { value: 30000, label: '30 000 FCFA' },
    { value: 50000, label: '50 000 FCFA' },
    { value: 100000, label: '100 000 FCFA' },
];

export const PLACES_OPTIONS = [2, 4, 5, 7];

export const NOTE_OPTIONS = [3, 3.5, 4, 4.5];

export const SORT_OPTIONS = [
    { value: 'popular', label: 'Pertinence' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'newest', label: 'Plus récents' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const SELECT_CLASS = cn(
    'w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5',
    'text-[13px] font-medium text-white placeholder-white/30',
    'focus:border-emerald-400/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-400/30',
    'transition-all duration-200',
);

const SECTION_TITLE = 'text-[10.5px] font-bold uppercase tracking-widest text-white/30 mb-3';

const PILL = (active: boolean) => cn(
    'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 border',
    active
        ? 'bg-emerald-400 text-black border-emerald-400'
        : 'bg-white/5 text-white/50 border-white/10 hover:border-emerald-400/30 hover:text-white/80',
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExplorerFiltersProps {
    filters: ExplorerFiltersState;
    onChange: (filters: ExplorerFiltersState) => void;
    onReset: () => void;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    filteredCount: number;
}

// ─── Filter content (shared between sidebar and bottom sheet) ─────────────────
function FilterContent({
    filters,
    onChange,
    onReset,
    hasActiveFilters,
}: {
    filters: ExplorerFiltersState;
    onChange: (partial: Partial<ExplorerFiltersState>) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}) {
    return (
        <div className="flex flex-col gap-6">
            {/* Zone */}
            <div>
                <p className={SECTION_TITLE}>Zone</p>
                <select
                    value={filters.zone}
                    onChange={(e) => onChange({ zone: e.target.value })}
                    className={SELECT_CLASS}
                >
                    {ZONES.map((z) => (
                        <option key={z.value} value={z.value} className="bg-slate-900 text-white">{z.label}</option>
                    ))}
                </select>
            </div>

            {/* Type */}
            <div>
                <p className={SECTION_TITLE}>Type de véhicule</p>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onChange({ type: '' })} className={PILL(filters.type === '')}>
                        Tous
                    </button>
                    {VEHICLE_TYPES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => onChange({ type: filters.type === t.value ? '' : t.value })}
                            className={PILL(filters.type === t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget max */}
            <div>
                <p className={SECTION_TITLE}>Budget max / jour</p>
                <div className="grid grid-cols-2 gap-2">
                    {BUDGET_PRESETS.map((b) => (
                        <button
                            key={b.value}
                            type="button"
                            onClick={() => onChange({ budgetMax: filters.budgetMax === b.value ? null : b.value })}
                            className={cn(PILL(filters.budgetMax === b.value), 'text-center justify-center')}
                        >
                            {b.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fuel */}
            <div>
                <p className={SECTION_TITLE}>Carburant</p>
                <div className="flex flex-wrap gap-2">
                    {FUEL_TYPES.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => onChange({ fuel: filters.fuel === f.value ? '' : f.value })}
                            className={PILL(filters.fuel === f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transmission */}
            <div>
                <p className={SECTION_TITLE}>Transmission</p>
                <div className="flex gap-2">
                    {TRANSMISSIONS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => onChange({ transmission: filters.transmission === t.value ? '' : t.value })}
                            className={cn(PILL(filters.transmission === t.value), 'flex-1 text-center justify-center')}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Nb places */}
            <div>
                <p className={SECTION_TITLE}>Nombre de places min.</p>
                <div className="flex gap-2">
                    {PLACES_OPTIONS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onChange({ places: filters.places === p ? null : p })}
                            className={cn(PILL(filters.places === p), 'flex-1 text-center justify-center')}
                        >
                            {p}+
                        </button>
                    ))}
                </div>
            </div>

            {/* Note minimum */}
            <div>
                <p className={SECTION_TITLE}>Note minimum</p>
                <div className="flex gap-2">
                    {NOTE_OPTIONS.map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange({ noteMin: filters.noteMin === n ? null : n })}
                            className={cn(PILL(filters.noteMin === n), 'flex-1 text-center justify-center gap-1')}
                        >
                            <Star className="h-3 w-3 inline" strokeWidth={filters.noteMin === n ? 0 : 1.5} fill={filters.noteMin === n ? '#000' : 'none'} />
                            {n}+
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className={cn(
                        'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl',
                        'border border-white/10 bg-white/5 text-[13px] font-semibold text-white/50',
                        'hover:border-red-400/30 hover:text-red-400 hover:bg-red-400/5',
                        'transition-all duration-200',
                    )}
                >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                    Réinitialiser
                </button>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ExplorerFilters({
    filters,
    onChange,
    onReset,
    isMobileOpen,
    onCloseMobile,
    filteredCount,
}: ExplorerFiltersProps): React.ReactElement {
    const hasActiveFilters =
        filters.zone !== '' || filters.type !== '' || filters.budgetMax !== null ||
        filters.fuel !== '' || filters.transmission !== '' ||
        filters.places !== null || filters.noteMin !== null;

    function handleChange(partial: Partial<ExplorerFiltersState>) {
        onChange({ ...filters, ...partial } as ExplorerFiltersState);
    }

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
                <div className="sticky top-[76px] rounded-2xl bg-black border border-white/10 p-6 max-h-[calc(100vh-92px)] overflow-y-auto scrollbar-hide">
                    <p className="text-[13px] font-bold text-white mb-6">Filtres</p>
                    <FilterContent
                        filters={filters}
                        onChange={handleChange}
                        onReset={onReset}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>
            </aside>

            {/* ── Mobile bottom sheet ── */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />

                    {/* Sheet */}
                    <div className="absolute bottom-0 inset-x-0 max-h-[88vh] flex flex-col rounded-t-2xl bg-[#0d0d0d] border-t border-white/10 animate-slide-up">
                        {/* Handle + header */}
                        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-1 rounded-full bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
                                <h3 className="text-[16px] font-bold text-white">Filtres</h3>
                                {hasActiveFilters && (
                                    <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-400">
                                        Actifs
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-hide">
                            <FilterContent
                                filters={filters}
                                onChange={handleChange}
                                onReset={onReset}
                                hasActiveFilters={hasActiveFilters}
                            />
                        </div>

                        {/* Sticky CTA bottom */}
                        <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 bg-[#0d0d0d]">
                            <button
                                type="button"
                                onClick={onCloseMobile}
                                className={cn(
                                    'w-full py-3.5 rounded-xl font-bold text-[14px]',
                                    'bg-emerald-400 text-black',
                                    'hover:bg-emerald-300 transition-colors duration-200',
                                    'shadow-lg shadow-emerald-400/20',
                                )}
                            >
                                Voir {filteredCount} résultat{filteredCount !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
