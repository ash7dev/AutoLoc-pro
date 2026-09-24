'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Eye, Camera, Clock, Loader2, SearchX, ChevronDown, Car, Check } from 'lucide-react';
import type { AdminReservationQueueItem } from '../../../../core/api/adminAnalyticsApi';
import { formatCurrency } from '@/lib/utils';

interface AdminReservationTableProps {
  items: AdminReservationQueueItem[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  totalItems?: number;
  onLoadMore?: () => void;
  onSelectReservation: (reservation: AdminReservationQueueItem) => void;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

const TEXT = 'text-slate-900 dark:text-white';
const MUTED = 'text-slate-500 dark:text-slate-400';

const NEUTRAL_BADGE = {
  badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  dot: 'bg-slate-400',
};

const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  INITIEE: { label: 'Initiée', ...NEUTRAL_BADGE },
  EN_ATTENTE_PAIEMENT: {
    label: 'En attente de paiement',
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  PAYEE: {
    label: 'Payée, à valider',
    badge: 'bg-amber-100 text-amber-900 ring-amber-600/30',
    dot: 'bg-amber-600',
  },
  CONFIRMEE: {
    label: 'Confirmée',
    badge: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  EN_COURS: {
    label: 'En cours',
    badge: 'bg-sky-50 text-sky-800 ring-sky-600/20',
    dot: 'bg-sky-500',
  },
  TERMINEE: {
    label: 'Terminée',
    badge: 'bg-[#0A3D2E]/[0.08] text-[#0A3D2E] ring-[#0A3D2E]/20',
    dot: 'bg-[#0A3D2E]',
  },
  ANNULEE: {
    label: 'Annulée',
    badge: 'bg-slate-100 text-slate-500 ring-slate-400/20',
    dot: 'bg-slate-400',
  },
  LITIGE: {
    label: 'Litige ouvert',
    badge: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const humanize = (v?: string | null) => {
  if (!v) return 'Inconnu';
  const s = v.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const fmtPeriod = (start: string | number | Date, end: string | number | Date) => {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '–';
  const sameYear = s.getFullYear() === e.getFullYear();
  const startPart = s.toLocaleDateString(
    'fr-FR',
    sameYear
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' }
  );
  const endPart = e.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${startPart} → ${endPart}`;
};

const refOf = (r: AdminReservationQueueItem) => `#RES-${r.id.slice(0, 8).toUpperCase()}`;

const accentOf = (statut: string) =>
  statut === 'LITIGE' ? RUST : statut === 'PAYEE' ? GOLD : undefined;

const tintOf = (statut: string) =>
  statut === 'LITIGE'
    ? 'bg-rose-50/40 dark:bg-rose-950/10'
    : statut === 'PAYEE'
      ? 'bg-amber-50/40 dark:bg-amber-950/10'
      : '';

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut }: { statut: string }) {
  const s = STATUS[statut] ?? { label: humanize(statut), ...NEUTRAL_BADGE };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s.dot} ${statut === 'LITIGE' ? 'animate-pulse motion-reduce:animate-none' : ''
          }`}
      />
      {s.label}
    </span>
  );
}

function Avatar({ prenom, nom }: { prenom?: string | null; nom?: string | null }) {
  const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <span
      style={DISPLAY_FONT}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A3D2E] text-sm text-[#F1DFB6]"
    >
      {initials}
    </span>
  );
}

function RenterCell({ r }: { r: AdminReservationQueueItem }) {
  if (!r.locataire) return <span className={`text-sm italic ${MUTED}`}>Non renseigné</span>;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar prenom={r.locataire.prenom} nom={r.locataire.nom} />
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${TEXT}`}>
          {r.locataire.prenom} {r.locataire.nom}
        </p>
        <p className={`truncate text-xs ${MUTED}`}>
          {r.locataire.telephone || r.locataire.email || 'Contact non renseigné'}
        </p>
      </div>
    </div>
  );
}

function VehicleCell({ r }: { r: AdminReservationQueueItem }) {
  const cover = r.vehicule?.photos?.[0]?.url;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[#0A3D2E]/10 ring-1 ring-slate-200 dark:ring-slate-700">
        {cover ? (
          <Image src={cover} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-[#0A3D2E]/40">
            <Car className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-medium ${TEXT}`}>
          {r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : 'Véhicule'}
        </p>
        <p className={`truncate text-xs ${MUTED}`}>
          <span className="font-mono">{r.vehicule?.immatriculation || 'Plaque inconnue'}</span>
          {r.proprietaire?.prenom ? `, hôte ${r.proprietaire.prenom}` : ''}
        </p>
      </div>
    </div>
  );
}

function PaymentCell({ r }: { r: AdminReservationQueueItem }) {
  const total = Number(r.prixTotal || 0);
  const paid = Number(r.montantPayeEnLigne || 0);
  const share = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div className="min-w-[140px]">
      <div className={`text-sm font-semibold tabular-nums ${TEXT}`}>{formatCurrency(total)}</div>
      <div className={`mt-0.5 text-xs tabular-nums ${MUTED}`}>
        {paid > 0 ? `${formatCurrency(paid)} payés en ligne` : 'Aucun paiement en ligne'}
      </div>
      {total > 0 && (
        <div
          aria-hidden
          className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        >
          <div className="h-full rounded-full bg-[#0A3D2E]" style={{ width: `${share}%` }} />
        </div>
      )}
    </div>
  );
}

function PhotoChip({ label, count }: { label: string; count: number }) {
  const has = count > 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${has
          ? 'bg-[#0A3D2E]/[0.07] text-[#0A3D2E] ring-[#0A3D2E]/15 dark:text-[#F1DFB6]'
          : 'text-slate-400 ring-slate-200 dark:ring-slate-700'
        }`}
    >
      <Camera className="h-3 w-3" />
      {label}
      <span className="tabular-nums">{count}</span>
    </span>
  );
}

function PhotoChips({ r }: { r: AdminReservationQueueItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PhotoChip label="Check-in" count={r.checkinPhotosCount ?? 0} />
      <PhotoChip label="Check-out" count={r.checkoutPhotosCount ?? 0} />
    </div>
  );
}

function StatusCell({ r }: { r: AdminReservationQueueItem }) {
  return (
    <div className="space-y-1.5">
      <StatusBadge statut={r.statut} />
      {r.slaWaitHours > 0 && r.statut === 'PAYEE' && (
        <p className="flex items-center gap-1 text-xs font-medium text-amber-700">
          <Clock className="h-3 w-3" />
          {r.slaWaitHours} h d'attente
        </p>
      )}
    </div>
  );
}

function Skel({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none dark:bg-slate-800 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export const AdminReservationTable: React.FC<AdminReservationTableProps> = ({
  items,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  totalItems = 0,
  onLoadMore,
  onSelectReservation,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Scroll infini via Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const shell =
    'overflow-hidden rounded-[28px] border border-[#0A3D2E]/10 bg-white shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)] dark:border-slate-800 dark:bg-slate-900';

  /* État vide */
  if (!isLoading && items.length === 0) {
    return (
      <div className={`${shell} flex flex-col items-center px-6 py-16 text-center`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6]">
          <SearchX className="h-6 w-6" />
        </span>
        <p style={DISPLAY_FONT} className="mt-5 text-xl text-[#0A3D2E] dark:text-[#F1DFB6]">
          Aucune réservation trouvée
        </p>
        <p className={`mt-1 max-w-sm text-sm ${MUTED}`}>
          Aucune réservation ne correspond à vos filtres ou à cette recherche.
        </p>
      </div>
    );
  }

  const total = Math.max(totalItems, items.length);
  const remaining = Math.max(0, total - items.length);
  const loadedShare = total > 0 ? Math.round((items.length / total) * 100) : 100;

  const thCls = `px-4 py-3.5 text-xs font-medium ${MUTED}`;

  return (
    <div className={shell}>
      {/* Tableau (tablette et bureau) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Registre des réservations</caption>
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800">
              <th scope="col" className={thCls}>Réservation</th>
              <th scope="col" className={thCls}>Locataire</th>
              <th scope="col" className={thCls}>Véhicule</th>
              <th scope="col" className={thCls}>Paiement</th>
              <th scope="col" className={thCls}>États des lieux</th>
              <th scope="col" className={thCls}>Statut</th>
              <th scope="col" className={`${thCls} text-right`}>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="px-4 py-4"><Skel className="h-4 w-28" /><Skel className="mt-2 h-3 w-36" /></td>
                  <td className="px-4 py-4"><Skel className="h-9 w-40" /></td>
                  <td className="px-4 py-4"><Skel className="h-10 w-44" /></td>
                  <td className="px-4 py-4"><Skel className="h-4 w-24" /><Skel className="mt-2 h-3 w-32" /></td>
                  <td className="px-4 py-4"><Skel className="h-6 w-32" /></td>
                  <td className="px-4 py-4"><Skel className="h-6 w-24" /></td>
                  <td className="px-4 py-4"><Skel className="ml-auto h-8 w-24" /></td>
                </tr>
              ))
              : items.map((r) => {
                const ref = refOf(r);
                const accent = accentOf(r.statut);
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectReservation(r)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-[#0A3D2E]/[0.04] dark:border-slate-800/60 dark:hover:bg-[#F1DFB6]/[0.05] ${tintOf(
                      r.statut
                    )}`}
                  >
                    <td
                      className="px-4 py-4"
                      style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-semibold ${TEXT}`}>{ref}</span>
                        {r.nbJours ? (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {r.nbJours} j
                          </span>
                        ) : null}
                      </div>
                      <p className={`mt-1 whitespace-nowrap text-xs tabular-nums ${MUTED}`}>
                        {fmtPeriod(r.dateDebut, r.dateFin)}
                      </p>
                    </td>
                    <td className="max-w-[220px] px-4 py-4"><RenterCell r={r} /></td>
                    <td className="max-w-[240px] px-4 py-4"><VehicleCell r={r} /></td>
                    <td className="px-4 py-4"><PaymentCell r={r} /></td>
                    <td className="px-4 py-4"><PhotoChips r={r} /></td>
                    <td className="px-4 py-4"><StatusCell r={r} /></td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReservation(r);
                        }}
                        aria-label={`Inspecter la réservation ${ref}`}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#0A3D2E]/25 px-3.5 py-1.5 text-sm font-medium text-[#0A3D2E] transition hover:border-[#0A3D2E] hover:bg-[#0A3D2E] hover:text-[#F1DFB6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 dark:border-[#F1DFB6]/30 dark:text-[#F1DFB6] dark:hover:bg-[#F1DFB6] dark:hover:text-[#0A3D2E]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspecter
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800/60">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="space-y-3 p-4">
              <Skel className="h-5 w-40" />
              <Skel className="h-9 w-48" />
              <Skel className="h-10 w-56" />
            </li>
          ))
          : items.map((r) => {
            const ref = refOf(r);
            const accent = accentOf(r.statut);
            return (
              <li key={r.id} className={tintOf(r.statut)}>
                <button
                  type="button"
                  onClick={() => onSelectReservation(r)}
                  aria-label={`Inspecter la réservation ${ref}`}
                  className="block w-full space-y-4 p-4 text-left transition-colors hover:bg-[#0A3D2E]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A3D2E]"
                  style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-semibold ${TEXT}`}>{ref}</span>
                        {r.nbJours ? (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {r.nbJours} j
                          </span>
                        ) : null}
                      </div>
                      <p className={`mt-1 text-xs tabular-nums ${MUTED}`}>
                        {fmtPeriod(r.dateDebut, r.dateFin)}
                      </p>
                    </div>
                    <StatusCell r={r} />
                  </div>

                  <RenterCell r={r} />
                  <VehicleCell r={r} />

                  <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <PaymentCell r={r} />
                    <PhotoChips r={r} />
                  </div>
                </button>
              </li>
            );
          })}
      </ul>

      {/* Pied : scroll infini */}
      <div
        ref={loadMoreRef}
        aria-live="polite"
        className="border-t border-slate-200/80 bg-[#F6F7F5] px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40"
      >
        {isLoadingMore ? (
          <div className={`flex items-center justify-center gap-2.5 py-1 text-sm ${MUTED}`}>
            <Loader2 className="h-4 w-4 animate-spin text-[#0A3D2E] motion-reduce:animate-none dark:text-[#F1DFB6]" />
            Chargement des réservations suivantes…
          </div>
        ) : hasMore ? (
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className={`text-sm tabular-nums ${MUTED}`}>
                <span className={`font-semibold ${TEXT}`}>{items.length}</span> sur{' '}
                <span className={`font-semibold ${TEXT}`}>{total}</span> réservations
              </p>
              <div
                aria-hidden
                className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
              >
                <div className="h-full rounded-full bg-[#0A3D2E]" style={{ width: `${loadedShare}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={onLoadMore}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-5 py-2.5 text-sm font-semibold text-[#F1DFB6] shadow-md shadow-[#0A3D2E]/20 transition hover:bg-[#0D4B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
            >
              Charger la suite
              <ChevronDown className="h-4 w-4" />
              {remaining > 0 && (
                <span className="rounded-full bg-[#F1DFB6]/20 px-2 text-xs tabular-nums">
                  +{remaining}
                </span>
              )}
            </button>
          </div>
        ) : (
          <p className={`flex items-center justify-center gap-2 py-1 text-sm ${MUTED}`}>
            <Check className="h-4 w-4 text-[#0A3D2E] dark:text-[#F1DFB6]" />
            Toutes les réservations sont chargées ({items.length})
          </p>
        )}
      </div>
    </div>
  );
};