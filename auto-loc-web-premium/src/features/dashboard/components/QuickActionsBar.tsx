'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellRing, CarFront, Plus, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OWNER_ROUTES } from './dashboardUtils';
import { useUserStore } from '@/src/core/store/useUserStore';
import { useHostGate } from '@/src/features/owner/hooks/useHostGate';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';

interface QuickActionsBarProps {
  demandesEnAttenteCount?: number;
  soldeRetirableWallet?: number;
}

const BASE =
  'group inline-flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2';
const PLAIN =
  'border-brand-main/15 bg-white text-brand-dark hover:border-brand-main/35 hover:bg-brand-main/[0.03]';
const PRIMARY = 'border-brand-main bg-brand-main text-champagne hover:bg-forest-700';

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  demandesEnAttenteCount = 0,
  soldeRetirableWallet = 0,
}) => {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { canProceed, missingSteps, userAge } = useHostGate();
  const [gateOpen, setGateOpen] = useState(false);

  const hasDemandes = demandesEnAttenteCount > 0;

  const handleNewListingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!canProceed && missingSteps.length > 0) {
      setGateOpen(true);
      return;
    }
    router.push(OWNER_ROUTES.newListing);
  };

  return (
    <>
      <nav aria-label="Actions rapides">
        <ul className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          <li className="shrink-0">
            <Link href={OWNER_ROUTES.reservations} className={`${BASE} ${hasDemandes ? PRIMARY : PLAIN}`}>
              <BellRing className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {hasDemandes ? 'Demandes à traiter' : 'Réservations'}
              {hasDemandes && (
                <span className="min-w-[1.5rem] rounded-full bg-champagne px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums text-brand-dark">
                  {demandesEnAttenteCount}
                </span>
              )}
            </Link>
          </li>

          <li className="shrink-0">
            <Link
              href={OWNER_ROUTES.wallet}
              className={`${BASE} ${soldeRetirableWallet > 0 ? PRIMARY : PLAIN}`}
            >
              <Wallet className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Retirer mes gains
              {soldeRetirableWallet > 0 && (
                <span className="rounded-full bg-champagne px-2 py-0.5 text-xs font-semibold tabular-nums text-brand-dark">
                  {formatCurrency(soldeRetirableWallet)} FCFA
                </span>
              )}
            </Link>
          </li>

          <li className="shrink-0">
            <Link href={OWNER_ROUTES.fleet} className={`${BASE} ${PLAIN}`}>
              <CarFront className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Ma flotte
            </Link>
          </li>

          <li className="shrink-0">
            <Link
              href={OWNER_ROUTES.newListing}
              onClick={handleNewListingClick}
              className={`${BASE} ${PLAIN}`}
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Créer une annonce
            </Link>
          </li>
        </ul>
      </nav>

      <ReservationGateModal
        visible={gateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => setGateOpen(false)}
        onAllCompleted={() => {
          setGateOpen(false);
          router.push(OWNER_ROUTES.newListing);
        }}
      />
    </>
  );
};