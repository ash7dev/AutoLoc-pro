'use client';

import { useState } from 'react';
import { XCircle } from 'lucide-react';
import { CancelModal } from './cancel-modal';

interface Props {
  reservationId: string;
  vehicleName?: string;
}

export function TenantCancelButton({ reservationId, vehicleName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 w-full sm:w-auto rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
      >
        <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        Annuler ma réservation
      </button>

      <CancelModal
        reservationId={reservationId}
        vehicleName={vehicleName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
