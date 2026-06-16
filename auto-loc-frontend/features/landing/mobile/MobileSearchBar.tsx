'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar as CalendarIcon, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCurrency } from '@/providers/currency-provider';
import { DEFAULT_FILTERS, type ExplorerFiltersState } from '@/features/explorer/ExplorerGrid';
import { MobileFilterSheet } from '@/features/explorer/MobileFilterSheet';
import { getFilterPills } from '@/features/explorer/ExplorerActiveFilters';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minDate?: Date;
}

function DateField({ label, value, onChange, minDate }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const display = selected
    ? selected.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'Ajouter';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex-1 min-w-0 flex items-center gap-2.5 px-3 py-1.5 text-left"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CalendarIcon className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider leading-none">{label}</p>
            <p className={cn('text-[12.5px] font-bold truncate mt-0.5 leading-tight', selected ? 'text-slate-800' : 'text-slate-400')}>
              {display}
            </p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl border border-slate-100 shadow-xl z-50" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(date.toISOString().split('T')[0]);
              setOpen(false);
            }
          }}
          disabled={(date) => !!minDate && date < minDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function MobileSearchBar(): React.ReactElement {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [filters, setFilters] = useState<ExplorerFiltersState>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canSearch = Boolean(filters.dateDebut && filters.dateFin);
  const activeFilterCount = getFilterPills(filters, formatPrice).length;

  function buildExplorerUrl(): string {
    const params = new URLSearchParams();
    if (filters.dateDebut) params.set('debut', filters.dateDebut);
    if (filters.dateFin) params.set('fin', filters.dateFin);
    if (filters.zone) params.set('zone', filters.zone);
    if (filters.type) params.set('type', filters.type);
    if (filters.budgetMin != null) params.set('budgetMin', String(filters.budgetMin));
    if (filters.budgetMax != null) params.set('budget', String(filters.budgetMax));
    if (filters.fuel) params.set('fuel', filters.fuel);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.places != null) params.set('places', String(filters.places));
    if (filters.noteMin != null) params.set('noteMin', String(filters.noteMin));
    filters.equipements.forEach((e) => params.append('equipements', e));
    if (filters.nearMe) params.set('nearMe', '1');
    return `/explorer?${params.toString()}`;
  }

  function handleSearch() {
    if (!canSearch) return;
    router.push(buildExplorerUrl());
  }

  function handleFilterSubmit() {
    setIsFilterOpen(false);
    router.push(buildExplorerUrl());
  }

  return (
    <div className="w-full px-4 pt-4 pb-2">
      <div className="flex items-stretch gap-2">
        {/* Dates */}
        <div
          className={cn(
            'flex-1 flex items-center bg-white rounded-2xl border border-slate-100/80',
            'shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-2 gap-1'
          )}
        >
          <DateField
            label="Départ"
            value={filters.dateDebut ?? ''}
            onChange={(iso) => setFilters((f) => ({ ...f, dateDebut: iso }))}
            minDate={today}
          />
          <div className="w-px h-8 bg-slate-100 shrink-0" />
          <DateField
            label="Arrivée"
            value={filters.dateFin ?? ''}
            onChange={(iso) => setFilters((f) => ({ ...f, dateFin: iso }))}
            minDate={filters.dateDebut ? new Date(filters.dateDebut + 'T00:00:00') : today}
          />
        </div>

        {/* Filtre — indépendant des dates, ouvre le même sheet que /explorer */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="relative w-[52px] shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] active:scale-[0.96] transition-all"
        >
          <SlidersHorizontal className="h-4.5 w-4.5 text-slate-600" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Visible uniquement quand les deux dates sont renseignées */}
      {canSearch && (
        <button
          type="button"
          onClick={handleSearch}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-950 text-emerald-400 text-[13px] font-bold py-3.5 rounded-2xl active:scale-[0.98] transition-all"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          Rechercher
        </button>
      )}

      <MobileFilterSheet
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        ctaLabel="Rechercher"
        onSubmit={handleFilterSubmit}
      />
    </div>
  );
}
