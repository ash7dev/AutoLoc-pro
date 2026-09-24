'use client';

import React from 'react';
import { AutoCalendar } from '@/src/shared/components/AutoCalendar';

interface VehicleAvailabilityCalendarProps {
  vehicleId: string;
  ville?: string;
  startDate?: string;
  endDate?: string;
  onSelectDates?: (start: string, end?: string) => void;
}

export function VehicleAvailabilityCalendar({
  vehicleId,
  ville = 'Dakar',
  startDate,
  endDate,
  onSelectDates = () => { },
}: VehicleAvailabilityCalendarProps) {
  return (
    <section
      id="availability-calendar"
      aria-label="Disponibilités"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div>
          <h3 className="text-lg text-[#041912] font-fraunces font-normal">Disponibilités</h3>
          <p className="mt-1 text-sm text-slate-500">
            Consultez les dates déjà réservées pour ce véhicule à {ville}.
          </p>
        </div>

        <p className="inline-flex items-center gap-2.5 text-sm text-slate-500 shrink-0 sm:pt-1.5">
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-[#0A3D2E] ring-4 ring-[#F1DFB6]/60"
          />
          Mise à jour instantanée
        </p>
      </div>

      <div className="px-5 sm:px-6 py-5 border-t border-slate-200/80">
        <div className="max-w-md mx-auto sm:max-w-none">
          <AutoCalendar
            vehicleId={vehicleId}
            startDate={startDate}
            endDate={endDate}
            onSelectDates={onSelectDates}
          />
        </div>
      </div>
    </section>
  );
}