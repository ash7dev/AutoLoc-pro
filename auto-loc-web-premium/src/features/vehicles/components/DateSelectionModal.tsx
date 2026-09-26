'use client';

import React from 'react';
import { X, Calendar, Check, ShieldAlert } from 'lucide-react';
import { AutoCalendar } from '@/src/shared/components/AutoCalendar';

interface DateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string;
  startDate?: string;
  endDate?: string;
  onSelectDates: (start: string, end?: string) => void;
  joursMinimum?: number;
}

export function DateSelectionModal({
  isOpen,
  onClose,
  vehicleId,
  startDate,
  endDate,
  onSelectDates,
  joursMinimum = 1,
}: DateSelectionModalProps) {
  if (!isOpen) return null;

  const daysCount = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-main text-champagne flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 
                className="text-lg font-normal text-brand-dark font-fraunces tracking-tight"
              >
                Choisir vos dates de location
              </h3>
              <p className="text-xs text-slate-500">
                Durée minimum requise : {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps Modale : Calendrier */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Les dates barrées en rouge sont déjà réservées ou indisponibles. Sélectionner vos dates de départ et de retour.
            </span>
          </div>

          <AutoCalendar
            vehicleId={vehicleId}
            startDate={startDate}
            endDate={endDate}
            onSelectDates={onSelectDates}
          />

          {/* Récapitulatif Sélection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Période choisie :</span>
              <span className="font-bold text-slate-900 text-sm">
                {startDate && endDate ? (
                  `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`
                ) : startDate ? (
                  `À partir du ${new Date(startDate).toLocaleDateString('fr-FR')} (choisir date de fin)`
                ) : (
                  'Aucune date sélectionnée'
                )}
              </span>
            </div>

            {daysCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-brand-main text-champagne font-bold text-xs">
                {daysCount} jour{daysCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Footer Modale */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={!startDate}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-main hover:bg-forest-700 disabled:opacity-50 text-champagne font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Valider la période</span>
          </button>
        </div>
      </div>
    </div>
  );
}
