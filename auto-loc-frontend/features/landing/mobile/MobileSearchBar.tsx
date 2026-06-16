'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canSearch = Boolean(debut && fin);

  function handleSearch() {
    if (!canSearch) return;
    const params = new URLSearchParams();
    params.set('debut', debut);
    params.set('fin', fin);
    router.push(`/explorer?${params.toString()}`);
  }

  return (
    <div className="w-full px-4 pt-4 pb-2">
      <div
        className={cn(
          'w-full flex items-center bg-white rounded-2xl border border-slate-100/80',
          'shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-2 gap-1'
        )}
      >
        <DateField label="Départ" value={debut} onChange={setDebut} minDate={today} />
        <div className="w-px h-8 bg-slate-100 shrink-0" />
        <DateField
          label="Arrivée"
          value={fin}
          onChange={setFin}
          minDate={debut ? new Date(debut + 'T00:00:00') : today}
        />
      </div>

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
    </div>
  );
}
