'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Check, Copy, Loader2 } from 'lucide-react';
import type { AdminWithdrawalItem } from '../../../../core/api/adminPayoutsApi';

interface AdminPayoutInspectorModalProps {
  item: AdminWithdrawalItem | null;
  isOpen: boolean;
  isMutating: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string, raison: string) => Promise<boolean>;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };

const TEXT = 'text-slate-900';
const MUTED = 'text-slate-500';
const CARD = 'rounded-3xl border border-slate-200/70 bg-white p-5';

const REJECT_SUGGESTIONS = ['Numéro erroné', 'Compte non éligible', 'Informations incohérentes'];

const STATUS: Record<string, { label: string; long: string; dot: string }> = {
  EFFECTUE: { label: 'Effectué', long: 'Effectué et clôturé', dot: 'bg-emerald-400' },
  REJETE: { label: 'Rejeté', long: 'Rejeté et remboursé', dot: 'bg-rose-400' },
  EN_ATTENTE: { label: 'En attente', long: 'En attente de virement', dot: 'bg-amber-300' },
};

const fmt = (n: number) => n.toLocaleString('fr-FR');

const humanize = (v?: string | null) => {
  if (!v) return '';
  const t = v.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const initialsOf = (name?: string | null) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

const fmtDateTime = (v?: string | number | Date | null) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* presse-papiers indisponible : sans effet */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copier ${label}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-brand-main transition hover:bg-brand-main/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? 'Copié' : 'Copier'}</span>
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className={`shrink-0 text-sm ${MUTED}`}>{label}</dt>
      <dd className={`min-w-0 text-right text-sm font-medium ${TEXT}`}>{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export const AdminPayoutInspectorModal: React.FC<AdminPayoutInspectorModalProps> = ({
  item,
  isOpen,
  isMutating,
  onClose,
  onApprove,
  onReject,
}) => {
  const uid = useId();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const rejectRef = useRef<HTMLTextAreaElement>(null);

  const isVisible = isOpen && !!item;

  // Réinitialise à chaque ouverture ou changement de retrait
  useEffect(() => {
    if (!isOpen) return;
    setShowRejectForm(false);
    setConfirmingApprove(false);
    setRejectReason('');
    setRejectError('');
  }, [isOpen, item?.id]);

  // Verrouille le scroll, place le focus, le restitue à la fermeture
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

  useEffect(() => {
    if (confirmingApprove) confirmBtnRef.current?.focus();
  }, [confirmingApprove]);

  // Clavier : Échap (revient d'un niveau), piège de focus
  useEffect(() => {
    if (!isVisible) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (isMutating) return;
        if (showRejectForm) setShowRejectForm(false);
        else if (confirmingApprove) setConfirmingApprove(false);
        else onClose();
        return;
      }

      if (e.key === 'Tab') {
        const root = dialogRef.current;
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
  }, [isVisible, isMutating, showRejectForm, confirmingApprove, onClose]);

  if (!isVisible || !item) return null;

  const titleId = `${uid}-title`;
  const isWave = item.method === 'WAVE';
  const isPending = item.statut === 'EN_ATTENTE';
  const methodLabel = isWave ? 'Wave' : 'Orange Money';
  const statusMeta = STATUS[item.statut] ?? {
    label: humanize(item.statut),
    long: humanize(item.statut),
    dot: 'bg-slate-300',
  };

  const kycOk = /VALID|VERIF/i.test(item.ownerKycStatus ?? '');
  const requestedAt = fmtDateTime(item.demandeeLe);
  const processedAt = fmtDateTime(item.traiteLe);

  const handleApprove = async () => {
    const ok = await onApprove(item.id);
    if (ok) onClose();
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError('Indiquez le motif du rejet pour informer le propriétaire.');
      rejectRef.current?.focus();
      return;
    }
    const ok = await onReject(item.id, reason);
    if (ok) {
      setShowRejectForm(false);
      setRejectReason('');
      onClose();
    }
  };

  const addSuggestion = (text: string) => {
    setRejectError('');
    setRejectReason((prev) => (prev.trim() ? `${prev.trim()}, ${text.toLowerCase()}` : text));
    rejectRef.current?.focus();
  };

  const ghostBtn =
    'rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-brand-dark/70 p-0 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none sm:items-center sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isMutating && !showRejectForm && !confirmingApprove) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(10,61,46,0.45)] sm:h-auto sm:max-h-[90vh] sm:rounded-[28px]"
      >
        {/* En-tête */}
        <header className="flex shrink-0 items-start justify-between gap-4 bg-brand-main px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2
                id={titleId}
                style={DISPLAY_FONT}
                className="text-2xl leading-tight text-champagne"
              >
                Demande de reversement
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 px-2.5 py-1 text-xs font-medium text-champagne">
                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-1 font-mono text-sm text-emerald-100/70">
              Retrait #{item.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            disabled={isMutating}
            aria-label="Fermer"
            className="shrink-0 rounded-full p-2 text-champagne/80 transition hover:bg-champagne/10 hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Corps */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-[#F6F7F5] p-6">
          {/* Montant */}
          <section className={CARD}>
            <p className={`text-sm ${MUTED}`}>Montant réclamé</p>
            <div
              style={DISPLAY_FONT}
              className="mt-1 flex flex-wrap items-baseline gap-x-3 leading-none tabular-nums text-brand-main"
            >
              <span className="text-5xl sm:text-6xl">{fmt(item.amount)}</span>
              <span className={`text-xl ${MUTED}`}>FCFA</span>
            </div>
            <p className={`mt-3 text-sm ${MUTED}`}>
              Solde actuel du portefeuille :{' '}
              <span className={`font-semibold tabular-nums ${TEXT}`}>
                {fmt(item.walletBalance)} FCFA
              </span>
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
              <span className={`inline-flex items-center gap-2 font-medium ${TEXT}`}>
                <span className={`h-2 w-2 rounded-full ${isWave ? 'bg-sky-400' : 'bg-orange-400'}`} />
                {methodLabel}
                <span className={`font-normal ${MUTED}`}>
                  {isWave ? 'virement direct' : 'virement manuel'}
                </span>
              </span>
              <span className={MUTED}>{statusMeta.long}</span>
            </div>
          </section>

          {/* Bénéficiaire */}
          <section className={CARD}>
            <h3 className={`text-sm font-semibold ${TEXT}`}>Bénéficiaire</h3>

            <div className="mt-4 flex items-center gap-3">
              <span
                style={DISPLAY_FONT}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-main text-lg text-champagne"
              >
                {initialsOf(item.ownerName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-base font-semibold ${TEXT}`}>{item.ownerName}</p>
                {item.ownerKycStatus && (
                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${kycOk
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20'
                        : 'bg-amber-50 text-amber-800 ring-amber-600/20'
                      }`}
                  >
                    {kycOk ? 'KYC validé' : `KYC ${humanize(item.ownerKycStatus).toLowerCase()}`}
                  </span>
                )}
              </div>
            </div>

            <dl className="mt-3 divide-y divide-slate-100">
              <Row label="Numéro destinataire">
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono tabular-nums text-brand-main">
                    {item.numeroDestinataire}
                  </span>
                  <CopyButton value={item.numeroDestinataire} label="le numéro destinataire" />
                </span>
              </Row>
              {item.ownerPhone && (
                <Row label="Téléphone du compte">
                  <span className="font-mono tabular-nums">{item.ownerPhone}</span>
                </Row>
              )}
              <Row label="Email">
                {item.ownerEmail ? (
                  <a
                    href={`mailto:${item.ownerEmail}`}
                    className="break-all hover:text-brand-main hover:underline"
                  >
                    {item.ownerEmail}
                  </a>
                ) : (
                  <span className={MUTED}>Non renseigné</span>
                )}
              </Row>
            </dl>
          </section>

          {/* Traçabilité */}
          <section className={CARD}>
            <h3 className={`text-sm font-semibold ${TEXT}`}>Traçabilité</h3>
            <dl className="mt-2 divide-y divide-slate-100">
              <Row label="Demandé le">{requestedAt ?? '–'}</Row>
              <Row label="Traité le">
                {processedAt ?? <span className={MUTED}>Pas encore traité</span>}
              </Row>
              {item.idTransactionFournisseur && (
                <Row label={`ID transaction ${methodLabel}`}>
                  <span className="inline-flex items-center gap-1">
                    <span className="break-all font-mono text-xs">
                      {item.idTransactionFournisseur}
                    </span>
                    <CopyButton value={item.idTransactionFournisseur} label="l'ID de transaction" />
                  </span>
                </Row>
              )}
            </dl>
          </section>

          {/* Motif de rejet existant */}
          {item.raisonRejet && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
              <h3 className="text-sm font-semibold text-rose-900">Motif du rejet</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-rose-800">{item.raisonRejet}</p>
            </section>
          )}
        </div>

        {/* Actions */}
        <footer className="shrink-0 border-t border-slate-200/80 bg-white p-4 sm:px-6">
          {showRejectForm ? (
            <form onSubmit={handleRejectSubmit} noValidate className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`${uid}-reason`} className={`text-sm font-semibold ${TEXT}`}>
                  Motif du rejet
                </label>
                <span className={`text-xs ${MUTED}`}>Communiqué au propriétaire</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {REJECT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSuggestion(s)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <textarea
                id={`${uid}-reason`}
                ref={rejectRef}
                rows={3}
                autoFocus
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                aria-invalid={!!rejectError}
                aria-describedby={rejectError ? `${uid}-reason-error` : undefined}
                placeholder="Expliquez pourquoi le virement est rejeté"
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${rejectError
                    ? 'border-rose-500 focus:ring-rose-500/25'
                    : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/25'
                  }`}
              />
              {rejectError && (
                <p id={`${uid}-reason-error`} role="alert" className="text-xs text-rose-700">
                  {rejectError}
                </p>
              )}
              <p className={`text-xs ${MUTED}`}>
                Le montant sera remboursé sur le wallet du propriétaire.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  disabled={isMutating}
                  className={`${ghostBtn} text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400`}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                      Rejet en cours…
                    </>
                  ) : (
                    'Confirmer le rejet'
                  )}
                </button>
              </div>
            </form>
          ) : confirmingApprove ? (
            <div
              role="alertdialog"
              aria-label="Confirmer la validation"
              className="rounded-2xl border border-champagne bg-champagne/30 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
            >
              <p className="text-sm text-brand-main">
                Vous confirmez le virement de{' '}
                <strong className="font-semibold tabular-nums">{fmt(item.amount)} FCFA</strong> vers{' '}
                <strong className="font-mono font-semibold">{item.numeroDestinataire}</strong> (
                {methodLabel}). Le retrait sera marqué comme effectué.
              </p>
              <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setConfirmingApprove(false)}
                  disabled={isMutating}
                  className={`${ghostBtn} text-brand-main hover:bg-brand-main/10 focus-visible:ring-brand-main`}
                >
                  Retour
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={handleApprove}
                  disabled={isMutating}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-main px-5 py-2.5 text-sm font-semibold text-champagne transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                      Validation…
                    </>
                  ) : (
                    'Confirmer la validation'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isMutating}
                className={`${ghostBtn} border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400`}
              >
                Fermer
              </button>

              {isPending && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isMutating}
                    className={`${ghostBtn} border border-rose-200 text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500`}
                  >
                    Rejeter la demande
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingApprove(true)}
                    disabled={isMutating}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-main px-6 py-2.5 text-sm font-semibold text-champagne shadow-md shadow-brand-main/20 transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Valider et marquer effectué
                  </button>
                </div>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};