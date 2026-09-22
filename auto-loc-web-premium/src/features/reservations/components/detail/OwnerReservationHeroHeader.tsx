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
  UserCheck,
  ShieldCheck,
  Wallet,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export interface OwnerReservationHeroHeaderProps {
  id: string;
  statut: string;
  creeLe?: string;
  vehicule?: {
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    immatriculation?: string;
    photos?: Array<string | { url: string }>;
    photoUrl?: string;
  };
  locataire?: {
    id?: string;
    prenom: string;
    nom: string;
    telephone?: string;
    kycStatus?: string;
  };
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  netProprietaire?: string | number;
  adresseLivraison?: string;
  typeLivraison?: string;
  horsDakar?: boolean;
}

const PLACEHOLDER_CAR = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80';

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

const resolvePhoto = (vehicule: OwnerReservationHeroHeaderProps['vehicule']): string => {
  const first = vehicule?.photos?.[0];
  if (typeof first === 'string' && first) return first;
  if (first && typeof first === 'object' && first.url) return first.url;
  return vehicule?.photoUrl || PLACEHOLDER_CAR;
};

type DeliveryMode = 'AIBD' | 'DAKAR' | 'AUCUNE';

const resolveDeliveryMode = (typeLivraison?: string, adresse?: string): DeliveryMode => {
  if (typeLivraison === 'AIBD' || typeLivraison === 'DAKAR' || typeLivraison === 'AUCUNE') {
    return typeLivraison;
  }
  if (adresse?.toLowerCase().includes('aibd')) return 'AIBD';
  return adresse ? 'DAKAR' : 'AUCUNE';
};

const DELIVERY_CHIP: Record<DeliveryMode, { icon: LucideIcon; label: string }> = {
  AIBD: { icon: Plane, label: 'Livraison AIBD' },
  DAKAR: { icon: Truck, label: 'Livraison Dakar' },
  AUCUNE: { icon: Home, label: 'Retrait hôte' },
};

interface StatusInfo {
  label: string;
  className: string;
  desc?: string;
  icon?: LucideIcon;
  live?: boolean;
}

const STATUS_CONFIG: Record<string, StatusInfo> = {
  EN_ATTENTE_PAIEMENT: {
    label: 'Paiement en cours',
    className: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
    desc: 'La réservation sera confirmable dès réception du paiement.',
    icon: Clock,
  },
  PAYEE: {
    label: 'Demande reçue — À confirmer',
    className: 'border-[#4ADE80]/40 bg-[#4ADE80]/15 text-[#4ADE80]',
    desc: 'Le locataire a payé. Vous devez confirmer ou refuser la réservation.',
    icon: CheckCircle2,
  },
  CONFIRMEE: {
    label: 'Réservation confirmée',
    className: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200',
    desc: 'Réservation validée. Préparez la remise du véhicule avec le locataire.',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'Location en cours',
    className: 'border-transparent bg-[#F1DFB6] text-[#041912]',
    desc: 'Le véhicule est actuellement sous la responsabilité du locataire.',
    live: true,
  },
  TERMINEE: {
    label: 'Location clôturée',
    className: 'border-slate-300/30 bg-slate-400/10 text-slate-200',
    desc: 'Location achevée avec succès. Fonds débloqués sur votre solde.',
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
    desc: 'Un signalement est ouvert. L’équipe d’arbitrage AutoLoc intervient.',
    icon: AlertTriangle,
  },
};

const getStatusInfo = (statut?: string): StatusInfo => {
  const key = statut?.toUpperCase() ?? '';
  return (
    STATUS_CONFIG[key] ?? {
      label: key ? key.charAt(0) + key.slice(1).replace(/_/g, ' ').toLowerCase() : 'Statut inconnu',
      className: 'border-slate-300/30 bg-slate-400/10 text-slate-200',
      icon: Clock,
    }
  );
};

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
      <p className="text-[10px] sm:text-xs text-[#F1DFB6]/60 font-medium uppercase tracking-wider">{label}</p>
      {date ? (
        <time dateTime={value} className="mt-0.5 block">
          <span className="block text-sm sm:text-lg font-bold leading-tight text-[#F1DFB6]">
            {dayMonth.format(date)}
          </span>
          <span className="hidden sm:block text-xs text-[#F1DFB6]/60">{yearOnly.format(date)}</span>
        </time>
      ) : (
        <p className="mt-0.5 text-sm sm:text-lg font-bold text-[#F1DFB6]/60">—</p>
      )}
    </div>
  );
}

export function OwnerReservationHeroHeader({
  id,
  statut,
  creeLe,
  vehicule,
  locataire,
  dateDebut,
  dateFin,
  nbJours,
  netProprietaire,
  adresseLivraison,
  typeLivraison,
  horsDakar,
}: OwnerReservationHeroHeaderProps) {
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
  const locationText = adresseLivraison || vehicule?.ville || 'Adresse du véhicule';

  const days = nbJours || 1;
  const netAmount = Number(netProprietaire || 0);

  const tenantName = locataire?.prenom
    ? `${locataire.prenom} ${locataire.nom}`
    : 'Locataire AutoLoc';

  const chipClass =
    'inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-[#F1DFB6]/20 bg-white/[0.06] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-medium text-[#F1DFB6]';

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#F1DFB6]/10 bg-[#041912] p-3.5 sm:p-8 lg:p-10 text-[#F1DFB6] shadow-lg shadow-[#041912]/20"
    >
      {/* ── Statut & Réf & Net Hôte ────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold ${status.className}`}
            >
              {status.live ? (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#041912] motion-safe:animate-pulse"
                />
              ) : (
                StatusIcon && <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              )}
              {status.label}
            </span>

            <span className="text-[11px] sm:text-xs font-mono tabular-nums text-[#F1DFB6]/70 bg-white/5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/10">
              #{refShort}
            </span>

            {creeLe && dateDebut && new Date(creeLe).toDateString() === new Date(dateDebut).toDateString() && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/40 animate-pulse">
                <Zap className="w-3 h-3 text-amber-300" />
                Départ Aujourd'hui (Jour même)
              </span>
            )}
          </div>

          {netAmount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1.5 text-xs font-bold text-[#4ADE80]">
              <Wallet className="h-3.5 w-3.5" />
              <span>{netAmount.toLocaleString('fr-FR')} FCFA Net</span>
            </div>
          )}
        </div>

        {status.desc && (
          <p className="hidden sm:block text-sm text-[#F1DFB6]/80 pt-1 border-t border-white/5">
            {status.desc}
          </p>
        )}
      </div>

      {/* ── VUE MOBILE SOMBRE COMPACTE (< 640px) ──────────────────────────── */}
      <div className="mt-3 flex items-start gap-3 sm:hidden">
        {/* Photo miniature */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-[#F1DFB6]/20">
          <img
            src={photo}
            alt={vehicleName}
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith(PLACEHOLDER_CAR)) img.src = PLACEHOLDER_CAR;
            }}
          />
          {vehicule?.immatriculation && (
            <span className="absolute bottom-1 left-1 right-1 rounded border border-slate-700/80 bg-slate-900/90 px-1 py-0.5 font-mono text-[9px] font-bold text-center text-slate-100 truncate">
              {vehicule.immatriculation}
            </span>
          )}
        </div>

        {/* Info véhicule + locataire */}
        <div className="min-w-0 flex-1 space-y-1 pt-0.5">
          <h1 id={titleId} className="font-fraunces text-lg font-normal leading-snug text-[#F1DFB6] truncate">
            {vehicleName}
            {vehicule?.annee ? (
              <span className="ml-1.5 text-xs font-sans text-[#F1DFB6]/50">
                {vehicule.annee}
              </span>
            ) : null}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-[#F1DFB6]/80">
            <UserCheck className="h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
            <span className="truncate font-semibold text-white">{tenantName}</span>
            {locataire?.kycStatus === 'VERIFIE' && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#4ADE80]" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#F1DFB6]/70 truncate pt-0.5">
            <DeliveryIcon className="h-3 w-3 shrink-0 text-[#F1DFB6]/80" />
            <span className="truncate">{DELIVERY_CHIP[deliveryMode].label}</span>
          </div>
        </div>
      </div>

      {/* ── VUE DESKTOP GRANDE TAILLE (>= 640px) ─────────────────────────── */}
      <div className="hidden sm:grid sm:mt-6 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-10">
        {/* Photo grand format */}
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
          {vehicule?.immatriculation && (
            <span className="absolute left-3 top-3 rounded-lg border border-slate-700/80 bg-slate-900/90 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-slate-100 shadow-md backdrop-blur-md">
              {vehicule.immatriculation}
            </span>
          )}
          {vehicule?.type && (
            <span className="absolute right-3 top-3 rounded-full bg-[#041912]/85 px-3 py-1 text-xs font-semibold text-[#F1DFB6]">
              {vehicule.type}
            </span>
          )}
        </div>

        {/* Détails Titre, Locataire & Badges */}
        <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-1">
          <div>
            <h2 className="font-display text-4xl leading-[1.05] text-[#F1DFB6] sm:text-5xl">
              {vehicleName}
              {vehicule?.annee ? (
                <span className="ml-3 align-baseline text-xl text-[#F1DFB6]/50 sm:text-2xl">
                  {vehicule.annee}
                </span>
              ) : null}
            </h2>

            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#F1DFB6]/15 bg-white/[0.05] px-3.5 py-2 text-xs text-[#F1DFB6]">
              <UserCheck className="h-4 w-4 text-[#4ADE80]" />
              <span className="font-medium text-[#F1DFB6]">Locataire :</span>
              <span className="font-bold text-white">{tenantName}</span>
              {locataire?.kycStatus === 'VERIFIE' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded-full border border-[#4ADE80]/20">
                  <ShieldCheck className="h-3 w-3" />
                  KYC Vérifié
                </span>
              )}
            </div>
          </div>

          <ul className="flex flex-wrap gap-2">
            <li className={chipClass}>
              <DeliveryIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              {DELIVERY_CHIP[deliveryMode].label}
            </li>
            {horsDakar && (
              <li className={chipClass}>
                <Navigation className="h-3.5 w-3.5 text-[#4ADE80]" strokeWidth={1.75} aria-hidden="true" />
                Trajet Hors Dakar inclus
              </li>
            )}
          </ul>

          <p className="flex items-start gap-2 text-sm text-[#F1DFB6]/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4ADE80]" strokeWidth={1.5} aria-hidden="true" />
            <span>{locationText}</span>
          </p>
        </div>
      </div>

      {/* ── Période de location (Compact sur mobile, étendu sur desktop) ── */}
      <div className="mt-3 sm:mt-8 rounded-xl sm:rounded-2xl border border-[#F1DFB6]/15 bg-white/[0.04] p-3 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-5">
          <DateBlock label="Début" value={dateDebut} />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-[#F1DFB6]/25" />
            <span className="whitespace-nowrap rounded-full border border-[#F1DFB6]/25 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-[#F1DFB6]">
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
