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

const FIELD_CLASS = 'w-full px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[12.5px] font-bold text-slate-800 focus:outline-none focus:border-emerald-500';

interface SheetDateFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minDate?: Date;
}

function SheetDateField({ label, value, onChange, minDate }: SheetDateFieldProps) {
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
          className="w-full text-left px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[12.5px] font-bold flex items-center justify-between"
        >
          <span className={selected ? 'text-slate-800' : 'text-slate-400'}>{display}</span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [q, setQ] = useState('');
  const [zone, setZone] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayDebut = debut
    ? new Date(debut + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'Départ';

  const displayFin = fin
    ? new Date(fin + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : 'Retour';

  const selectedZoneLabel = ZONES_DAKAR.find(z => z.value === zone)?.label || 'Où allez-vous ?';

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
    <div className="w-full px-4 pt-4 pb-2">
      <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex items-center bg-white rounded-2xl border border-slate-100/80',
              'shadow-[0_4px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.08)]',
              'text-left cursor-pointer transition-all active:scale-[0.98] p-2 gap-1'
            )}
          >
            {/* Destination Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 flex-1 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider leading-none">Destination</p>
                <p className="text-[12.5px] font-bold text-slate-800 truncate mt-0.5 leading-tight">
                  {selectedZoneLabel === 'Où allez-vous ?' ? 'Sénégal (Dakar)' : selectedZoneLabel}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-slate-100 shrink-0" />

            {/* Dates Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 flex-1 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <CalendarIcon className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider leading-none">Planifier</p>
                <p className="text-[12.5px] font-bold text-slate-800 truncate mt-0.5 leading-tight">
                  {debut ? `${displayDebut} — ${displayFin}` : 'Ajouter des dates'}
                </p>
              </div>
            </div>

            {/* Compact search action circle */}
            <span className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 text-emerald-400">
              <Search className="h-4.5 w-4.5" strokeWidth={3} />
            </span>
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[90vh] rounded-t-[28px] px-6 pb-6 pt-4 border-t border-slate-100 bg-white flex flex-col">
          <SheetHeader className="pb-4 border-b border-slate-50 shrink-0">
            <SheetTitle className="text-[17px] font-black tracking-tight text-slate-900">
              Recherche de véhicule
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSearch} className="flex flex-col gap-5 mt-5 flex-1 overflow-y-auto pb-6">
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

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-slate-400" /> Date début
                </label>
                <SheetDateField label="Début" value={debut} onChange={setDebut} minDate={today} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-slate-400" /> Date fin
                </label>
                <SheetDateField label="Fin" value={fin} onChange={setFin} minDate={debut ? new Date(debut + 'T00:00:00') : today} />
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
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black text-[14px] font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-center flex items-center justify-center gap-2 mt-4 shrink-0"
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
