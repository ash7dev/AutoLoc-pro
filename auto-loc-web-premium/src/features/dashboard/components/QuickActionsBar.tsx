import React from 'react';
import Link from 'next/link';
import { BellRing, CarFront, Plus, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OWNER_ROUTES } from './dashboardUtils';

interface QuickActionsBarProps {
  demandesEnAttenteCount?: number;
  soldeRetirableWallet?: number;
}

const BASE =
  'group inline-flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2';
const PLAIN =
  'border-[#0A3D2E]/15 bg-white text-[#041912] hover:border-[#0A3D2E]/35 hover:bg-[#0A3D2E]/[0.03]';
const PRIMARY = 'border-[#0A3D2E] bg-[#0A3D2E] text-[#F1DFB6] hover:bg-[#0F4F3B]';

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  demandesEnAttenteCount = 0,
  soldeRetirableWallet = 0,
}) => {
  const hasDemandes = demandesEnAttenteCount > 0;

  return (
    <nav aria-label="Actions rapides">
      <ul className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <li className="shrink-0">
          <Link href={OWNER_ROUTES.reservations} className={`${BASE} ${hasDemandes ? PRIMARY : PLAIN}`}>
            <BellRing className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {hasDemandes ? 'Demandes à traiter' : 'Réservations'}
            {hasDemandes && (
              <span className="min-w-[1.5rem] rounded-full bg-[#F1DFB6] px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums text-[#041912]">
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
              <span className="rounded-full bg-[#F1DFB6] px-2 py-0.5 text-xs font-semibold tabular-nums text-[#041912]">
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
          <Link href={OWNER_ROUTES.newListing} className={`${BASE} ${PLAIN}`}>
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Créer une annonce
          </Link>
        </li>
      </ul>
    </nav>
  );
};