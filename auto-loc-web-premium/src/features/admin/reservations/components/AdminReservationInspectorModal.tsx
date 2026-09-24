'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  Clock,
  Camera,
  Wallet,
  User,
  FileText,
  Phone,
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Car,
} from 'lucide-react';
import type { AdminReservationQueueItem } from '../../../../core/api/adminAnalyticsApi';
import { formatCurrency } from '@/lib/utils';

interface AdminReservationInspectorModalProps {
  reservation: AdminReservationQueueItem | null;
  detailData?: any;
  isOpen: boolean;
  onClose: () => void;
  onForceConfirm: (id: string) => Promise<void>;
  onForceComplete: (id: string) => Promise<void>;
  onForceCancel: (id: string, raison?: string) => Promise<void>;
  isMutating?: boolean;
}

type TabId = 'TIMELINE' | 'PHOTOS_ETAT' | 'FINANCES' | 'CONTACTS';
type PhotoType = 'CHECKIN' | 'CHECKOUT';
type PendingAction = 'CONFIRM' | 'COMPLETE' | null;

interface EtatPhoto {
  id?: string;
  url: string;
  categorie?: string;
  type?: string;
}

interface Person {
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };
const GOLD = '#b27c2d';

const CARD =
  'rounded-3xl border border-slate-200/70 bg-white p-5 dark:border-slate-800 dark:bg-slate-950';
const TEXT = 'text-slate-900 dark:text-white';
const MUTED = 'text-slate-500 dark:text-slate-400';

const PRESET_CANCEL_REASONS = [
  "Paiement en ligne incomplet ou rejeté par l'opérateur",
  'Véhicule indisponible ou en panne avant la prise en main',
  "Pièces d'identité ou permis non présentés au check-in",
  "Annulation d'urgence demandée par le locataire",
  "Annulation d'urgence demandée par l'hôte",
];

const DEFAULT_CANCEL_REASON = "Annulation forcée par l'administrateur";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'TIMELINE', label: 'Suivi', icon: Clock },
  { id: 'PHOTOS_ETAT', label: 'États des lieux', icon: Camera },
  { id: 'FINANCES', label: 'Finances', icon: Wallet },
  { id: 'CONTACTS', label: 'Contacts', icon: User },
];

const STATUS_META: Record<string, { label: string; dot: string }> = {
  PAYEE: { label: 'Payée', dot: 'bg-emerald-400' },
  EN_COURS: { label: 'En cours', dot: 'bg-sky-300' },
  TERMINEE: { label: 'Terminée', dot: 'bg-[#F1DFB6]' },
  ANNULEE: { label: 'Annulée', dot: 'bg-rose-400' },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
type DateInput = string | number | Date | null | undefined;

const humanize = (v?: string | null) => {
  if (!v) return '';
  const s = v.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const fmtDate = (v: DateInput) => {
  if (!v) return '–';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDateTime = (v: DateInput) => {
  if (!v) return '–';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '–';
  return `${fmtDate(d)} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function LedgerRow({
  label,
  value,
  color,
  strong = false,
}: {
  label: string;
  value: number;
  color?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3.5">
      <dt className={`text-sm ${strong ? `font-semibold ${TEXT}` : MUTED}`}>{label}</dt>
      <dd
        className={`tabular-nums ${strong ? 'text-lg font-semibold' : 'text-sm font-medium'} ${color ? '' : TEXT
          }`}
        style={color ? { color } : undefined}
      >
        {formatCurrency(value)}
      </dd>
    </div>
  );
}

function PersonCard({
  role,
  person,
  kyc,
}: {
  role: string;
  person?: Person | null;
  kyc?: string | null;
}) {
  const phone = person?.telephone ?? '';
  const tel = phone.replace(/[^\d+]/g, '');
  const wa = phone.replace(/\D/g, '');
  const initials = `${person?.prenom?.[0] ?? ''}${person?.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const kycOk = kyc ? /VERIF|VALID/i.test(kyc) : false;
  const fullName = `${person?.prenom ?? ''} ${person?.nom ?? ''}`.trim() || 'Non renseigné';

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm font-semibold ${TEXT}`}>{role}</span>
        {kyc && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${kycOk
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20'
                : 'bg-amber-50 text-amber-800 ring-amber-600/20'
              }`}
          >
            {kycOk ? 'KYC vérifié' : `KYC ${humanize(kyc).toLowerCase()}`}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span
          style={DISPLAY_FONT}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A3D2E] text-lg text-[#F1DFB6]"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${TEXT}`}>{fullName}</p>
          {person?.email ? (
            <a
              href={`mailto:${person.email}`}
              className={`block truncate text-xs ${MUTED} hover:text-[#0A3D2E] dark:hover:text-[#F1DFB6]`}
            >
              {person.email}
            </a>
          ) : (
            <p className={`text-xs ${MUTED}`}>Email non renseigné</p>
          )}
          {phone && <p className={`text-xs tabular-nums ${MUTED}`}>{phone}</p>}
        </div>
      </div>

      {tel && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`tel:${tel}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A3D2E]/25 px-3 py-2.5 text-sm font-medium text-[#0A3D2E] transition hover:bg-[#0A3D2E]/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] dark:border-[#F1DFB6]/30 dark:text-[#F1DFB6] dark:hover:bg-[#F1DFB6]/10"
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3D2E] px-3 py-2.5 text-sm font-medium text-[#F1DFB6] transition hover:bg-[#0D4B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export const AdminReservationInspectorModal: React.FC<AdminReservationInspectorModalProps> = ({
  reservation,
  detailData,
  isOpen,
  onClose,
  onForceConfirm,
  onForceComplete,
  onForceCancel,
  isMutating,
}) => {
  const uid = useId();
  const [activeTab, setActiveTab] = useState<TabId>('TIMELINE');
  const [activePhotoType, setActivePhotoType] = useState<PhotoType>('CHECKIN');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [selectedPresetReason, setSelectedPresetReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lbCloseRef = useRef<HTMLButtonElement>(null);
  const photoTriggerRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const isVisible = isOpen && !!reservation;
  const resData = detailData || reservation;
  const allPhotos: EtatPhoto[] = resData?.photosEtatLieu ?? [];
  const photosCheckin = allPhotos.filter((p) => p.type === 'CHECKIN');
  const photosCheckout = allPhotos.filter((p) => p.type === 'CHECKOUT');
  const activePhotos = activePhotoType === 'CHECKIN' ? photosCheckin : photosCheckout;
  const lightboxOpen = lightboxIndex !== null;

  // Réinitialise l'état à chaque ouverture ou changement de réservation
  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('TIMELINE');
    setActivePhotoType('CHECKIN');
    setShowCancelForm(false);
    setPendingAction(null);
    setSelectedPresetReason('');
    setCustomReason('');
    setLightboxIndex(null);
  }, [isOpen, reservation?.id]);

  // Verrouille le scroll de la page, place le focus, le restitue à la fermeture
  useEffect(() => {
    if (!isVisible) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [isVisible]);

  // Focus de la visionneuse
  useEffect(() => {
    if (!lightboxOpen) return;
    lbCloseRef.current?.focus();
    const trigger = photoTriggerRef.current;
    return () => trigger?.focus();
  }, [lightboxOpen]);

  // Clavier : Échap, flèches de la visionneuse, piège de focus
  useEffect(() => {
    if (!isVisible) return;
    const count = activePhotos.length;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (lightboxIndex !== null) setLightboxIndex(null);
        else if (!isMutating) onClose();
        return;
      }

      if (lightboxIndex !== null && count > 1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setLightboxIndex((lightboxIndex + 1) % count);
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setLightboxIndex((lightboxIndex - 1 + count) % count);
          return;
        }
      }

      if (e.key === 'Tab') {
        const root = lightboxIndex !== null ? lightboxRef.current : dialogRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !root.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isVisible, lightboxIndex, activePhotos.length, isMutating, onClose]);

  if (!isVisible || !reservation) return null;

  const titleId = `${uid}-title`;
  const refId = `#RES-${reservation.id.slice(0, 8).toUpperCase()}`;
  const statusMeta = STATUS_META[reservation.statut] ?? {
    label: humanize(reservation.statut),
    dot: 'bg-amber-300',
  };
  const isClosedStatus = reservation.statut === 'ANNULEE' || reservation.statut === 'TERMINEE';
  const canConfirm = reservation.statut === 'PAYEE';
  const canComplete = reservation.statut === 'EN_COURS';
  const canCancel = !isClosedStatus;
  const hasActions = canConfirm || canComplete || canCancel;
  const nbJours = reservation.nbJours || 1;

  const commission = Number(reservation.commission || 0);
  const net = Number(reservation.montantProprietaire || 0);
  const split = commission + net;
  const commissionShare = split > 0 ? Math.round((commission / split) * 100) : 0;

  const steps = [
    {
      key: 'created',
      label: 'Réservation créée',
      done: true,
      detail: fmtDateTime(reservation.creeLe),
    },
    {
      key: 'payment',
      label: 'Acompte en ligne',
      done: !!reservation.montantPayeEnLigne,
      detail: reservation.montantPayeEnLigne
        ? `${formatCurrency(Number(reservation.montantPayeEnLigne))} via ${reservation.paiement?.fournisseur || 'paiement en ligne'
        }`
        : 'En attente de paiement',
    },
    {
      key: 'confirm',
      label: "Confirmation par l'hôte",
      done: !!reservation.confirmeeLe,
      detail: reservation.confirmeeLe
        ? `Confirmée le ${fmtDateTime(reservation.confirmeeLe)}`
        : "En attente de la confirmation de l'hôte",
    },
    {
      key: 'checkin',
      label: 'Prise en main',
      done: !!reservation.checkInLe,
      detail: reservation.checkInLe
        ? `Effectuée le ${fmtDateTime(reservation.checkInLe)}, ${plural(photosCheckin.length, 'photo')}`
        : `Prévue le ${fmtDate(reservation.dateDebut)}`,
    },
    {
      key: 'checkout',
      label: 'Restitution',
      done: !!reservation.checkOutLe,
      detail: reservation.checkOutLe
        ? `Restituée le ${fmtDateTime(reservation.checkOutLe)}`
        : `Prévue le ${fmtDate(reservation.dateFin)}`,
    },
  ];
  const currentIndex = isClosedStatus ? -1 : steps.findIndex((s) => !s.done);

  const vehiclePhoto = reservation.vehicule?.photos?.[0]?.url;

  /* Actions */
  const handleConfirmCancel = async () => {
    const reason =
      [selectedPresetReason, customReason.trim()].filter(Boolean).join(' — ') ||
      DEFAULT_CANCEL_REASON;
    try {
      await onForceCancel(reservation.id, reason);
      setShowCancelForm(false);
    } catch {
      /* l'erreur est affichée par le parent, le formulaire reste ouvert */
    }
  };

  const handleRunPending = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction === 'CONFIRM') await onForceConfirm(reservation.id);
      else await onForceComplete(reservation.id);
      setPendingAction(null);
    } catch {
      /* l'erreur est affichée par le parent */
    }
  };

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === activeTab);
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    if (next === -1) return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const primaryBtn =
    'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A3D2E] px-4 py-3.5 text-sm font-semibold text-[#F1DFB6] shadow-lg shadow-[#0A3D2E]/20 transition hover:bg-[#0D4B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-[#04140E]/70 p-0 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none sm:items-center sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isMutating) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(10,61,46,0.45)] dark:bg-slate-900 sm:h-auto sm:max-h-[92vh] sm:rounded-[28px]"
      >
        {/* En-tête */}
        <header className="flex shrink-0 items-start justify-between gap-4 bg-[#0A3D2E] px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2
                id={titleId}
                style={DISPLAY_FONT}
                className="truncate text-2xl leading-tight text-[#F1DFB6]"
              >
                Réservation {refId}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F1DFB6]/30 px-2.5 py-1 text-xs font-medium text-[#F1DFB6]">
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-100/70">
              Créée le {fmtDate(reservation.creeLe)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {reservation.contratUrl && (
              <a
                href={reservation.contratUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#F1DFB6]/30 px-4 py-2 text-sm font-medium text-[#F1DFB6] transition hover:bg-[#F1DFB6]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6]"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contrat PDF</span>
                <span className="sr-only sm:hidden">Contrat PDF</span>
              </a>
            )}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              disabled={isMutating}
              aria-label="Fermer"
              className="rounded-full p-2 text-[#F1DFB6]/80 transition hover:bg-[#F1DFB6]/10 hover:text-[#F1DFB6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Corps */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto bg-[#F6F7F5] p-6 dark:bg-slate-950/40 lg:grid-cols-12">
          {/* Colonne gauche */}
          <div className="space-y-5 lg:col-span-7">
            <div className="overflow-x-auto">
              <div
                role="tablist"
                aria-label="Sections de la réservation"
                onKeyDown={onTabKeyDown}
                className="inline-flex items-center rounded-full bg-[#0A3D2E]/[0.07] p-1"
              >
                {TABS.map((tab) => {
                  const selected = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[tab.id] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${tab.id}`}
                      aria-selected={selected}
                      aria-controls={`${uid}-panel`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${selected
                          ? 'bg-[#0A3D2E] text-[#F1DFB6] shadow'
                          : 'text-slate-600 hover:text-[#0A3D2E] dark:text-slate-400 dark:hover:text-[#F1DFB6]'
                        }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                      {tab.id === 'PHOTOS_ETAT' && (
                        <span
                          className={`rounded-full px-1.5 text-xs tabular-nums ${selected ? 'bg-[#F1DFB6]/20' : 'bg-[#0A3D2E]/10'
                            }`}
                        >
                          {allPhotos.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              role="tabpanel"
              id={`${uid}-panel`}
              aria-labelledby={`${uid}-tab-${activeTab}`}
              className="space-y-4"
            >
              {/* Suivi */}
              {activeTab === 'TIMELINE' && (
                <div className={CARD}>
                  <h3 className={`text-sm font-semibold ${TEXT}`}>Suivi de la location</h3>
                  <ol className="mt-5">
                    {steps.map((s, i) => {
                      const isCurrent = i === currentIndex;
                      const isLast = i === steps.length - 1;
                      return (
                        <li key={s.key} className="relative flex gap-4 pb-7 last:pb-0">
                          {!isLast && (
                            <span
                              aria-hidden
                              className={`absolute bottom-0 left-[13px] top-7 w-px ${s.done ? 'bg-[#0A3D2E]' : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                            />
                          )}
                          <span
                            className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.done
                                ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                                : isCurrent
                                  ? 'border-2 border-[#0A3D2E] bg-white dark:bg-slate-950'
                                  : 'border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950'
                              }`}
                          >
                            {s.done ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : isCurrent ? (
                              <span className="h-2 w-2 rounded-full bg-[#0A3D2E]" />
                            ) : null}
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <p
                              className={`text-sm font-semibold ${s.done || isCurrent ? TEXT : MUTED
                                }`}
                            >
                              {s.label}
                              {isCurrent && (
                                <span className="ml-2 rounded-full bg-[#F1DFB6]/60 px-2 py-0.5 text-xs font-medium text-[#0A3D2E]">
                                  Prochaine étape
                                </span>
                              )}
                            </p>
                            <p className={`mt-0.5 text-xs ${MUTED}`}>{s.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {/* États des lieux */}
              {activeTab === 'PHOTOS_ETAT' && (
                <div className="space-y-4">
                  <div
                    role="radiogroup"
                    aria-label="Type d'état des lieux"
                    className="inline-flex rounded-full bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800"
                  >
                    {(
                      [
                        { id: 'CHECKIN', label: 'Check-in', count: photosCheckin.length },
                        { id: 'CHECKOUT', label: 'Check-out', count: photosCheckout.length },
                      ] as { id: PhotoType; label: string; count: number }[]
                    ).map((opt) => {
                      const selected = activePhotoType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setActivePhotoType(opt.id)}
                          className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] ${selected
                              ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                              : 'text-slate-600 hover:text-[#0A3D2E] dark:text-slate-400'
                            }`}
                        >
                          {opt.label}
                          <span className="ml-1.5 tabular-nums opacity-70">{opt.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activePhotos.length > 0 ? (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {activePhotos.map((p, idx) => (
                        <li key={p.id || idx}>
                          <button
                            type="button"
                            onClick={(e) => {
                              photoTriggerRef.current = e.currentTarget;
                              setLightboxIndex(idx);
                            }}
                            aria-label={`Agrandir la photo ${idx + 1}${p.categorie ? `, ${p.categorie}` : ''
                              }`}
                            className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] dark:ring-slate-800"
                          >
                            <Image
                              src={p.url}
                              alt={`${activePhotoType === 'CHECKIN' ? 'Check-in' : 'Check-out'} ${idx + 1}`}
                              fill
                              className="object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                              unoptimized
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-[#04140E]/0 text-white opacity-0 transition group-hover:bg-[#04140E]/40 group-hover:opacity-100 group-focus-visible:bg-[#04140E]/40 group-focus-visible:opacity-100">
                              <Maximize2 className="h-5 w-5" />
                            </span>
                            <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
                              {p.categorie || `Photo ${idx + 1}`}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={`${CARD} flex flex-col items-center py-12 text-center`}>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A3D2E] text-[#F1DFB6]">
                        <Camera className="h-5 w-5" />
                      </span>
                      <p style={DISPLAY_FONT} className="mt-4 text-lg text-[#0A3D2E] dark:text-[#F1DFB6]">
                        Aucune photo
                      </p>
                      <p className={`mt-1 max-w-xs text-sm ${MUTED}`}>
                        {activePhotoType === 'CHECKIN'
                          ? "Aucune photo n'a été prise lors de la prise en main."
                          : "Aucune photo n'a été prise lors de la restitution."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Finances */}
              {activeTab === 'FINANCES' && (
                <div className={CARD}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${TEXT}`}>Ventilation financière</h3>
                    {reservation.modePaiement && (
                      <span className="rounded-full bg-[#0A3D2E]/[0.07] px-2.5 py-1 text-xs font-medium text-[#0A3D2E] dark:text-[#F1DFB6]">
                        Paiement : {humanize(reservation.modePaiement).toLowerCase()}
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                    <LedgerRow
                      label="Prix total de la réservation"
                      value={Number(reservation.prixTotal || 0)}
                    />
                    <LedgerRow
                      label="Acompte perçu en ligne"
                      value={Number(reservation.montantPayeEnLigne || 0)}
                      color="#047857"
                    />
                    <LedgerRow label="Commission AutoLoc" value={commission} color={GOLD} />
                    <LedgerRow label="Net hôte" value={net} strong />
                  </dl>

                  {split > 0 && (
                    <div className="mt-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div
                        role="img"
                        aria-label={`Net hôte ${100 - commissionShare} %, commission AutoLoc ${commissionShare} %`}
                        className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      >
                        <div className="bg-[#0A3D2E]" style={{ width: `${100 - commissionShare}%` }} />
                        <div className="bg-[#F1DFB6]" style={{ width: `${commissionShare}%` }} />
                      </div>
                      <div className={`mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs ${MUTED}`}>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#0A3D2E]" />
                          Net hôte {100 - commissionShare} %
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#F1DFB6]" />
                          Commission {commissionShare} %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contacts */}
              {activeTab === 'CONTACTS' && (
                <div className="space-y-4">
                  <PersonCard
                    role="Locataire"
                    person={reservation.locataire}
                    kyc={reservation.locataire?.statutKyc}
                  />
                  <PersonCard role="Hôte" person={reservation.proprietaire} />
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <aside className="space-y-5 self-start lg:sticky lg:top-0 lg:col-span-5">
            {/* Véhicule et période */}
            <div className={`${CARD} overflow-hidden p-0`}>
              <div className="relative h-40 bg-[#0A3D2E]/10">
                {vehiclePhoto ? (
                  <Image src={vehiclePhoto} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#0A3D2E]/40">
                    <Car className="h-10 w-10" />
                  </div>
                )}
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs text-white backdrop-blur">
                  {reservation.vehicule?.immatriculation || 'Plaque inconnue'}
                </span>
              </div>

              <div className="p-5">
                <p style={DISPLAY_FONT} className="text-xl leading-tight text-[#0A3D2E] dark:text-[#F1DFB6]">
                  {reservation.vehicule?.marque} {reservation.vehicule?.modele}
                </p>
                <p className={`text-sm ${MUTED}`}>{reservation.vehicule?.ville || 'Sénégal'}</p>

                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div>
                    <dt className={`text-xs ${MUTED}`}>Début</dt>
                    <dd className={`mt-0.5 text-sm font-medium ${TEXT}`}>
                      {fmtDate(reservation.dateDebut)}
                    </dd>
                  </div>
                  <div>
                    <dt className={`text-xs ${MUTED}`}>Fin</dt>
                    <dd className={`mt-0.5 text-sm font-medium ${TEXT}`}>
                      {fmtDate(reservation.dateFin)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className={`text-sm ${MUTED}`}>Total, {plural(nbJours, 'jour')}</span>
                  <span
                    style={DISPLAY_FONT}
                    className="text-2xl leading-none tabular-nums text-[#0A3D2E] dark:text-[#F1DFB6]"
                  >
                    {formatCurrency(Number(reservation.prixTotal || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Interventions */}
            <div className={CARD}>
              <h3 className={`text-sm font-semibold ${TEXT}`}>Interventions admin</h3>

              {showCancelForm ? (
                <div className="mt-4 space-y-4">
                  <fieldset>
                    <legend className={`text-sm ${MUTED}`}>Motif de l'annulation d'urgence</legend>
                    <div className="mt-3 space-y-2">
                      {PRESET_CANCEL_REASONS.map((reason) => {
                        const selected = selectedPresetReason === reason;
                        return (
                          <label key={reason} className="relative block cursor-pointer">
                            <input
                              type="radio"
                              name={`${uid}-reason`}
                              checked={selected}
                              onChange={() => setSelectedPresetReason(reason)}
                              className="peer sr-only"
                            />
                            <div
                              className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-rose-500 ${selected
                                  ? 'border-rose-600 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                                }`}
                            >
                              <span
                                aria-hidden
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected
                                    ? 'border-rose-600 bg-rose-600 text-white'
                                    : 'border-slate-300 text-transparent'
                                  }`}
                              >
                                <Check className="h-3 w-3" />
                              </span>
                              {reason}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor={`${uid}-note`} className={`text-sm ${MUTED}`}>
                      Précision (optionnelle)
                    </label>
                    <textarea
                      id={`${uid}-note`}
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Ajoutez un contexte pour le dossier"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/25 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                    <p className={`mt-1.5 text-xs ${MUTED}`}>
                      Sans motif, « {DEFAULT_CANCEL_REASON} » sera enregistré.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                      disabled={isMutating}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCancel}
                      disabled={isMutating}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isMutating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                          Annulation en cours…
                        </>
                      ) : (
                        "Confirmer l'annulation"
                      )}
                    </button>
                  </div>
                </div>
              ) : pendingAction ? (
                <div className="mt-4 rounded-2xl border border-[#F1DFB6] bg-[#F1DFB6]/30 p-4">
                  <p className="text-sm text-[#0A3D2E]">
                    {pendingAction === 'CONFIRM'
                      ? "Vous confirmez la réservation à la place de l'hôte."
                      : 'Vous forcez la clôture de la location.'}{' '}
                    Cette action contourne le déroulement normal.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingAction(null)}
                      disabled={isMutating}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#0A3D2E] transition hover:bg-[#0A3D2E]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] disabled:opacity-50"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleRunPending}
                      disabled={isMutating}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3D2E] px-4 py-2.5 text-sm font-semibold text-[#F1DFB6] transition hover:bg-[#0D4B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isMutating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                          En cours…
                        </>
                      ) : (
                        "Confirmer l'action"
                      )}
                    </button>
                  </div>
                </div>
              ) : hasActions ? (
                <div className="mt-4 space-y-2.5">
                  {canConfirm && (
                    <button
                      type="button"
                      onClick={() => setPendingAction('CONFIRM')}
                      disabled={isMutating}
                      className={primaryBtn}
                    >
                      <Check className="h-4 w-4" />
                      Forcer la confirmation par l'hôte
                    </button>
                  )}
                  {canComplete && (
                    <button
                      type="button"
                      onClick={() => setPendingAction('COMPLETE')}
                      disabled={isMutating}
                      className={primaryBtn}
                    >
                      <Check className="h-4 w-4" />
                      Forcer la clôture de la location
                    </button>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(true)}
                      disabled={isMutating}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      Annuler en urgence
                    </button>
                  )}
                </div>
              ) : (
                <p className={`mt-3 text-sm ${MUTED}`}>
                  Aucune intervention possible sur une réservation {statusMeta.label.toLowerCase()}.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Visionneuse plein écran */}
      {lightboxIndex !== null && activePhotos[lightboxIndex] && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse de photos"
          className="fixed inset-0 z-[60] flex flex-col bg-[#031510]/95 backdrop-blur"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 text-white">
            <div className="min-w-0">
              <p style={DISPLAY_FONT} className="truncate text-lg text-[#F1DFB6]">
                {activePhotos[lightboxIndex].categorie ||
                  `${activePhotoType === 'CHECKIN' ? 'Check-in' : 'Check-out'}, photo ${lightboxIndex + 1}`}
              </p>
              <p className="text-xs tabular-nums text-white/60" aria-live="polite">
                {lightboxIndex + 1} sur {activePhotos.length}
              </p>
            </div>
            <button
              ref={lbCloseRef}
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Fermer la visionneuse"
              className="rounded-full p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6]"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative flex-1"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightboxIndex(null);
            }}
          >
            <Image
              key={activePhotos[lightboxIndex].url}
              src={activePhotos[lightboxIndex].url}
              alt={`Photo ${lightboxIndex + 1} sur ${activePhotos.length}`}
              fill
              className="pointer-events-none object-contain p-2 sm:p-6"
              unoptimized
            />

            {activePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex - 1 + activePhotos.length) % activePhotos.length)
                  }
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % activePhotos.length)}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6]"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {activePhotos.length > 1 && (
            <ul className="flex gap-2 overflow-x-auto px-5 py-4">
              {activePhotos.map((p, idx) => (
                <li key={p.id || idx} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    aria-label={`Voir la photo ${idx + 1}`}
                    aria-current={idx === lightboxIndex}
                    className={`relative block h-14 w-20 overflow-hidden rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] ${idx === lightboxIndex
                        ? 'ring-2 ring-[#F1DFB6]'
                        : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};