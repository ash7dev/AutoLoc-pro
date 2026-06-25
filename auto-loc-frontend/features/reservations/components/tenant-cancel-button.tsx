'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Info } from 'lucide-react';
import { CancelConfirmationModal } from './cancel-confirmation-modal';
import { LifecycleModal } from './lifecycle-modal';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { translateError } from '@/lib/utils/api-error-fr';

interface Props {
  reservationId: string;
  vehicleName?: string;
  statut?: string;
  dateDebut?: string;
  totalLocataire?: number;
  totalBase?: number;
}

export function TenantCancelButton({ reservationId, vehicleName, statut, dateDebut, totalLocataire, totalBase }: Props) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [open, setOpen] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm(raison: string) {
    setLoading(true);
    try {
      await authFetch(`/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
        body: { raison: raison.trim() },
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      throw err; // Let the modal handle the error display
    } finally {
      setLoading(false);
    }
  }

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
          Comprendre les règles &amp; conditions (séquestre, auto-checkin…)
        </button>
      </div>

      <CancelConfirmationModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        statut={statut ?? ''}
        dateDebut={dateDebut}
        totalLocataire={totalLocataire}
        totalBase={totalBase}
        isOwner={false}
      />

      <LifecycleModal
        open={lifecycleOpen}
        onClose={() => setLifecycleOpen(false)}
        role="TENANT"
      />
    </>
  );
}
