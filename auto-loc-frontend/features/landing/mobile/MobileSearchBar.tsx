'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar as CalendarIcon, MapPin, SlidersHorizontal, Car, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/providers/currency-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const ZONES_DAKAR = [
  { value: '', label: 'Toutes les zones' },
  { value: 'almadies-ngor-mamelles', label: 'Almadies – Ngor – Mamelles' },
  { value: 'ouakam-yoff', label: 'Ouakam – Yoff' },
  { value: 'mermoz-sacrecoeur-ckg', label: 'Mermoz – Cité Keur Gorgui' },
  { value: 'plateau-medina-gueuletapee', label: 'Plateau – Médina' },
  { value: 'liberte-sicap-granddakar', label: 'Liberté – Sicap' },
  { value: 'parcelles-grandyoff', label: 'Parcelles – Grand Yoff' },
  { value: 'pikine-guediawaye', label: 'Pikine – Guédiawaye' },
  { value: 'keurmassar-rufisque', label: 'Keur Massar – Rufisque' },
];

const TYPES_VEHICULES = [
  { value: '', label: 'Tous les types' },
  { value: 'CITADINE', label: 'Citadine' },
  { value: 'BERLINE', label: 'Berline' },
  { value: 'SUV', label: 'SUV' },
  { value: 'PICKUP', label: 'Pick-up' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'MONOSPACE', label: 'Monospace' },
  { value: 'MINIBUS', label: 'Minibus' },
  { value: 'UTILITAIRE', label: 'Utilitaire' },
  { value: 'LUXE', label: 'Luxe' },
  { value: 'FOUR_X_FOUR', label: '4x4' },
];

const PRIX_MAX_OPTIONS = [
  { value: '', cfaAmount: 25000, prefix: 'À partir de' },
  { value: '30000', cfaAmount: 30000, prefix: "Jusqu'à" },
  { value: '50000', cfaAmount: 50000, prefix: "Jusqu'à" },
  { value: '75000', cfaAmount: 75000, prefix: "Jusqu'à" },
  { value: '100000', cfaAmount: 100000, prefix: "Jusqu'à" },
];

const FIELD_CLASS = 'w-full px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[12.5px] font-bold text-slate-800';

// ─── Champ de date avec calendrier dédié ───────────────────────────────────
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
          className="flex-1 min-w-0 flex flex-col items-start gap-0.5 px-4 py-3 text-left active:bg-slate-50 transition-colors"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <CalendarIcon className="h-2.5 w-2.5" /> {label}
          </span>
          <span className={cn('text-[13px] font-bold leading-tight', selected ? 'text-slate-800' : 'text-slate-400')}>
            {display}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-2xl border border-slate-100 shadow-xl z-50"
        align="start"
        sideOffset={8}
      >
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [q, setQ] = useState('');
  const [zone, setZone] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeFiltersCount = [zone, type, budget].filter(Boolean).length;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (zone) params.set('zone', zone);
    if (type) params.set('type', type);
    if (budget) params.set('budget', budget);
    if (debut) params.set('debut', debut);
    if (fin) params.set('fin', fin);
    setIsFiltersOpen(false);
    router.push(`/explorer?${params.toString()}`);
  }

  return (
    <div className="w-full flex items-stretch gap-2 px-4 pt-4 pb-2">
      {/* Dates — accessibles directement, chacune ouvre son propre calendrier */}
      <div className="flex-1 flex items-stretch bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 divide-x divide-slate-100 overflow-hidden">
        <DateField label="Départ" value={debut} onChange={setDebut} minDate={today} />
        <DateField
          label="Arrivée"
          value={fin}
          onChange={setFin}
          minDate={debut ? new Date(debut + 'T00:00:00') : today}
        />
      </div>

      {/* Filtres — Zone, Type, Budget, Recherche */}
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="relative w-[52px] shrink-0 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 active:scale-[0.96] transition-all"
          >
            <SlidersHorizontal className="h-4.5 w-4.5 text-slate-600" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] rounded-t-[28px] px-6 pb-6 pt-4 border-t border-slate-100 bg-white flex flex-col">
          <SheetHeader className="pb-4 border-b border-slate-50 shrink-0">
            <SheetTitle className="text-[17px] font-black tracking-tight text-slate-900">
              Filtres de recherche
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSearch} className="flex flex-col gap-5 mt-5 flex-1 overflow-y-auto pb-2">
            {/* Free text search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Search className="h-3 w-3 text-slate-400" /> Recherche libre
              </label>
              <input
                type="text"
                placeholder="Berline, SUV, Toyota Prado..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            {/* Zone Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> Destination
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {ZONES_DAKAR.map((z) => (
                  <button
                    key={z.value}
                    type="button"
                    onClick={() => setZone(z.value)}
                    className={cn(
                      'text-left px-3 py-2 text-[12px] font-semibold rounded-xl border transition-all truncate',
                      zone === z.value
                        ? 'bg-black text-emerald-400 border-black'
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {z.label === 'Toutes les zones' ? 'Partout' : z.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Car className="h-3 w-3 text-slate-400" /> Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={FIELD_CLASS}
                >
                  {TYPES_VEHICULES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-400" /> Budget / jour
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={FIELD_CLASS}
                >
                  {PRIX_MAX_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.prefix} {formatPrice(opt.cfaAmount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black text-[14px] font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-center flex items-center justify-center gap-2 mt-1"
            >
              <Search className="h-4.5 w-4.5 text-black" strokeWidth={2.5} />
              Rechercher un véhicule
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
