'use client';

import React, { useId } from 'react';
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock,
  Home,
  MapPin,
  Navigation,
  Plane,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export interface TenantReservationHeroHeaderProps {
  id: string;
  statut: string;
  creeLe?: string;
  vehicule?: {
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photos?: Array<string | { url: string }>;
    photoUrl?: string;
  };
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  adresseLivraison?: string;
  typeLivraison?: string;
  horsDakar?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_CAR = '/placeholder-car.jpg';

const fullDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dayMonth = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const yearOnly = new Intl.DateTimeFormat('fr-FR', { year: 'numeric' });

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

const resolvePhoto = (vehicule: TenantReservationHeroHeaderProps['vehicule']): string => {
  const first = vehicule?.photos?.[0];
  if (typeof first === 'string' && first) return first;
  if (first && typeof first === 'object' && first.url) return first.url;
  return vehicule?.photoUrl || PLACEHOLDER_CAR;
};

type DeliveryMode = 'AIBD' | 'DAKAR' | 'AUCUNE';

/** Le type de livraison prime ; l'adresse ne sert qu'en secours pour d'anciennes données. */
const resolveDeliveryMode = (typeLivraison?: string, adresse?: string): DeliveryMode => {
  if (typeLivraison === 'AIBD' || typeLivraison === 'DAKAR' || typeLivraison === 'AUCUNE') {
    return typeLivraison;
  }
  if (adresse?.toLowerCase().includes('aibd')) return 'AIBD';
  return adresse ? 'DAKAR' : 'AUCUNE';
};

const DELIVERY_CHIP: Record<DeliveryMode, { icon: LucideIcon; label: string }> = {
  AIBD: { icon: Plane, label: 'Livraison à l’aéroport AIBD' },
  DAKAR: { icon: Truck, label: 'Livraison à Dakar' },
  AUCUNE: { icon: Home, label: 'Retrait chez l’hôte' },
};

/* -------------------------------------------------------------------------- */
/* Statuts                                                                    */
/* -------------------------------------------------------------------------- */

interface StatusInfo {
  label: string;
  className: string;
  desc?: string;
  icon?: LucideIcon;
  /** Location active : point animé à la place de l'icône */
  live?: boolean;
}

const STATUS_CONFIG: Record<string, StatusInfo> = {
  EN_ATTENTE_PAIEMENT: {
    label: 'Paiement en attente',
    className: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
    desc: 'Votre réservation sera traitée dès confirmation du paiement.',
    icon: Clock,
  },
  PAYEE: {
    label: 'Paiement confirmé',
    className: 'border-sky-300/30 bg-sky-400/10 text-sky-200',
    desc: 'Le paiement est reçu. L’hôte doit valider la disponibilité.',
    icon: CheckCircle2,
  },
  CONFIRMEE: {
    label: 'Réservation confirmée',
    className: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
    desc: 'Votre réservation est validée. Préparez la remise des clés avec l’hôte.',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'Location en cours',
    className: 'border-transparent bg-[#F1DFB6] text-[#041912]',
    desc: 'Votre véhicule est en cours d’utilisation. Bon trajet !',
    live: true,
  },
  TERMINEE: {
    label: 'Location terminée',
    className: 'border-slate-300/30 bg-slate-400/10 text-slate-200',
    desc: 'Location achevée avec succès. Merci d’avoir voyagé avec AutoLoc.',
    icon: CheckCheck,
  },
  ANNULEE: {
    label: 'Réservation annulée',
    className: 'border-rose-300/30 bg-rose-400/10 text-rose-200',
    desc: 'Cette réservation a été annulée.',
    icon: XCircle,
  },
  LITIGE: {
    label: 'Litige en cours',
    className: 'border-rose-300/40 bg-rose-400/20 text-rose-100',
    desc: 'Un litige a été ouvert. L’équipe AutoLoc étudie votre dossier.',
    icon: AlertTriangle,
  },
};

const getStatusInfo = (statut?: string): StatusInfo => {
  const key = statut?.toUpperCase() ?? '';
  return (
    STATUS_CONFIG[key] ?? {
      // Statut inconnu : on l'affiche tel quel plutôt que de le faire passer pour « en attente »
      label: key ? key.charAt(0) + key.slice(1).replace(/_/g, ' ').toLowerCase() : 'Statut inconnu',
      className: 'border-slate-300/30 bg-slate-400/10 text-slate-200',
      icon: Clock,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* Sous-composants                                                            */
/* -------------------------------------------------------------------------- */

function DateBlock({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}) {
  const date = parseDate(value);

  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <p className="text-xs text-[#F1DFB6]/60">{label}</p>
      {date ? (
        <time dateTime={value} className="mt-1 block">
          <span className="block text-base font-semibold leading-tight text-[#F1DFB6] sm:text-lg">
            {dayMonth.format(date)}
          </span>
          <span className="block text-xs text-[#F1DFB6]/60">{yearOnly.format(date)}</span>
        </time>
      ) : (
        <p className="mt-1 text-base font-semibold text-[#F1DFB6]/60">—</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* En-tête                                                                    */
/* -------------------------------------------------------------------------- */

export function TenantReservationHeroHeader({
  id,
  statut,
  creeLe,
  vehicule,
  dateDebut,
  dateFin,
  nbJours,
  adresseLivraison,
  typeLivraison,
  horsDakar,
}: TenantReservationHeroHeaderProps) {
  const titleId = useId();

  const status = getStatusInfo(statut);
  const StatusIcon = status.icon;
  const refShort = id ? id.slice(0, 8).toUpperCase() : '—';
  const created = parseDate(creeLe);

  const vehicleName =
    `${vehicule?.marque ?? ''} ${vehicule?.modele ?? ''}`.trim() || 'Véhicule';
  const photo = resolvePhoto(vehicule);

  const deliveryMode = resolveDeliveryMode(typeLivraison, adresseLivraison);
  const DeliveryIcon = DELIVERY_CHIP[deliveryMode].icon;
  const locationText = adresseLivraison || vehicule?.ville || 'Adresse communiquée par l’hôte';

  const days = nbJours || 1;

  const chipClass =
    'inline-flex items-center gap-1.5 rounded-full border border-[#F1DFB6]/20 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#F1DFB6]';

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-3xl border border-[#F1DFB6]/10 bg-[#041912] p-5 text-[#F1DFB6] shadow-xl shadow-[#041912]/20 sm:p-8 lg:p-10"
    >
      {/* Statut, référence, date de création */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${status.className}`}
            >
              {status.live ? (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-[#041912] motion-safe:animate-pulse"
                />
              ) : (
                StatusIcon && <StatusIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {status.label}
            </span>
            <span className="text-xs tabular-nums text-[#F1DFB6]/60">Réf. {refShort}</span>
          </div>

          {created && (
            <span className="text-xs text-[#F1DFB6]/60">Réservé le {fullDate.format(created)}</span>
          )}
        </div>

        {status.desc && <p className="text-sm text-[#F1DFB6]/80">{status.desc}</p>}
      </div>

      {/* Véhicule */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-[#F1DFB6]/15 sm:aspect-[16/9] lg:col-start-2 lg:row-start-1 lg:aspect-[4/3]">
          <img
            src={photo}
            alt={vehicleName}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith(PLACEHOLDER_CAR)) img.src = PLACEHOLDER_CAR;
            }}
          />
          {vehicule?.type && (
            <span className="absolute left-3 top-3 rounded-full bg-[#041912]/85 px-3 py-1 text-xs font-semibold text-[#F1DFB6]">
              {vehicule.type}
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
          <h1
            id={titleId}
            className="font-display text-4xl leading-[1.05] text-[#F1DFB6] sm:text-5xl"
          >
            {vehicleName}
            {vehicule?.annee ? (
              <span className="ml-3 align-baseline text-xl text-[#F1DFB6]/50 sm:text-2xl">
                {vehicule.annee}
              </span>
            ) : null}
          </h1>

          <ul className="flex flex-wrap gap-2">
            <li className={chipClass}>
              <DeliveryIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              {DELIVERY_CHIP[deliveryMode].label}
            </li>
            {horsDakar && (
              <li className={chipClass}>
                <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                Hors Dakar autorisé
              </li>
            )}
          </ul>

          <p className="flex items-start gap-2 text-sm text-[#F1DFB6]/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{locationText}</span>
          </p>
        </div>
      </div>

      {/* Période */}
      <div className="mt-8 rounded-2xl border border-[#F1DFB6]/15 bg-white/[0.04] p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-5">
          <DateBlock label="Prise en charge" value={dateDebut} />

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-[#F1DFB6]/25" />
            <span className="whitespace-nowrap rounded-full border border-[#F1DFB6]/25 px-3 py-1 text-xs font-semibold">
              {plural(days, 'jour')}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-[#F1DFB6]/25" />
          </div>

          <DateBlock label="Restitution" value={dateFin} align="right" />
        </div>
      </div>
    </section>
  );
}