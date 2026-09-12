'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, MapPin, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileSearchModal } from './MobileSearchModal';

export function MobileSearchBar(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const zone = searchParams.get('zone') ?? '';
  const type = searchParams.get('type') ?? '';
  const dateDebut = searchParams.get('debut') ?? undefined;
  const dateFin = searchParams.get('fin') ?? undefined;

  // Formatage propre du résumé affiché dans la pilule
  const zoneFormatted = zone
    ? zone.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Sénégal (Dakar)';

  const datesFormatted = dateDebut && dateFin
    ? `${new Date(dateDebut + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${new Date(dateFin + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
    : 'Destination · Dates · Filtres';

  return (
    <div className="w-full px-4 pt-3 pb-1">
      {/* ── Single 2026 Ultra-Luxury Mobile Search CTA Pill ── */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'flex-1 flex items-center gap-3 p-3 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80',
            'shadow-md shadow-slate-100/80 text-left active:scale-[0.98] transition-all duration-200 group'
          )}
        >
          {/* Glowing Search Badge */}
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 group-active:scale-95 transition-transform">
            <Search className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
          </div>

          {/* Text Content */}
          <div className="min-w-0 flex-1">
            <h4 className="text-[14.5px] font-bold text-slate-900 tracking-tight font-editorial leading-tight truncate">
              {zone ? zoneFormatted : 'Où & quand louer ?'}
            </h4>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 leading-none truncate flex items-center gap-1">
              {type && <span className="text-emerald-600 font-semibold">{type} · </span>}
              {datesFormatted}
            </p>
          </div>

          {/* Filter Icon Pill */}
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
          </div>
        </button>
      </div>

      {/* Bottom Sheet Search Modal */}
      <MobileSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialZone={zone}
        initialType={type}
        initialDateDebut={dateDebut}
        initialDateFin={dateFin}
      />
    </div>
  );
}
