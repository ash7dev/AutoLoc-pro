'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Car, ChevronDown, History } from 'lucide-react';
import { OwnerReservationItem } from '../../../core/api/reservationsApi';
import { OwnerReservationCard } from './OwnerReservationCard';
import { useUserStore } from '@/src/core/store/useUserStore';
import { useHostGate } from '@/src/features/owner/hooks/useHostGate';
import { ReservationGateModal } from '@/src/features/reservations/components/ReservationGateModal';

export interface OwnerReservationsListProps {
  reservations: OwnerReservationItem[];
  isLoading?: boolean;
  selectedStatus?: string;
  searchQuery?: string;
}

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'en attente',
  CONFIRMEE: 'confirmée',
  EN_COURS: 'en cours',
  TERMINEE: 'terminée',
  ANNULEE: 'annulée',
};

const IS_HISTORY_STATUS = (statut: string) => {
  const s = (statut || '').toUpperCase();
  return s === 'TERMINEE' || s === 'ANNULEE' || s === 'EXPIREE' || s === 'LITIGE';
};

export const OwnerReservationsList: React.FC<OwnerReservationsListProps> = ({
  reservations,
  isLoading = false,
  selectedStatus = 'ALL',
  searchQuery = '',
}) => {
  const router = useRouter();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const { canProceed, missingSteps, userAge } = useHostGate();
  const [gateOpen, setGateOpen] = useState(false);

  const handlePublishVehicleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!canProceed && missingSteps.length > 0) {
      setGateOpen(true);
      return;
    }
    router.push('/dashboard/vehicles/new');
  };
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const filteredList = (reservations || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const locataireName = `${item.locataire?.prenom || ''} ${item.locataire?.nom || ''}`.toLowerCase();
    const vehiculeName = `${item.vehicule?.marque || ''} ${item.vehicule?.modele || ''}`.toLowerCase();
    const ref = item.id.toLowerCase();
    return locataireName.includes(q) || vehiculeName.includes(q) || ref.includes(q);
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="h-64 animate-pulse space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs"
          >
            <div className="flex justify-between">
              <div className="h-6 w-24 rounded-full bg-slate-100" />
              <div className="h-4 w-16 rounded-md bg-slate-100" />
            </div>
            <div className="flex gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded-md bg-slate-100" />
                <div className="h-4 w-1/2 rounded-md bg-slate-100" />
              </div>
            </div>
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (filteredList.length === 0) {
    const hasActiveFilter = selectedStatus !== 'ALL' || searchQuery.trim().length > 0;

    return (
      <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-400">
          <Calendar className="h-7 w-7" />
        </div>

        <div className="mx-auto max-w-md space-y-1.5">
          <h3 className="font-fraunces text-xl font-normal text-[#041912]">
            {hasActiveFilter ? 'Aucune réservation ne correspond' : 'Aucune réservation pour le moment'}
          </h3>
          <p className="text-xs text-slate-500 sm:text-sm">
            {searchQuery.trim()
              ? `Aucun résultat pour « ${searchQuery} ».`
              : selectedStatus !== 'ALL'
                ? `Aucune réservation ${STATUS_LABELS[selectedStatus] || ''} actuellement.`
                : 'Vos demandes de location entrantes apparaîtront ici dès que des locataires effectueront des réservations.'}
          </p>
        </div>

        {!hasActiveFilter && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard/vehicles/new"
              onClick={handlePublishVehicleClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#4ADE80]/30 bg-[#041912] px-5 py-2.5 text-xs font-bold text-[#4ADE80] transition-colors hover:bg-[#0A3D2E] sm:text-sm"
            >
              <Car className="h-4 w-4" />
              <span>Publier un véhicule</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // If user selected a specific historical status (TERMINEE or ANNULEE), show directly without accordion
  if (selectedStatus === 'TERMINEE' || selectedStatus === 'ANNULEE') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {filteredList.map((item) => (
            <OwnerReservationCard key={item.id} reservation={item} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Separate active vs historical reservations
  const activeReservations = filteredList.filter((item) => !IS_HISTORY_STATUS(item.statut));
  const historyReservations = filteredList.filter((item) => IS_HISTORY_STATUS(item.statut));

  // If there are no historical reservations, just show active reservations directly
  if (historyReservations.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {activeReservations.map((item) => (
            <OwnerReservationCard key={item.id} reservation={item} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Active Reservations Section ──────────────────────────────── */}
      {activeReservations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Réservations actives & à venir ({activeReservations.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {activeReservations.map((item) => (
                <OwnerReservationCard key={item.id} reservation={item} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Accordéon Historique ─────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsHistoryOpen((prev) => !prev)}
          className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#041912]/5 text-[#0A3D2E]">
              <History className="h-5 w-5 text-[#059669]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fraunces text-base font-normal text-[#041912] sm:text-lg">
                  Historique des réservations
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {historyReservations.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Réservations terminées, annulées ou archivées
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold text-slate-500 sm:inline">
              {isHistoryOpen ? 'Masquer' : 'Afficher l’historique'}
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform duration-300 ${
                isHistoryOpen ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {historyReservations.map((item) => (
                  <OwnerReservationCard key={item.id} reservation={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ReservationGateModal
        visible={gateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => setGateOpen(false)}
        onAllCompleted={() => {
          setGateOpen(false);
          router.push('/dashboard/vehicles/new');
        }}
      />
    </div>
  );
};