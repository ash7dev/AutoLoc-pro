'use client';

import { useState } from 'react';
import { XCircle, Info } from 'lucide-react';
import { CancelModal } from './cancel-modal';
import { LifecycleModal } from './lifecycle-modal';

interface Props {
  reservationId: string;
  vehicleName?: string;
  statut?: string;
}

export function TenantCancelButton({ reservationId, vehicleName, statut }: Props) {
  const [open, setOpen] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
        >
          <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
          Annuler ma réservation
        </button>

        <button
          type="button"
          onClick={() => setLifecycleOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 hover:text-slate-800 transition-colors underline decoration-dotted underline-offset-4 self-start"
        >
          <Info className="w-3.5 h-3.5" />
          Comprendre les règles & conditions (séquestre, auto-checkin…)
        </button>
      </div>

      <CancelModal
        reservationId={reservationId}
        vehicleName={vehicleName}
        statut={statut}
        open={open}
        onClose={() => setOpen(false)}
      />

      <LifecycleModal
        open={lifecycleOpen}
        onClose={() => setLifecycleOpen(false)}
        role="TENANT"
      />
    </>
  );
}

