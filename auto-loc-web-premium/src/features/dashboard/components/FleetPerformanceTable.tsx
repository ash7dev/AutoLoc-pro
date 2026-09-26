'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Star } from 'lucide-react';
import { DashboardCard, EmptyState, Skeleton } from './DashboardCard';
import { OWNER_ROUTES, clamp, decimal1, fcfa, toNumber, type Amount } from './dashboardUtils';
import { useUserStore } from '@/src/core/store/useUserStore';
import { useHostGate } from '@/src/features/owner/hooks/useHostGate';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';

/**
 * Champs attendus pour chaque véhicule de GET /analytics/owner/fleet-performance.
 * Le nom est lu dans `nom`, `titre` ou `marque` + `modele`.
 */
export interface FleetVehicle {
  id?: string;
  vehiculeId?: string;
  nom?: string;
  titre?: string;
  marque?: string;
  modele?: string;
  photoUrl?: string | null;
  caNet?: Amount;
  tauxOccupation?: Amount;
  vues?: Amount;
  clics?: Amount;
  vues30j?: Amount;
  clics30j?: Amount;
  tauxConversion?: Amount;
  noteMoyenne?: Amount;
}

interface FleetPerformanceTableProps {
  vehicles?: FleetVehicle[];
  isLoading?: boolean;
}

const MAX_ROWS = 6;
const GRID =
  'md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,0.6fr)] md:items-center md:gap-6';

const integer = new Intl.NumberFormat('fr-FR');

export const FleetPerformanceTable: React.FC<FleetPerformanceTableProps> = ({
  vehicles,
  isLoading = false,
}) => {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { canProceed, missingSteps, userAge } = useHostGate();
  const [gateOpen, setGateOpen] = useState(false);

  const handleCreateListingClick = (e: React.MouseEvent) => {
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

  const rows = useMemo(
    () =>
      (vehicles ?? [])
        .map((v, i) => {
          const name =
            v.nom ?? v.titre ?? ([v.marque, v.modele].filter(Boolean).join(' ') || 'Véhicule');
          return {
            key: v.id ?? v.vehiculeId ?? `${name}-${i}`,
            name,
            photoUrl: v.photoUrl,
            caNet: toNumber(v.caNet),
            occupation: clamp(toNumber(v.tauxOccupation), 0, 100),
            vues: toNumber(v.vues ?? v.vues30j),
            clics: toNumber(v.clics ?? v.clics30j),
            conversion: toNumber(v.tauxConversion),
            note: toNumber(v.noteMoyenne),
          };
        })
        .sort((a, b) => b.caNet - a.caNet),
    [vehicles],
  );

  const visible = rows.slice(0, MAX_ROWS);

  return (
    <>
      <DashboardCard
        title="Performance de la flotte"
        description="Classement de vos véhicules par revenu net"
        className="h-full"
        action={
          rows.length > 0 ? (
            <Link
              href={OWNER_ROUTES.fleet}
              className="rounded-md text-sm font-medium text-brand-main underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
            >
              Voir la flotte
            </Link>
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Aucun véhicule pour le moment"
            text="Ajoutez votre premier véhicule pour suivre ses revenus et son taux d’occupation."
            action={
              <Link
                href={OWNER_ROUTES.newListing}
                onClick={handleCreateListingClick}
                className="rounded-full bg-brand-main px-5 py-2.5 text-sm font-semibold text-champagne transition-colors hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
              >
                Créer une annonce
              </Link>
            }
          />
        ) : (
          <div>
            {/* En-tête de colonnes (desktop) */}
            <div
              aria-hidden="true"
              className={`hidden border-b border-brand-main/10 pb-3 text-xs text-slate-500 ${GRID}`}
            >
              <span>Véhicule</span>
              <span>Revenu net</span>
              <span>Occupation</span>
              <span>Audience</span>
              <span className="text-right">Note</span>
            </div>

            <ul className="divide-y divide-[#0A3D2E]/10">
              {visible.map((v, i) => (
                <li key={v.key} className={`flex flex-col gap-4 py-4 ${GRID}`}>
                  {/* Véhicule */}
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      aria-label={`Rang ${i + 1}`}
                      className="w-5 shrink-0 text-center font-display text-lg tabular-nums text-brand-main/50"
                    >
                      {i + 1}
                    </span>
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-champagne/40 text-brand-main">
                      {v.photoUrl ? (
                        <Image src={v.photoUrl} alt="" width={48} height={48} unoptimized className="h-12 w-12 object-cover" />
                      ) : (
                        <Car className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      )}
                    </span>
                    <p className="min-w-0 truncate font-medium text-brand-dark">{v.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:contents">
                    {/* Revenu net */}
                    <div>
                      <p className="text-xs text-slate-500 md:hidden">Revenu net</p>
                      <p className="font-display text-lg tabular-nums text-brand-dark">{fcfa(v.caNet)}</p>
                    </div>

                    {/* Occupation */}
                    <div>
                      <p className="text-xs text-slate-500 md:hidden">Occupation</p>
                      <div className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-main/10">
                          <span className="block h-full rounded-full bg-brand-main" style={{ width: `${v.occupation}%` }} />
                        </span>
                        <span className="w-10 text-right text-sm font-medium tabular-nums text-brand-dark">
                          {Math.round(v.occupation)}&nbsp;%
                        </span>
                      </div>
                    </div>

                    {/* Audience */}
                    <div>
                      <p className="text-xs text-slate-500 md:hidden">Audience</p>
                      <p className="text-sm tabular-nums text-brand-dark">
                        {integer.format(v.vues)} vues, {integer.format(v.clics)} clics
                      </p>
                      <p className="text-xs tabular-nums text-slate-500">
                        Conversion {decimal1.format(v.conversion)}&nbsp;%
                      </p>
                    </div>

                    {/* Note */}
                    <div className="md:text-right">
                      <p className="text-xs text-slate-500 md:hidden">Note</p>
                      {v.note > 0 ? (
                        <p className="inline-flex items-center gap-1 text-sm font-medium tabular-nums text-brand-dark">
                          <Star className="h-3.5 w-3.5 fill-[#C79A3B] text-[#C79A3B]" aria-hidden="true" />
                          {decimal1.format(v.note)}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">Pas encore de note</span>
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {rows.length > MAX_ROWS && (
              <p className="mt-4 text-sm text-slate-500">
                {rows.length - MAX_ROWS} autre{rows.length - MAX_ROWS > 1 ? 's' : ''} véhicule
                {rows.length - MAX_ROWS > 1 ? 's' : ''} dans{' '}
                <Link
                  href={OWNER_ROUTES.fleet}
                  className="font-medium text-brand-main underline underline-offset-4"
                >
                  votre flotte
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </DashboardCard>

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