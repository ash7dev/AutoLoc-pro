'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Calendar as CalendarIcon, MapPin, Car, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

export interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialZone?: string;
  initialType?: string;
  initialDateDebut?: string;
  initialDateFin?: string;
}

const ZONES = [
  { value: '', label: 'Toutes les zones' },
  { value: 'dakar', label: 'Dakar' },
  { value: 'thies', label: 'Thiès' },
  { value: 'saly', label: 'Saly / Mbour' },
  { value: 'saint-louis', label: 'Saint-Louis' },
  { value: 'ziguinchor', label: 'Ziguinchor' },
];

const TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'SUV', label: 'SUV & 4×4' },
  { value: 'BERLINE', label: 'Berlines' },
  { value: 'LUXE', label: 'Luxe & VIP' },
  { value: 'PICKUP', label: 'Pick-ups' },
  { value: 'CITADINE', label: 'Citadines' },
];

export function MobileSearchModal({
  isOpen,
  onClose,
  initialZone = '',
  initialType = '',
  initialDateDebut,
  initialDateFin,
}: MobileSearchModalProps): React.ReactElement | null {
  const router = useRouter();

  const [zone, setZone] = useState(initialZone);
  const [type, setType] = useState(initialType);
  const [dateDebut, setDateDebut] = useState<string | undefined>(initialDateDebut);
  const [dateFin, setDateFin] = useState<string | undefined>(initialDateFin);
  const [activeStep, setActiveStep] = useState<'zone' | 'dates' | 'type'>('dates');

  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const debutDate = dateDebut ? new Date(dateDebut + 'T00:00:00') : undefined;
  const finDate = dateFin ? new Date(dateFin + 'T00:00:00') : undefined;

  // Calcul de la durée de location en jours
  const durationDays = debutDate && finDate
    ? Math.max(1, Math.round((finDate.getTime() - debutDate.getTime()) / (1000 * 3600 * 24)))
    : null;

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    const iso = date.toISOString().split('T')[0];

    if (!dateDebut || (dateDebut && dateFin)) {
      setDateDebut(iso);
      setDateFin(undefined);
    } else if (dateDebut && !dateFin) {
      if (date < new Date(dateDebut + 'T00:00:00')) {
        setDateDebut(iso);
        setDateFin(undefined);
      } else {
        setDateFin(iso);
      }
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (zone) params.set('zone', zone);
    if (type) params.set('type', type);
    if (dateDebut) params.set('debut', dateDebut);
    if (dateFin) params.set('fin', dateFin);

    onClose();
    router.push(`/explorer?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Modal Container */}
      <div className="relative w-full max-h-[90vh] bg-white rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10">
        
        {/* Drag Handle & Header */}
        <div className="p-4 pb-2 text-center border-b border-slate-100 relative shrink-0">
          <div className="w-12 h-1 rounded-full bg-slate-200 mx-auto mb-3" />
          <h3 className="text-[20px] font-bold text-slate-900 font-editorial tracking-tight">
            Rechercher un véhicule
          </h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Sénégal · Dakar, Thiès, Saly, Saint-Louis
          </p>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Étape 1 : Destination / Ville */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Destination / Ville
            </label>
            <div className="flex flex-wrap gap-2">
              {ZONES.map((z) => {
                const isSelected = zone === z.value;
                return (
                  <button
                    key={z.value}
                    type="button"
                    onClick={() => setZone(z.value)}
                    className={cn(
                      'px-3.5 py-2 rounded-2xl text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1.5',
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/60'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />}
                    {z.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Étape 2 : Dates de location */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-emerald-600" />
                Dates de location
              </label>
              {durationDays && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100">
                  {durationDays} jour{durationDays > 1 ? 's' : ''} de location
                </span>
              )}
            </div>

            {/* Display Start & End Date summary */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Date de départ</p>
                <p className="text-[13px] font-bold text-slate-900 mt-0.5">
                  {debutDate ? debutDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Sélectionner'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60">
                <p className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Date d'arrivée</p>
                <p className="text-[13px] font-bold text-slate-900 mt-0.5">
                  {finDate ? finDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Sélectionner'}
                </p>
              </div>
            </div>

            {/* Interactive Calendar */}
            <div className="flex justify-center bg-white rounded-2xl border border-slate-100 p-2 shadow-sm">
              <Calendar
                mode="single"
                selected={finDate || debutDate}
                onSelect={handleSelectDate}
                disabled={(d) => d < today}
                initialFocus
              />
            </div>
          </div>

          {/* Étape 3 : Catégorie de véhicule */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-emerald-600" />
              Catégorie de véhicule
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => {
                const isSelected = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      'px-3.5 py-2 rounded-2xl text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1.5',
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/60'
                    )}
                  >
                    {isSelected && <Sparkles className="h-3 w-3 text-amber-400" />}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Search Button */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 text-emerald-400 text-[15px] font-extrabold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={2.5} />
            Voir les véhicules disponibles
          </button>
        </div>

      </div>
    </div>
  );
}
