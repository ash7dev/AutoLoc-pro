'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Calendar, Car } from 'lucide-react';
import { OwnerReservationItem } from '../../../core/api/reservationsApi';
import { OwnerReservationCard } from './OwnerReservationCard';

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

export const OwnerReservationsList: React.FC<OwnerReservationsListProps> = ({
  reservations,
  isLoading = false,
  selectedStatus = 'ALL',
  searchQuery = '',
}) => {
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence initial={false}>
        {filteredList.map((item) => (
          <OwnerReservationCard key={item.id} reservation={item} />
        ))}
      </AnimatePresence>
    </div>
  );
};