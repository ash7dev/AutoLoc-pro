'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  Car,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck,
  Info,
  Lock,
  LogIn,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';

interface TenantBookingLifecyclePanelProps {
  booking: TenantReservationDetailData;
  isSubmitting?: boolean;
  onConfirmCheckinClick?: () => void;
  onRefuseCheckinClick?: () => void;
  onCancelClick?: () => void;
  onRefetch?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Constantes                                                                 */
/* -------------------------------------------------------------------------- */

/** Part du total demandée en ligne quand l'API ne fournit pas de montant d'acompte. */
const DEPOSIT_RATIO = 0.3;

/** Numéro du support arbitrage / assistance AutoLoc. */
const SUPPORT_PHONE_DISPLAY = '+221 78 663 77 05';
const SUPPORT_PHONE_HREF = 'tel:+221786637705';

type Gateway = 'WAVE' | 'ORANGE_MONEY' | 'CARD';

const GATEWAYS: Array<{ id: Gateway; label: string; logo?: string }> = [
  { id: 'WAVE', label: 'Wave', logo: '/wave.png' },
  { id: 'ORANGE_MONEY', label: 'Orange Money', logo: '/orange_money.jpg' },
  { id: 'CARD', label: 'Carte' },
];

const STEP_LABELS = ['Paiement', 'Accord hôte', 'Check-in', 'Location'] as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const longDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** "EN_EXAMEN" -> "En examen" */
const humanize = (value: string) =>
  value.charAt(0) + value.slice(1).replace(/_/g, ' ').toLowerCase();

/* -------------------------------------------------------------------------- */
/* Étapes                                                                     */
/* -------------------------------------------------------------------------- */

type StepState = 'done' | 'current' | 'upcoming' | 'alert';

interface Flags {
  isPendingPayment: boolean;
  isPaid: boolean;
  isConfirmed: boolean;
  isInProgress: boolean;
  isCompleted: boolean;
  isCancelled: boolean;
  isDispute: boolean;
  canTenantValidateCheckin: boolean;
}

function getStepStates(f: Flags, hasTenantCheckin: boolean): StepState[] {
  // Litige : l'étape en cause est en alerte, celles d'avant sont acquises
  if (f.isDispute) {
    const alertIndex = hasTenantCheckin ? 3 : 2;
    return STEP_LABELS.map((_, i) =>
      i < alertIndex ? 'done' : i === alertIndex ? 'alert' : 'upcoming',
    );
  }

  // Index de l'étape en cours ; 4 = tout est terminé
  let current = 0;
  if (f.isPaid) current = 1;
  else if (f.isConfirmed) current = hasTenantCheckin ? 3 : 2;
  else if (f.isInProgress) current = 3;
  else if (f.isCompleted) current = 4;

  return STEP_LABELS.map((_, i) =>
    i < current ? 'done' : i === current ? 'current' : 'upcoming',
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

const STEP_SR_TEXT: Record<StepState, string> = {
  done: ', terminé',
  current: ', en cours',
  alert: ', problème signalé',
  upcoming: ', à venir',
};

/* -------------------------------------------------------------------------- */
/* Contenu par statut                                                         */
/* -------------------------------------------------------------------------- */

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

function buildView(f: Flags, booking: TenantReservationDetailData): LifecycleView {
  // Litige : tout le contenu est porté par le bloc dédié, pas de notice en plus
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
        title: 'Réservation annulée',
        text: booking.raisonAnnulation
          ? `Motif d’annulation : « ${booking.raisonAnnulation} ». Cette réservation est désormais clôturée.`
          : 'Cette réservation a été annulée. Aucun prélèvement ultérieur ne sera effectué.',
        icon: X,
        tone: 'danger',
      },
    };
  }

  // Paiement : le message est porté par la carte de règlement
  if (f.isPendingPayment) {
    return {
      title: 'Paiement de la réservation',
      icon: CreditCard,
      stepLabel: 'Étape 1 sur 4',
      chipTone: 'default',
    };
  }

  if (f.isPaid) {
    return {
      title: 'Confirmation de l’hôte',
      icon: FileCheck,
      stepLabel: 'Étape 2 sur 4',
      chipTone: 'default',
      notice: {
        title: 'Validation hôte en cours',
        text: 'Votre paiement est sécurisé par un tiers de confiance. L’hôte va confirmer l’horaire et le lieu exact de rencontre.',
        icon: ShieldCheck,
        tone: 'neutral',
      },
    };
  }

  if (f.isConfirmed) {
    if (f.canTenantValidateCheckin) {
      return {
        title: 'Check-in',
        icon: LogIn,
        stepLabel: 'Action requise',
        chipTone: 'action',
        notice: {
          title: 'État des lieux déposé par l’hôte',
          text: 'L’hôte a pris les photos de départ et validé son inspection. Inspectez le véhicule, puis validez pour débloquer la prise en charge.',
          icon: Info,
          tone: 'action',
        },
      };
    }

    const arrival = parseDate(booking.dateDebut);
    return {
      title: 'Check-in',
      icon: LogIn,
      stepLabel: 'Étape 3 sur 4',
      chipTone: 'default',
      notice: {
        title: 'En attente de l’état des lieux',
        text: `L’hôte réalisera les photos le jour de votre arrivée${arrival ? `, le ${longDate.format(arrival)}` : ''
          }. Vous pourrez les vérifier et les valider ici pour débloquer l’accès.`,
        icon: Clock,
        tone: 'neutral',
      },
    };
  }

  if (f.isInProgress) {
    return {
      title: 'Location active',
      icon: Car,
      stepLabel: 'Étape 4 sur 4',
      chipTone: 'default',
      notice: {
        title: 'Voyage en cours en toute sécurité',
        text: 'Pendant la location, l’assistance AutoLoc est disponible 7j/7. L’hôte réalisera le check-out à la restitution du véhicule.',
        icon: Car,
        tone: 'neutral',
      },
    };
  }

  if (f.isCompleted) {
    return {
      title: 'Location terminée',
      icon: CheckCircle2,
      stepLabel: 'Terminée',
      chipTone: 'default',
      notice: {
        title: 'Restitution validée',
        text: 'Le véhicule a été restitué et la caution libérée. Merci de partager votre expérience en laissant une évaluation.',
        icon: CheckCircle2,
        tone: 'success',
      },
    };
  }

  return { title: 'Suivi de votre réservation', icon: Clock, chipTone: 'default' };
}

/* -------------------------------------------------------------------------- */
/* Composant                                                                  */
/* -------------------------------------------------------------------------- */

export const TenantBookingLifecyclePanel: React.FC<TenantBookingLifecyclePanelProps> = ({
  booking,
  isSubmitting = false,
  onConfirmCheckinClick,
  onRefuseCheckinClick,
  onCancelClick,
  onRefetch,
}) => {
  const titleId = useId();
  const gatewayGroupName = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<Gateway>('WAVE');
  const [phoneNumber, setPhoneNumber] = useState(booking.locataire?.telephone || '');

  /* ------------------------------ Statut --------------------------------- */

  const statut = booking.statut?.toUpperCase() ?? 'EN_ATTENTE_PAIEMENT';
  const hasOwnerCheckin = Boolean(booking.checkinProprietaireLe);
  const hasTenantCheckin = Boolean(booking.checkinLocataireLe);

  const isPendingPayment = statut === 'EN_ATTENTE_PAIEMENT' || statut === 'INITIEE';
  const isPaid = statut === 'PAYEE';
  const isConfirmed = statut === 'CONFIRMEE';
  const isInProgress = statut === 'EN_COURS';
  const isCompleted = statut === 'TERMINEE';
  const isCancelled = statut === 'ANNULEE';
  const isDispute = statut === 'LITIGE' || Boolean(booking.litige);

  const canTenantValidateCheckin = isConfirmed && hasOwnerCheckin && !hasTenantCheckin;
  const canCancel =
    ['EN_ATTENTE_PAIEMENT', 'INITIEE', 'PAYEE', 'CONFIRMEE'].includes(statut) && !hasTenantCheckin;

  const flags: Flags = {
    isPendingPayment,
    isPaid,
    isConfirmed,
    isInProgress,
    isCompleted,
    isCancelled,
    isDispute,
    canTenantValidateCheckin,
  };
  const view = buildView(flags, booking);
  const stepStates = getStepStates(flags, hasTenantCheckin);
  const HeaderIcon = view.icon;

  /* ------------------------------ Montants ------------------------------- */

  const total = toNumber(booking.prixTotal);
  const paid = toNumber(booking.montantPayeEnLigne ?? booking.paiement?.montant);
  const depositDue = paid > 0 ? paid : Math.round(total * DEPOSIT_RATIO);
  const apiBalance = toNumber(booking.montantSoldeCheckin);
  // Acompte + solde = total, même quand l'API ne renvoie pas le solde
  const balanceDue = apiBalance > 0 ? apiBalance : Math.max(0, total - depositDue);

  const litigeText =
    booking.litige?.description || booking.litige?.commentaire || booking.litige?.motif;

  const hasActions = canTenantValidateCheckin || (canCancel && Boolean(onCancelClick));

  /* ------------------------------ Actions -------------------------------- */

  const handleRefresh = async () => {
    if (!onRefetch || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLaunchPayment = () => {
    if (booking.paymentUrl) {
      window.open(booking.paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // <dialog> natif : focus piégé dans la modale, fermeture avec Échap
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showPaymentModal && !dialog.open) dialog.showModal();
    if (!showPaymentModal && dialog.open) dialog.close();
  }, [showPaymentModal]);

  // Si le statut change pendant que la modale est ouverte (rafraîchissement), on la ferme
  useEffect(() => {
    if (!isPendingPayment) setShowPaymentModal(false);
  }, [isPendingPayment]);

  const gatewayLabel = selectedGateway === 'WAVE' ? 'Wave' : 'Orange Money';

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7"
    >
      {/* 1. En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${view.chipTone === 'danger'
                ? 'bg-rose-50 text-rose-600'
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
            aria-label="Actualiser le suivi"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 disabled:cursor-wait"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'text-[#0A3D2E] motion-safe:animate-spin' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* 2. Progression (masquée si annulée) */}
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
                  <span className="sr-only">{STEP_SR_TEXT[state]}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* 3. Message de statut */}
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

      {/* 4. Litige */}
      {isDispute && (
        <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 shrink-0 text-rose-600" aria-hidden="true" />
              <div>
                <h3 className="font-display text-lg text-rose-950">Suivi du litige</h3>
                <p className="text-xs text-rose-700">
                  {booking.litige?.id
                    ? `Dossier ${booking.litige.id.slice(0, 8).toUpperCase()}`
                    : 'Dossier sous examen'}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-800">
              {humanize(booking.litige?.statut || 'EN_EXAMEN')}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-rose-950/80">
            Un conseiller AutoLoc analyse l’historique et les photos de la réservation. Les
            actions de location sont suspendues pendant l’examen du dossier.
          </p>

          <div className="rounded-xl border border-rose-200/80 bg-white p-4">
            <p className="text-xs font-semibold text-slate-900">Signalement</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {litigeText || 'Signalement transmis lors du check-in.'}
            </p>
          </div>

          <a
            href={SUPPORT_PHONE_HREF}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:w-auto sm:self-start"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Appeler le support ({SUPPORT_PHONE_DISPLAY})
          </a>
        </div>
      )}

      {/* 5. Règlement de l'acompte */}
      {isPendingPayment && (
        <div className="space-y-5 rounded-3xl bg-[#0A3D2E] p-5 text-[#F1DFB6] shadow-xl shadow-[#0A3D2E]/15 sm:p-6">
          <div className="space-y-1">
            <h3 className="font-display text-xl">Règlement de l’acompte en ligne</h3>
            <p className="text-sm leading-relaxed text-[#F1DFB6]/75">
              Afin de bloquer définitivement les dates du véhicule, procédez au règlement de
              l’acompte en ligne.
            </p>
          </div>

          <div>
            <p className="text-sm text-[#F1DFB6]/70">Acompte à payer</p>
            <p className="font-display text-4xl leading-tight tabular-nums">
              {formatCurrency(depositDue)}
              <span className="ml-2 font-sans text-sm text-[#F1DFB6]/60">FCFA</span>
            </p>
          </div>

          <dl className="space-y-1.5 border-t border-[#F1DFB6]/15 pt-4 text-sm">
            <div className="flex justify-between gap-4 text-[#F1DFB6]/75">
              <dt>Solde à la remise des clés</dt>
              <dd className="tabular-nums text-[#F1DFB6]">{formatCurrency(balanceDue)} FCFA</dd>
            </div>
            <div className="flex justify-between gap-4 text-[#F1DFB6]/75">
              <dt>Total de la location</dt>
              <dd className="tabular-nums text-[#F1DFB6]">{formatCurrency(total)} FCFA</dd>
            </div>
          </dl>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              aria-haspopup="dialog"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F1DFB6] px-6 py-3.5 text-base font-semibold text-[#041912] transition-colors hover:bg-[#F7E9C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E]"
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Payer {formatCurrency(depositDue)} FCFA
            </button>

            {booking.paymentUrl && (
              <a
                href={booking.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#F1DFB6]/80 underline-offset-4 hover:text-[#F1DFB6] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A3D2E]"
              >
                Ouvrir le lien de paiement
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>

          <p className="flex items-center gap-2 text-xs text-[#F1DFB6]/70">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Paiement sécurisé par un tiers de confiance : Wave, Orange Money ou carte.
          </p>
        </div>
      )}

      {/* 6. Actions Inline (Visibles sur Desktop, secondaires gardées sur mobile dans le panel) */}
      {hasActions && (
        <div className="space-y-4">
          {canTenantValidateCheckin && (
            <div className="hidden sm:flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmCheckinClick}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3.5 text-sm font-semibold text-[#F1DFB6] shadow-md transition-colors hover:bg-[#0F4F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {isSubmitting ? 'Validation…' : 'Confirmer la prise en charge'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onRefuseCheckinClick}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Signaler un problème
              </button>
            </div>
          )}

          {/* Action destructive secondaire : toujours présente dans le panel */}
          {canCancel && onCancelClick && (
            <div className={canTenantValidateCheckin ? 'border-t border-slate-100 pt-4' : ''}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancelClick}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-rose-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Annuler la réservation
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6b. Mobile Sticky Bottom Bar (Position fixe en bas d'écran sur mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300">
        {isPendingPayment && (
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3.5 text-sm font-bold text-[#F1DFB6] shadow-lg hover:bg-[#0F4F3B] active:scale-[0.98] transition-all"
          >
            <CreditCard className="h-4 w-4 text-[#F1DFB6]" />
            Payer l’acompte ({formatCurrency(depositDue)} FCFA)
          </button>
        )}

        {canTenantValidateCheckin && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirmCheckinClick}
              className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-4 py-3.5 text-xs font-bold text-[#F1DFB6] shadow-lg hover:bg-[#0F4F3B] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Validation…' : 'Confirmer le check-in'}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onRefuseCheckinClick}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3.5 py-3.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Signaler</span>
            </button>
          </div>
        )}

        {isDispute && (
          <a
            href={SUPPORT_PHONE_HREF}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-rose-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-rose-700 active:scale-[0.98] transition-all"
          >
            <Phone className="h-4 w-4" />
            <span>Appeler le support ({SUPPORT_PHONE_DISPLAY})</span>
          </a>
        )}

        {isInProgress && !isDispute && (
          <a
            href={SUPPORT_PHONE_HREF}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-800 active:scale-[0.98] transition-all"
          >
            <Phone className="h-4 w-4" />
            <span>Assistance AutoLoc 7j/7 ({SUPPORT_PHONE_DISPLAY})</span>
          </a>
        )}
      </div>

      {/* 7. Modale de paiement (<dialog> natif) */}
      {isPendingPayment && (
        <dialog
          ref={dialogRef}
          onClose={() => setShowPaymentModal(false)}
          onClick={(e) => {
            // Clic sur le fond assombri
            if (e.target === e.currentTarget) setShowPaymentModal(false);
          }}
          aria-labelledby={`${titleId}-payment`}
          className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/60"
        >
          <div className="space-y-6 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={`${titleId}-payment`} className="font-display text-xl text-[#041912]">
                  Finaliser le paiement
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">Choisissez votre moyen de paiement.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <fieldset className="grid grid-cols-3 gap-3">
              <legend className="sr-only">Moyen de paiement</legend>
              {GATEWAYS.map((gateway) => (
                <label
                  key={gateway.id}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-200 p-3.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 has-[:checked]:border-[#0A3D2E] has-[:checked]:bg-[#0A3D2E]/[0.04] has-[:checked]:text-[#0A3D2E] has-[:checked]:ring-1 has-[:checked]:ring-[#0A3D2E] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0A3D2E] has-[:focus-visible]:ring-offset-2"
                >
                  <input
                    type="radio"
                    name={gatewayGroupName}
                    value={gateway.id}
                    checked={selectedGateway === gateway.id}
                    onChange={() => setSelectedGateway(gateway.id)}
                    className="sr-only"
                  />
                  {gateway.logo ? (
                    <Image
                      src={gateway.logo}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <CreditCard className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                  )}
                  {gateway.label}
                </label>
              ))}
            </fieldset>

            {selectedGateway !== 'CARD' && (
              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-800">
                    Numéro {gatewayLabel}
                  </span>
                  <span className="flex items-center overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 focus-within:ring-2 focus-within:ring-[#0A3D2E]">
                    <span className="border-r border-slate-200 bg-slate-100 px-3.5 py-3 text-sm font-semibold text-slate-700">
                      +221
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="77 000 00 00"
                      className="w-full bg-transparent px-3.5 py-3 text-base font-medium text-slate-900 focus:outline-none sm:text-sm"
                    />
                  </span>
                </label>
                <p className="text-xs text-slate-500">
                  Le compte {gatewayLabel} associé recevra la demande de confirmation.
                </p>
              </div>
            )}

            <div className="flex items-baseline justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <span className="text-sm font-medium text-slate-700">Montant à débiter</span>
              <span className="font-display text-2xl tabular-nums text-[#0A3D2E]">
                {formatCurrency(depositDue)}
                <span className="ml-1.5 font-sans text-sm text-slate-500">FCFA</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="cursor-pointer rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleLaunchPayment}
                  disabled={!booking.paymentUrl}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-3 text-sm font-semibold text-[#F1DFB6] shadow-md transition-colors hover:bg-[#0F4F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  Payer {formatCurrency(depositDue)} FCFA
                </button>
              </div>

              {!booking.paymentUrl && (
                <p role="status" className="text-right text-xs text-amber-700">
                  Le lien de paiement n’est pas encore disponible. Actualisez le suivi puis
                  réessayez.
                </p>
              )}
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
};