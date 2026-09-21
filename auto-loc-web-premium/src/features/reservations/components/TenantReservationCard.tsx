'use client';

import React, { useId, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  Phone,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface TenantReservation {
  id: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  prixParJour: string | number;
  prixTotal: string | number;
  modePaiement?: string;
  montantPayeEnLigne?: string | number;
  montantSoldeCheckin?: string | number;
  creeLe: string;
  contratUrl?: string | null;
  vehicule?: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photos?: Array<string | { url: string }>;
    photoUrl?: string;
  };
  proprietaire?: {
    id: string;
    prenom: string;
    nom: string;
    telephone?: string;
  };
  paiement?: {
    statut?: string;
    fournisseur?: string;
    montant?: number;
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_CAR = '/placeholder-car.jpg';

const dateWithYear = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dateWithoutYear = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const parseDate = (iso: string): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

/* -------------------------------------------------------------------------- */
/* Statuts                                                                    */
/* -------------------------------------------------------------------------- */

interface StatusConfig {
  label: string;
  className: string;
  icon?: LucideIcon;
  /** Location active : point animé à la place de l'icône */
  live?: boolean;
}

const CONFIRMED: StatusConfig = {
  label: 'Confirmée',
  className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  icon: CheckCircle2,
};

const PENDING_PAYMENT: StatusConfig = {
  label: 'Paiement en attente',
  className: 'border-amber-200 bg-amber-50 text-amber-800',
  icon: CreditCard,
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  EN_COURS: {
    label: 'Location en cours',
    className: 'border-transparent bg-[#0A3D2E] text-[#F1DFB6]',
    live: true,
  },
  CONFIRMEE: CONFIRMED,
  PAYEE: CONFIRMED,
  EN_ATTENTE_PAIEMENT: PENDING_PAYMENT,
  INITIEE: PENDING_PAYMENT,
  TERMINEE: {
    label: 'Terminée',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
    icon: CheckCheck,
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
    icon: XCircle,
  },
  LITIGE: {
    label: 'En litige',
    className: 'border-purple-200 bg-purple-50 text-purple-800',
    icon: AlertTriangle,
  },
};

function StatusBadge({ statut }: { statut: string }) {
  const config = STATUS_CONFIG[statut] ?? {
    // Statut inconnu : "EN_ATTENTE_X" -> "En attente x"
    label: statut.charAt(0) + statut.slice(1).replace(/_/g, ' ').toLowerCase(),
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.live ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-[#F1DFB6] motion-safe:animate-pulse"
        />
      ) : (
        Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Carte                                                                      */
/* -------------------------------------------------------------------------- */

interface TenantReservationCardProps {
  reservation: TenantReservation;
}

export function TenantReservationCard({ reservation }: TenantReservationCardProps) {
  const { vehicule, proprietaire } = reservation;
  const titleId = useId();

  const photoUrl = useMemo(() => {
    if (!vehicule) return PLACEHOLDER_CAR;
    if (Array.isArray(vehicule.photos) && vehicule.photos.length > 0) {
      const p = vehicule.photos[0];
      return typeof p === 'string' ? p : p.url;
    }
    return vehicule.photoUrl || PLACEHOLDER_CAR;
  }, [vehicule]);

  const vehicleName = vehicule ? `${vehicule.marque} ${vehicule.modele}` : 'Véhicule';

  /* ------------------------------ Dates ---------------------------------- */

  const start = parseDate(reservation.dateDebut);
  const end = parseDate(reservation.dateFin);
  // L'année n'apparaît qu'une fois quand les deux dates sont dans la même année
  const sameYear = start && end && start.getFullYear() === end.getFullYear();

  /* ------------------------------ Montants ------------------------------- */

  const total = toNumber(reservation.prixTotal);
  const paidOnline = toNumber(reservation.montantPayeEnLigne);
  const balance = toNumber(reservation.montantSoldeCheckin);

  const isCancelled = reservation.statut === 'ANNULEE';
  const isActive = reservation.statut === 'EN_COURS';
  const isClosed = isCancelled || reservation.statut === 'TERMINEE';

  const showPaid = paidOnline > 0 && !isCancelled;
  const showBalance = balance > 0 && !isClosed;

  /* ------------------------------ Hôte ----------------------------------- */

  const hostInitials = proprietaire
    ? `${proprietaire.prenom?.[0] ?? ''}${proprietaire.nom?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <article
      aria-labelledby={titleId}
      className={`rounded-3xl border bg-white p-4 sm:p-5 ${isActive ? 'border-[#0A3D2E]/40 shadow-md shadow-[#0A3D2E]/5' : 'border-slate-200/90 shadow-sm'
        }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        {/* Photo */}
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-auto sm:min-h-32 sm:w-44">
          <img
            src={photoUrl}
            alt={vehicleName}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${isCancelled ? 'grayscale' : ''
              }`}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith(PLACEHOLDER_CAR)) img.src = PLACEHOLDER_CAR;
            }}
          />
          {vehicule?.type && (
            <span className="absolute left-2 top-2 rounded-full bg-[#0A3D2E] px-2.5 py-0.5 text-xs font-semibold text-[#F1DFB6]">
              {vehicule.type}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* Informations */}
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <StatusBadge statut={reservation.statut} />
              <span className="text-xs tabular-nums text-slate-400">
                Réf. {reservation.id.slice(0, 8)}
              </span>
            </div>

            <h3
              id={titleId}
              className="truncate font-display text-xl leading-tight text-[#041912] sm:text-2xl"
            >
              {vehicleName}
              {vehicule?.annee ? (
                <span className="ml-2 text-base text-slate-400">({vehicule.annee})</span>
              ) : null}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-700">
              {start && end && (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Calendar
                    className="h-4 w-4 shrink-0 text-[#0A3D2E]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <time dateTime={reservation.dateDebut}>
                    {(sameYear ? dateWithoutYear : dateWithYear).format(start)}
                  </time>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <time dateTime={reservation.dateFin}>{dateWithYear.format(end)}</time>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {plural(reservation.nbJours, 'jour')}
                  </span>
                </p>
              )}

              {vehicule?.ville && (
                <p className="flex items-center gap-1.5">
                  <MapPin
                    className="h-4 w-4 shrink-0 text-[#0A3D2E]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {vehicule.ville}
                </p>
              )}
            </div>

            {proprietaire && (
              <div className="flex items-center gap-2.5 pt-0.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1DFB6] text-xs font-semibold text-[#041912]"
                >
                  {hostInitials}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs text-slate-500">Hôte</p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {proprietaire.prenom} {proprietaire.nom}
                  </p>
                </div>
                {proprietaire.telephone && (
                  <a
                    href={`tel:${proprietaire.telephone.replace(/\s/g, '')}`}
                    aria-label={`Appeler ${proprietaire.prenom}`}
                    className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#0A3D2E] transition-colors hover:bg-[#0A3D2E]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Prix et action */}
          <div className="flex shrink-0 items-end justify-between gap-4 border-t border-slate-100 pt-4 lg:min-w-[13rem] lg:flex-col lg:items-end lg:justify-center lg:gap-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="lg:text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p
                className={`font-display text-2xl leading-tight tabular-nums ${isCancelled ? 'text-slate-400 line-through' : 'text-[#0A3D2E]'
                  }`}
              >
                {formatCurrency(total)}
                <span className="ml-1.5 font-sans text-xs text-slate-500">FCFA</span>
              </p>

              {(showPaid || showBalance) && (
                <dl className="mt-2 space-y-1 text-xs">
                  {showPaid && (
                    <div className="flex justify-between gap-6 text-slate-500">
                      <dt>Payé en ligne</dt>
                      <dd className="tabular-nums text-slate-700">
                        {formatCurrency(paidOnline)} FCFA
                      </dd>
                    </div>
                  )}
                  {showBalance && (
                    <div className="flex justify-between gap-6 text-amber-800">
                      <dt>Solde au check-in</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatCurrency(balance)} FCFA
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            <Link
              href={`/reservations/${reservation.id}`}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-[#0A3D2E] px-4 py-2.5 text-sm font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0F4F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
            >
              Voir détail réservation
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}