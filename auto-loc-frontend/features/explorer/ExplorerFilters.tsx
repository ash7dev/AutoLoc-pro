'use client';

import React from 'react';
import type { ExplorerFiltersState } from './ExplorerGrid';
import { FilterContent, MobileFilterSheet } from './MobileFilterSheet';

export {
    ZONES, VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS,
    BUDGET_PRESETS, EQUIPMENTS, PLACES_OPTIONS, NOTE_OPTIONS, SORT_OPTIONS,
} from './MobileFilterSheet';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExplorerFiltersProps {
    filters: ExplorerFiltersState;
    onChange: (filters: ExplorerFiltersState) => void;
    onReset: () => void;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    filteredCount: number;
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
        filters.zone !== '' || filters.type !== '' || filters.budgetMin !== null || filters.budgetMax !== null ||
        filters.fuel !== '' || filters.transmission !== '' ||
        filters.places !== null || filters.noteMin !== null ||
        filters.equipements.length > 0 || filters.nearMe ||
        Boolean(filters.dateDebut) || Boolean(filters.dateFin);

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

            {/* ── Mobile bottom sheet (composant partagé avec MobileSearchBar) ── */}
            <MobileFilterSheet
                open={isMobileOpen}
                onClose={onCloseMobile}
                filters={filters}
                onChange={onChange}
                onReset={onReset}
                ctaLabel={`Voir ${filteredCount} résultat${filteredCount !== 1 ? 's' : ''}`}
                onSubmit={onCloseMobile}
            />
        </>
    );
}
