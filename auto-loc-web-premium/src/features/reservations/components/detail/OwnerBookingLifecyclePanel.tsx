'use client';

import React, { useId, useState } from 'react';
import {
  AlertTriangle,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  FileCheck,
  Info,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Plane,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Truck,
  UserCheck,
  Wallet,
  X,
  AlertCircle,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OwnerReservationItem, ReservationStatut } from '@/src/core/api/reservationsApi';

export interface OwnerBookingLifecyclePanelProps {
  reservation: OwnerReservationItem;
  isSubmitting?: boolean;
  onConfirmReservationClick?: () => void;
  onCheckinClick?: () => void;
  onCheckoutClick?: () => void;
  onCancelClick?: () => void;
  onSignalNoshowClick?: () => void;
  onSignalOverloadClick?: () => void;
  onOpenDisputeClick?: () => void;
  onRefetch?: () => void;
}

/** Numéro du support arbitrage & assistance hôte AutoLoc */
const SUPPORT_PHONE_DISPLAY = '+221 78 663 77 05';
const SUPPORT_PHONE_HREF = 'tel:+221786637705';

const formatConfirmationDeadline = (
  creeLe?: string,
  dateDebut?: string,
  tacitDeadline?: string
): string => {
  let target: Date | null = null;

  if (tacitDeadline) {
    const d = new Date(tacitDeadline);
    if (!isNaN(d.getTime())) target = d;
  }

  if (!target && creeLe && dateDebut) {
    const createdDate = new Date(creeLe);
    const startDate = new Date(dateDebut);

    if (!isNaN(createdDate.getTime()) && !isNaN(startDate.getTime())) {
      const createdDay =
        createdDate.getUTCFullYear() * 10000 +
        (createdDate.getUTCMonth() + 1) * 100 +
        createdDate.getUTCDate();
      const startDay =
        startDate.getUTCFullYear() * 10000 +
        (startDate.getUTCMonth() + 1) * 100 +
        startDate.getUTCDate();
      const isSameDay = createdDay === startDay;

      if (isSameDay) {
        // Prise en charge le jour même : au plus tard H-2 avant le départ
        // (ou 30 min après la réservation si la prise en charge est imminente dans < 3h)
        const diffMs = startDate.getTime() - createdDate.getTime();
        if (diffMs <= 3 * 3600 * 1000) {
          target = new Date(
            Math.min(
              createdDate.getTime() + 30 * 60 * 1000,
              Math.max(createdDate.getTime() + 15 * 60 * 1000, startDate.getTime() - 15 * 60 * 1000)
            )
          );
        } else {
          target = new Date(startDate.getTime() - 2 * 3600 * 1000);
        }
      } else {
        // Prise en charge ultérieure : 24h max après paiement ou H-2 avant le début
        const date24h = new Date(createdDate.getTime() + 24 * 3600 * 1000);
        const startMinus2h = new Date(startDate.getTime() - 2 * 3600 * 1000);
        target = date24h.getTime() < startMinus2h.getTime() ? date24h : startMinus2h;
      }
    }
  }

  if (!target && dateDebut) {
    const startDate = new Date(dateDebut);
    if (!isNaN(startDate.getTime())) {
      target = new Date(startDate.getTime() - 2 * 3600 * 1000);
    }
  }

  if (!target) {
    return 'dans un délai de 24h';
  }

  try {
    const formatted = target.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    const capitalizedDay = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${capitalizedDay} à ${hours}:${minutes}`;
  } catch {
    return 'dans un délai restreint';
  }
};

const STEP_LABELS = ['Paiement', 'Accord hôte', 'Check-in', 'Check-out'] as const;

type StepState = 'done' | 'current' | 'upcoming' | 'alert';

interface Flags {
  isPendingPayment: boolean;
  isPaid: boolean;
  isConfirmed: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  isDispute: boolean;
  hasOwnerCheckin: boolean;
  hasTenantCheckin: boolean;
}

function getStepStates(f: Flags): StepState[] {
  if (f.isDispute) {
    const alertIndex = f.isInProgress ? 3 : f.isConfirmed ? 2 : 1;
    return STEP_LABELS.map((_, i) =>
      i < alertIndex ? 'done' : i === alertIndex ? 'alert' : 'upcoming'
    );
  }

  let current = 0;
  if (f.isPaid) current = 1;
  else if (f.isConfirmed) current = f.hasOwnerCheckin ? 3 : 2;
  else if (f.isInProgress) current = 3;
  else if (f.isCompleted) current = 4;

  return STEP_LABELS.map((_, i) =>
    i < current ? 'done' : i === current ? 'current' : 'upcoming'
  );
}

const CIRCLE_CLASS: Record<StepState, string> = {
  done: 'bg-[#0A3D2E] text-[#F1DFB6]',
  current: 'border-2 border-[#0A3D2E] bg-white text-[#0A3D2E] ring-4 ring-[#0A3D2E]/10',
  alert: 'bg-rose-600 text-white ring-4 ring-rose-100',
  upcoming: 'border border-slate-200 bg-slate-100 text-slate-400',
};

const STEP_LABEL_CLASS: Record<StepState, string> = {
  done: 'font-semibold text-[#041912]',
  current: 'font-semibold text-[#041912]',
  alert: 'font-semibold text-rose-700',
  upcoming: 'text-slate-500',
};

type Tone = 'neutral' | 'action' | 'success' | 'danger';

interface LifecycleView {
  title: string;
  icon: LucideIcon;
  stepLabel?: string;
  chipTone: 'default' | 'action' | 'danger';
  notice?: { title: string; text: string; icon: LucideIcon; tone: Tone };
}

const TONE_CLASS: Record<Tone, { panel: string; icon: string }> = {
  neutral: {
    panel: 'border-[#0A3D2E]/10 bg-[#0A3D2E]/[0.04] text-[#041912]',
    icon: 'bg-[#0A3D2E] text-[#F1DFB6]',
  },
  action: {
    panel: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'bg-amber-500 text-white',
  },
  success: {
    panel: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    icon: 'bg-emerald-600 text-white',
  },
  danger: {
    panel: 'border-rose-200 bg-rose-50 text-rose-950',
    icon: 'bg-rose-600 text-white',
  },
};

const CHIP_CLASS: Record<LifecycleView['chipTone'], string> = {
  default: 'border-[#0A3D2E]/15 bg-[#0A3D2E]/5 text-[#0A3D2E]',
  action: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
};

function buildView(f: Flags, r: OwnerReservationItem): LifecycleView {
  if (f.isDispute) {
    return {
      title: 'Litige en cours d’examen',
      icon: AlertTriangle,
      stepLabel: 'Litige',
      chipTone: 'danger',
    };
  }

  if (f.isCancelled) {
    return {
      title: 'Réservation annulée',
      icon: X,
      stepLabel: 'Annulée',
      chipTone: 'danger',
      notice: {
        title: 'Réservation clôturée',
        text: r.raisonAnnulation
          ? `Motif d'annulation : « ${r.raisonAnnulation} ». Aucun prélèvement ultérieur sur votre compte.`
          : 'Cette réservation a été annulée. Vos créneaux de disponibilité ont été libérés.',
        icon: X,
        tone: 'danger',
      },
    };
  }

  if (f.isPendingPayment) {
    return {
      title: 'Attente du paiement locataire',
      icon: Clock,
      stepLabel: 'Étape 1 sur 4',
      chipTone: 'default',
      notice: {
        title: 'Paiement locataire en cours',
        text: 'Le locataire finalise son règlement d’acompte en ligne. Dès réception du paiement, vous recevrez une alerte pour valider la réservation.',
        icon: Clock,
        tone: 'neutral',
      },
    };
  }

  if (f.isPaid) {
    const deadlineText = formatConfirmationDeadline(r.creeLe, r.dateDebut, r.tacitCheckinDeadlineLe);
    return {
      title: 'Demande reçue — Confirmation requise',
      icon: FileCheck,
      stepLabel: 'Action requise',
      chipTone: 'action',
      notice: {
        title: 'Paiement locataire reçu & sécurisé',
        text: `Le locataire a réglé l’acompte. Vous devez confirmer cette réservation avant le ${deadlineText}. Passé ce délai, la demande sera automatiquement annulée.`,
        icon: ShieldCheck,
        tone: 'action',
      },
    };
  }

  if (f.isConfirmed) {
    if (f.hasOwnerCheckin) {
      return {
        title: 'Check-in hôte validé',
        icon: LogIn,
        stepLabel: 'En attente du locataire',
        chipTone: 'default',
        notice: {
          title: 'État des lieux transmis',
          text: 'Vous avez validé le départ du véhicule. Le locataire procède à la vérification de son côté pour démarrer la location.',
          icon: Info,
          tone: 'neutral',
        },
      };
    }

    return {
      title: 'Remise des clés & Check-in',
      icon: LogIn,
      stepLabel: 'Étape 3 sur 4',
      chipTone: 'action',
      notice: {
        title: 'Préparer la remise du véhicule',
        text: 'Le jour du départ, effectuez l’état des lieux photos avec le locataire puis validez le check-in pour enregistrer le solde.',
        icon: LogIn,
        tone: 'action',
      },
    };
  }

  if (f.isInProgress) {
    return {
      title: 'Location en cours',
      icon: Car,
      stepLabel: 'Étape 4 sur 4',
      chipTone: 'default',
      notice: {
        title: 'Véhicule en circulation',
        text: 'Le véhicule est sous la responsabilité du locataire. À la restitution, effectuez le check-out pour clôturer la location et débloquer vos fonds.',
        icon: Car,
        tone: 'neutral',
      },
    };
  }

  if (f.isCompleted) {
    const net = Number(r.netProprietaire || r.montantProprietaire || 0);
    return {
      title: 'Location clôturée avec succès',
      icon: CheckCircle2,
      stepLabel: 'Terminée',
      chipTone: 'default',
      notice: {
        title: 'Fonds débloqués sur votre solde',
        text: `La location est terminée. Un montant net hôte de ${formatCurrency(net)} FCFA est versé sur votre compte AutoLoc.`,
        icon: Wallet,
        tone: 'success',
      },
    };
  }

  return { title: 'Suivi de la réservation', icon: Clock, chipTone: 'default' };
}

export const OwnerBookingLifecyclePanel: React.FC<OwnerBookingLifecyclePanelProps> = ({
  reservation,
  isSubmitting = false,
  onConfirmReservationClick,
  onCheckinClick,
  onCheckoutClick,
  onCancelClick,
  onSignalNoshowClick,
  onSignalOverloadClick,
  onOpenDisputeClick,
  onRefetch,
}) => {
  const titleId = useId();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statut = (reservation.statut?.toUpperCase() ?? 'INITIEE') as ReservationStatut;
  const hasOwnerCheckin = Boolean(reservation.checkinProprietaireLe || reservation.checkInLe);
  const hasTenantCheckin = Boolean(reservation.checkinLocataireLe);

  const isPendingPayment = statut === 'EN_ATTENTE_PAIEMENT' || statut === 'INITIEE';
  const isPaid = statut === 'PAYEE';
  const isConfirmed = statut === 'CONFIRMEE';
  const isInProgress = statut === 'EN_COURS';
  const isCompleted = statut === 'TERMINEE';
  const isCancelled = statut === 'ANNULEE' || statut === 'EXPIREE';
  const isDispute = statut === 'LITIGE' || Boolean(reservation.litige);

  const flags: Flags = {
    isPendingPayment,
    isPaid,
    isConfirmed,
    isInProgress,
    isCompleted,
    isCancelled,
    isDispute,
    hasOwnerCheckin,
    hasTenantCheckin,
  };

  const view = buildView(flags, reservation);
  const stepStates = getStepStates(flags);
  const HeaderIcon = view.icon;

  const handleRefresh = async () => {
    if (!onRefetch || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7"
    >
      {/* ── 1. En-tête du Lifecycle Panel ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${view.chipTone === 'danger'
                ? 'bg-rose-50 text-rose-600'
                : view.chipTone === 'action'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#F1DFB6]/40 text-[#0A3D2E]'
              }`}
          >
            <HeaderIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>

          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id={titleId} className="font-fraunces text-xl sm:text-2xl font-normal text-[#041912] tracking-tight">
              {view.title}
            </h2>
            {view.stepLabel && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CHIP_CLASS[view.chipTone]}`}
              >
                {view.stepLabel}
              </span>
            )}
          </div>
        </div>

        {onRefetch && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Actualiser le statut"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:cursor-wait"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'text-[#0A3D2E] motion-safe:animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* ── 2. Stepper de progression (masqué si annulée) ────────────────── */}
      {!isCancelled && (
        <ol className="grid grid-cols-4 border-y border-slate-100 py-4">
          {STEP_LABELS.map((label, i) => {
            const state = stepStates[i];
            return (
              <li
                key={label}
                aria-current={state === 'current' ? 'step' : undefined}
                className="relative flex flex-col items-center gap-2 text-center"
              >
                {i < STEP_LABELS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-3.5 h-0.5 w-full -translate-y-1/2 ${state === 'done' ? 'bg-[#0A3D2E]' : 'bg-slate-200'
                      }`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${CIRCLE_CLASS[state]}`}
                >
                  {state === 'done' ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : state === 'alert' ? (
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={`text-xs leading-tight ${STEP_LABEL_CLASS[state]}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* ── 3. Notice d'information contextuelle ─────────────────────────── */}
      {view.notice && (
        <div
          className={`flex items-start gap-3.5 rounded-2xl border p-4 sm:p-5 ${TONE_CLASS[view.notice.tone].panel}`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASS[view.notice.tone].icon}`}
          >
            <view.notice.icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold">{view.notice.title}</h3>
            <p className="text-sm leading-relaxed opacity-90">{view.notice.text}</p>
          </div>
        </div>
      )}

      {/* ── 3.1 Récapitulatif des Options & Conditions avant confirmation (Statut PAYEE) ── */}
      {isPaid && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-700 shrink-0" />
              <h3 className="font-fraunces text-base font-normal text-amber-950">
                Synthèse des options souscrites par le locataire
              </h3>
            </div>
            <span className="self-start sm:self-auto text-[10.5px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 whitespace-nowrap shrink-0">
              Avant confirmation
            </span>
          </div>

          {/* Bandeau d'Alerte Délai Limite de Confirmation */}
          <div className="flex items-center gap-2.5 bg-amber-100/90 border border-amber-300 p-3 rounded-xl text-amber-950 text-xs">
            <Clock className="w-4 h-4 text-amber-800 shrink-0" />
            <p className="leading-snug">
              <strong className="font-bold text-amber-900">Délai limite d'acceptation :</strong> Vous devez confirmer cette demande avant le{' '}
              <span className="font-extrabold text-[#0A3D2E] underline">
                {formatConfirmationDeadline(reservation.creeLe, reservation.dateDebut, reservation.tacitCheckinDeadlineLe)}
              </span>
              . Passé ce délai, le locataire sera intégralement remboursé.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Mode & Adresse de Livraison */}
            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-amber-200/70">
              {reservation.adresseLivraison?.toLowerCase().includes('aibd') ? (
                <Plane className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : reservation.adresseLivraison ? (
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              ) : (
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="block font-bold text-slate-900">Livraison & Remise</span>
                <span className="text-slate-700 font-medium truncate block">
                  {reservation.adresseLivraison
                    ? `Livraison : ${reservation.adresseLivraison}`
                    : 'Retrait sur place (Parking Hôte)'}
                </span>
                {Number(reservation.fraisLivraison || 0) > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 block pt-0.5">
                    + {formatCurrency(Number(reservation.fraisLivraison))} FCFA de livraison inclus
                  </span>
                )}
              </div>
            </div>

            {/* Option Chauffeur */}
            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-amber-200/70">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block font-bold text-slate-900">Conducteur / Chauffeur</span>
                <span className="text-slate-700 font-medium block">
                  {(reservation.vehicule as any)?.avecChauffeur || (reservation.vehicule as any)?.chauffeurInclus
                    ? 'Option Chauffeur Privé souscrite'
                    : 'Conduite par le locataire (Sans chauffeur)'}
                </span>
              </div>
            </div>

            {/* Zone de Déplacement */}
            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-amber-200/70">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block font-bold text-slate-900">Zone de circulation</span>
                <span className="text-slate-700 font-medium block">
                  {(reservation.vehicule as any)?.horsDakar
                    ? 'Trajet Hors Dakar autorisé'
                    : 'Périmètre Dakar Intramuros'}
                </span>
              </div>
            </div>

            {/* Mode de règlement & Solde au Check-in */}
            <div className="flex items-start gap-2.5 bg-white/90 p-3 rounded-xl border border-amber-200/70">
              <CreditCard className="w-4 h-4 text-[#0A3D2E] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="block font-bold text-slate-900">Modalité de paiement</span>
                <span className="text-slate-700 font-medium block">
                  {reservation.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                    ? `Acompte réglé. Solde à encaisser au check-in : ${formatCurrency(Number(reservation.montantSoldeCheckin || 0))} FCFA`
                    : 'Paiement 100% intégral consigné en ligne'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Bloc Litige Dédié Hôte ─────────────────────────────────────── */}
      {isDispute && (
        <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 shrink-0 text-rose-600" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg text-rose-950">Litige en cours d’arbitrage</h3>
                <p className="text-xs text-rose-700">
                  Dossier sous analyse prioritaire par l'équipe AutoLoc
                </p>
              </div>
            </div>
            <span className="rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-800">
              Assistance Arbitrage
            </span>
          </div>

          <p className="text-sm leading-relaxed text-rose-950/80">
            Un médiateur vérifie les photos d’état des lieux et l’historique des échanges. Vos fonds sont sécurisés pendant l’instruction du litige.
          </p>

          <a
            href={SUPPORT_PHONE_HREF}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:w-auto sm:self-start"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Contacter le support Arbitrage Hôte ({SUPPORT_PHONE_DISPLAY})
          </a>
        </div>
      )}

      {/* ── 5. Actions Inline Desktop ──────────────────────────────────────── */}
      <div className="hidden sm:block space-y-3 pt-2">
        {/* Statut PAYEE -> Boutons Confirmer ou Refuser */}
        {isPaid && (
          <div className="flex items-center gap-3">
            {onConfirmReservationClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmReservationClick}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3.5 text-sm font-bold text-[#F1DFB6] shadow-md hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isSubmitting ? 'Confirmation…' : 'Confirmer la réservation'}</span>
              </button>
            )}

            {onCancelClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancelClick}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Refuser la demande</span>
              </button>
            )}
          </div>
        )}

        {/* Statut CONFIRMEE -> Bouton Check-in Hôte + Signalements (No-Show / Surcapacité) */}
        {isConfirmed && (
          <div className="space-y-3">
            {!hasOwnerCheckin && onCheckinClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCheckinClick}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3.5 text-sm font-bold text-[#F1DFB6] shadow-md hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <LogIn className="h-4 w-4 text-[#4ADE80]" />
                <span>{isSubmitting ? 'Validation…' : 'Valider le Check-in (Départ du véhicule)'}</span>
              </button>
            )}

            <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
              {onSignalNoshowClick && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onSignalNoshowClick}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-full hover:bg-amber-100 transition-all disabled:opacity-50"
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>Signaler absence du locataire (No-Show)</span>
                </button>
              )}

              {onSignalOverloadClick && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onSignalOverloadClick}
                  className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Signaler dépassement d’occupants</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Statut EN_COURS -> Bouton Check-out Clôture & Déblocage des fonds */}
        {isInProgress && (
          <div className="flex items-center gap-3">
            {onCheckoutClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCheckoutClick}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3.5 text-sm font-bold text-[#F1DFB6] shadow-md hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-[#4ADE80]" />
                <span>{isSubmitting ? 'Clôture en cours…' : 'Valider le Check-out (Clôturer la location)'}</span>
              </button>
            )}

            {onOpenDisputeClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onOpenDisputeClick}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Signaler un dégât / litige</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 6. MOBILE STICKY BOTTOM BAR (Position fixe ancrée en bas d'écran sur smartphone) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl p-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300">
        {/* Statut PAYEE -> Sticky Confirmer ou Refuser */}
        {isPaid && (
          <div className="flex items-center gap-2">
            {onConfirmReservationClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmReservationClick}
                className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-4 py-3.5 text-xs font-bold text-[#F1DFB6] shadow-lg hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                <span>{isSubmitting ? 'Validation…' : 'Confirmer la réservation'}</span>
              </button>
            )}
            {onCancelClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancelClick}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3.5 py-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Refuser</span>
              </button>
            )}
          </div>
        )}

        {/* Statut CONFIRMEE -> Sticky Check-in Hôte */}
        {isConfirmed && (
          <div className="space-y-2">
            {!hasOwnerCheckin && onCheckinClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCheckinClick}
                className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-4 py-3.5 text-xs font-bold text-[#F1DFB6] shadow-lg hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <LogIn className="h-4 w-4 text-[#4ADE80]" />
                <span>{isSubmitting ? 'Validation…' : 'Valider le Check-in (Départ)'}</span>
              </button>
            )}

            {/* Actions secondaires No-Show / Dépassement */}
            <div className="flex items-center justify-center gap-2">
              {onSignalNoshowClick && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onSignalNoshowClick}
                  className="flex-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 py-2 px-2.5 rounded-full text-center truncate"
                >
                  Signalement No-Show (Absence)
                </button>
              )}
              {onSignalOverloadClick && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onSignalOverloadClick}
                  className="flex-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 py-2 px-2.5 rounded-full text-center truncate"
                >
                  Signalement Surcapacité
                </button>
              )}
            </div>
          </div>
        )}

        {/* Statut EN_COURS -> Sticky Check-out Clôture */}
        {isInProgress && (
          <div className="flex items-center gap-2">
            {onCheckoutClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCheckoutClick}
                className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-4 py-3.5 text-xs font-bold text-[#F1DFB6] shadow-lg hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-[#4ADE80]" />
                <span>{isSubmitting ? 'Clôture…' : 'Valider Check-out (Fin)'}</span>
              </button>
            )}
            {onOpenDisputeClick && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onOpenDisputeClick}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3.5 py-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Litige</span>
              </button>
            )}
          </div>
        )}

        {/* Statut LITIGE -> Sticky Support Arbitrage */}
        {isDispute && (
          <a
            href={SUPPORT_PHONE_HREF}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-rose-700 active:scale-[0.98] transition-all"
          >
            <Phone className="h-4 w-4" />
            <span>Support Arbitrage ({SUPPORT_PHONE_DISPLAY})</span>
          </a>
        )}
      </div>
    </section>
  );
};
