'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExplorerFiltersState } from './ExplorerGrid';
import { useCurrency } from '@/providers/currency-provider';
import {
    ZONES, VEHICLE_TYPES, FUEL_TYPES, TRANSMISSIONS,
    BUDGET_PRESETS, SORT_OPTIONS, EQUIPMENTS,
} from './ExplorerFilters';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFilterPills(filters: ExplorerFiltersState, currencyFormat: (n: number) => string) {
    const pills: { key: string; label: string; field: keyof ExplorerFiltersState; resetValue: any }[] = [];

    if (filters.zone) {
        pills.push({
            key: 'zone',
            label: ZONES.find((z) => z.value === filters.zone)?.label ?? filters.zone,
            field: 'zone',
            resetValue: '',
        });
    }
    if (filters.type) {
        pills.push({
            key: 'type',
            label: VEHICLE_TYPES.find((t) => t.value === filters.type)?.label ?? filters.type,
            field: 'type',
            resetValue: '',
        });
    }
    if (filters.budgetMin !== null) {
        pills.push({
            key: 'budgetMin',
            label: `≥ ${currencyFormat(filters.budgetMin)}`,
            field: 'budgetMin',
            resetValue: null,
        });
    }
    if (filters.budgetMax !== null) {
        pills.push({
            key: 'budget',
            label: `≤ ${currencyFormat(filters.budgetMax!)}`,
            field: 'budgetMax',
            resetValue: null,
        });
    }
    if (filters.fuel) {
        pills.push({
            key: 'fuel',
            label: FUEL_TYPES.find((f) => f.value === filters.fuel)?.label ?? filters.fuel,
            field: 'fuel',
            resetValue: '',
        });
    }
    if (filters.transmission) {
        pills.push({
            key: 'transmission',
            label: TRANSMISSIONS.find((t) => t.value === filters.transmission)?.label ?? filters.transmission,
            field: 'transmission',
            resetValue: '',
        });
    }
    if (filters.places) {
        pills.push({
            key: 'places',
            label: `${filters.places}+ places`,
            field: 'places',
            resetValue: null,
        });
    }
    if (filters.noteMin) {
        pills.push({
            key: 'noteMin',
            label: `★ ${filters.noteMin}+`,
            field: 'noteMin',
            resetValue: null,
        });
    }
    if (filters.equipements.length > 0) {
        for (const eq of filters.equipements) {
            pills.push({
                key: `eq-${eq}`,
                label: EQUIPMENTS.find((e) => e.value === eq)?.label ?? eq,
                field: 'equipements',
                resetValue: filters.equipements.filter((e) => e !== eq),
            });
        }
    }
    if (filters.nearMe) {
        pills.push({
            key: 'nearMe',
            label: '📍 Autour de moi',
            field: 'nearMe',
            resetValue: false,
        });
    }

    return pills;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ExplorerActiveFiltersProps {
    filters: ExplorerFiltersState;
    onChange: (filters: ExplorerFiltersState) => void;
    onClearAll: () => void;
}

export function ExplorerActiveFilters({
    filters,
    onChange,
    onClearAll,
}: ExplorerActiveFiltersProps): React.ReactElement | null {
    const { formatPrice } = useCurrency();
    const pills = getFilterPills(filters, formatPrice);

    if (pills.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {pills.map((pill) => (
                <button
                    key={pill.key}
                    type="button"
                    onClick={() => onChange({ ...filters, [pill.field]: pill.resetValue } as ExplorerFiltersState)}
                    className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                        'bg-black border border-emerald-400/20 text-[12px] font-semibold text-emerald-400',
                        'hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400',
                        'transition-all duration-200 group',
                    )}
                >
                    {pill.label}
                    <X className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                </button>
            ))}

            <button
                type="button"
                onClick={onClearAll}
                className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                    'text-[12px] font-semibold text-black/40',
                    'hover:text-red-500 transition-colors duration-200',
                )}
            >
                <RotateCcw className="h-3 w-3" strokeWidth={2} />
                Tout effacer
            </button>
        </div>
    );
}

export { getFilterPills };
