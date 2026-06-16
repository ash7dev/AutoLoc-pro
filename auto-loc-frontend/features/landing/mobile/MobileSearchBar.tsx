'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar as CalendarIcon, MapPin, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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

export function MobileSearchBar(): React.ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [zone, setZone] = useState('');
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
    if (zone) params.set('zone', zone);
    if (debut) params.set('debut', debut);
    if (fin) params.set('fin', fin);
    setIsOpen(false);
    router.push(`/explorer?${params.toString()}`);
  }

  return (
    <div className="w-full px-4 pt-4 pb-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'w-full flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-100',
              'shadow-md shadow-slate-200/50 text-left cursor-pointer transition-all active:scale-[0.98]'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Search className="h-4.5 w-4.5 text-emerald-600" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                  {selectedZoneLabel === 'Où allez-vous ?' ? 'Rechercher une zone...' : selectedZoneLabel}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-none">
                  {debut ? `${displayDebut} — ${displayFin}` : 'Ajouter des dates'}
                </p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
          </button>
        </SheetTrigger>

        <SheetContent side="bottom" className="h-[85vh] rounded-t-[28px] px-6 pb-6 pt-4 border-t border-slate-100 bg-white">
          <SheetHeader className="pb-4 border-b border-slate-50">
            <SheetTitle className="text-[17px] font-black tracking-tight text-slate-900">
              Votre recherche
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSearch} className="flex flex-col gap-5 mt-5 h-[calc(100%-80px)]">
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

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-slate-400" /> Début
                </label>
                <input
                  type="date"
                  value={debut}
                  min={today.toISOString().split('T')[0]}
                  onChange={(e) => setDebut(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[12.5px] font-bold text-slate-800 appearance-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-slate-400" /> Fin
                </label>
                <input
                  type="date"
                  value={fin}
                  min={debut || today.toISOString().split('T')[0]}
                  onChange={(e) => setFin(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-[12.5px] font-bold text-slate-800 appearance-none"
                />
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <button
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black text-[14px] font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-center flex items-center justify-center gap-2"
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
