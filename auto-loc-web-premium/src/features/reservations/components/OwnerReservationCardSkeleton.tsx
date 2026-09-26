'use client';

import React from 'react';

/**
 * Skeleton de chargement pour les cartes de réservations Hôte.
 * Reproduit la disposition responsive exacte de OwnerReservationCard avec animation pulse (0 spinner).
 */
export const OwnerReservationCardSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-6 sm:rounded-[28px] animate-pulse shadow-xs"
    >
      {/* Vue Mobile Skeleton */}
      <div className="flex items-center gap-3 sm:hidden">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-brand-main/[0.08]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded-lg bg-brand-main/[0.08]" />
          <div className="h-3 w-24 rounded-md bg-brand-main/[0.05]" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-4 w-20 rounded-full bg-brand-main/[0.06]" />
            <div className="h-4 w-16 rounded-md bg-brand-main/[0.08]" />
          </div>
        </div>
      </div>

      {/* Vue Desktop Skeleton */}
      <div className="hidden flex-col justify-between sm:flex">
        {/* Top: Statut & Réf */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 rounded-full bg-brand-main/[0.08]" />
          <div className="h-3 w-20 rounded-md bg-brand-main/[0.05]" />
        </div>

        {/* Middle: Photo Véhicule & Titre */}
        <div className="mt-4 flex items-start gap-4">
          <div className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-brand-main/[0.08]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-6 w-48 rounded-xl bg-brand-main/[0.08]" />
            <div className="h-4 w-24 rounded-md bg-brand-main/[0.05]" />
          </div>
        </div>

        {/* Locataire & Dates */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-main/[0.08]" />
            <div className="space-y-1">
              <div className="h-2.5 w-12 rounded bg-brand-main/[0.05]" />
              <div className="h-3.5 w-24 rounded bg-brand-main/[0.08]" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-main/[0.08]" />
            <div className="space-y-1">
              <div className="h-2.5 w-12 rounded bg-brand-main/[0.05]" />
              <div className="h-3.5 w-28 rounded bg-brand-main/[0.08]" />
            </div>
          </div>
        </div>

        {/* Bottom: Prix Net & Bouton Gérer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="space-y-1">
            <div className="h-2.5 w-20 rounded bg-brand-main/[0.05]" />
            <div className="h-6 w-32 rounded-lg bg-brand-main/[0.08]" />
          </div>
          <div className="h-10 w-28 rounded-2xl bg-brand-main/[0.1]" />
        </div>
      </div>
    </div>
  );
};
