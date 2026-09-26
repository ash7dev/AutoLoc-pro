'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
  Star,
  CheckCircle2,
  Ban,
  FileText,
  AlertTriangle,
  Maximize2,
  CalendarRange,
  Settings2,
} from 'lucide-react';
import { TenantHealth360, TenantItem } from '../hooks/useAdminTenants';
import { useModalBehavior } from '@/src/features/admin/hosts/hooks/useModalBehavior';
import { Lightbox, LightboxItem, isPdfUrl } from '@/src/features/admin/hosts/components/Lightbox';
import { ActionDialog } from '@/src/features/admin/hosts/components/ActionDialog';
import { formatCurrency } from '@/lib/utils';

interface AdminTenantInspectorModalProps {
  item: TenantItem | null;
  health360?: TenantHealth360;
  /** À passer depuis la requête health360 : évite un état de chargement infini en cas d'échec */
  healthError?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApprovePermis: (userId: string) => Promise<void>;
  onRejectPermis: (userId: string, raison?: string) => Promise<void>;
  onBanTenant: (userId: string, raison?: string) => Promise<void>;
  onUnbanTenant: (userId: string) => Promise<void>;
  isMutating?: boolean;
}

type TabId = 'permis' | 'bookings' | 'governance';
type Tone = 'forest' | 'gold' | 'rust' | 'slate';
type Booking = NonNullable<TenantHealth360['bookings']>[number];

type Pending = { kind: 'reject-permis' } | { kind: 'ban' } | { kind: 'unban' };

/* ------------------------------------------------------------------ */
/* Design tokens (identiques au modal Hôtes)                           */
/* ------------------------------------------------------------------ */

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const TONES: Record<Tone, { hex: string; text: string }> = {
  forest: { hex: '#0A3D2E', text: 'text-brand-main dark:text-champagne' },
  gold: { hex: '#b27c2d', text: 'text-[#8a5f1f] dark:text-[#e0b96a]' },
  rust: { hex: '#a13d3d', text: 'text-[#a13d3d] dark:text-[#e59a9a]' },
  slate: { hex: '#64748b', text: 'text-slate-600 dark:text-slate-300' },
};

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main dark:focus-visible:outline-champagne';
const CARD = 'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs';

const BTN = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-brand-main text-champagne hover:brightness-125`;
const BTN_DANGER = `${BTN} bg-[#a13d3d] text-white hover:brightness-110`;
const BTN_DANGER_OUTLINE = `${BTN} border border-[#a13d3d]/30 text-[#a13d3d] dark:text-[#e59a9a] hover:bg-[#a13d3d]/[0.06]`;
const BTN_LIGHT =
  'inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne';
const BTN_LIGHT_DANGER =
  'inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#a13d3d]/80 hover:bg-[#a13d3d] text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne';

const KYC_BADGES: Record<string, { label: string; tone: Tone; icon: React.ElementType }> = {
  VERIFIE: { label: 'KYC vérifié', tone: 'forest', icon: ShieldCheck },
  EN_ATTENTE: { label: 'KYC en attente', tone: 'gold', icon: ShieldAlert },
  REJETE: { label: 'KYC rejeté', tone: 'rust', icon: ShieldX },
};
const KYC_DEFAULT = { label: 'KYC non vérifié', tone: 'slate' as Tone, icon: ShieldOff };

const RISK_LABEL: Record<string, string> = { LOW: 'faible', MEDIUM: 'modéré', HIGH: 'élevé', CRITICAL: 'critique' };
const riskTone = (score: number): Tone => (score > 60 ? 'rust' : score > 30 ? 'gold' : 'forest');

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

const humanize = (s: string) => {
  const t = s.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Les valeurs exactes des statuts ne sont pas figées côté front : le ton est déduit du sens du mot
const statusTone = (s: string): Tone => {
  const u = s.toUpperCase();
  if (/ANNUL|REJET|REFUS|LITIGE|EXPIR/.test(u)) return 'rust';
  if (/TERMIN|COMPLET|CLOTUR|RESTITU|LIBER/.test(u)) return 'forest';
  if (/ATTENTE|COURS|PENDING|RETENU|BLOQU|SEQUESTR/.test(u)) return 'gold';
  return 'slate';
};

const parseDate = (d: unknown) => {
  const date = new Date(d as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmtRange = (start: unknown, end: unknown) => {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return 'Dates indisponibles';
  const day = (d: Date, year = false) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}) });
  return `${day(s)} au ${day(e, true)}`;
};

const fmtDate = (d: unknown) => {
  const date = parseDate(d);
  return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'date inconnue';
};

/* ------------------------------------------------------------------ */
/* Petits composants                                                   */
/* ------------------------------------------------------------------ */

const Pill: React.FC<{ tone: Tone; icon?: React.ElementType; children: React.ReactNode }> = ({
  tone,
  icon: Icon,
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${TONES[tone].text}`}
    style={{ backgroundColor: `${TONES[tone].hex}1A` }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
    {children}
  </span>
);

const Notice: React.FC<{ tone: Tone; children: React.ReactNode; role?: 'alert' | 'status' }> = ({
  tone,
  children,
  role,
}) => (
  <div
    role={role}
    className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] leading-snug ${TONES[tone].text}`}
    style={{ backgroundColor: `${TONES[tone].hex}14` }}
  >
    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
    <div className="min-w-0">{children}</div>
  </div>
);

const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse motion-reduce:animate-none ${className}`} />
);

const ActionRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="min-w-0">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
      <p className="mt-0.5 max-w-md text-[13px] leading-snug text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

/* ----- Indicateurs de santé du locataire ----- */

const VitalSigns: React.FC<{ matrix: TenantHealth360['healthMatrix'] }> = ({ matrix }) => {
  const tone = riskTone(matrix.riskScore);
  const level = RISK_LABEL[String(matrix.riskLevel)] ?? String(matrix.riskLevel).toLowerCase();

  const cell = 'bg-white dark:bg-slate-900 p-4 space-y-2 min-w-0';
  const label = 'text-[12px] text-slate-500 dark:text-slate-400';
  const value = 'text-[26px] leading-none tabular-nums text-brand-dark dark:text-white';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800 shadow-xs">
        <div className={cell}>
          <p className={label}>Score de risque</p>
          <div className="flex items-baseline gap-2">
            <span style={fontStyle} className={`${value} ${TONES[tone].text}`}>
              {matrix.riskScore}
            </span>
            <span className="text-[13px] text-slate-400">sur 100</span>
          </div>
          <div
            role="meter"
            aria-label="Score de risque"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={matrix.riskScore}
            aria-valuetext={`${matrix.riskScore} sur 100, risque ${level}`}
            className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.min(Math.max(matrix.riskScore, 0), 100)}%`, backgroundColor: TONES[tone].hex }}
            />
          </div>
          <p className={`text-[12px] font-semibold ${TONES[tone].text}`}>Risque {level}</p>
        </div>

        <div className={cell}>
          <p className={label}>Dépenses cumulées</p>
          <p style={fontStyle} className={`${value} text-[22px] truncate`}>
            {formatCurrency(matrix.totalSpent)}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">Sur la plateforme</p>
        </div>

        <div className={cell}>
          <p className={label}>Note du locataire</p>
          {matrix.noteLocataire > 0 ? (
            <p style={fontStyle} className={`${value} flex items-center gap-2`}>
              <Star className="w-5 h-5" style={{ color: TONES.gold.hex, fill: TONES.gold.hex }} />
              {matrix.noteLocataire.toFixed(1)}
              <span className="font-sans text-[13px] text-slate-400">sur 5</span>
            </p>
          ) : (
            <p className="text-[15px] leading-[26px] text-slate-400 dark:text-slate-500">Aucune note</p>
          )}
          <p className="text-[12px] text-slate-500 dark:text-slate-400">Avis des propriétaires</p>
        </div>

        <div className={cell}>
          <p className={label}>Locations</p>
          <p style={fontStyle} className={value}>
            {matrix.totalBookings.toLocaleString('fr-FR')}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
            {matrix.completedBookings} terminées, {matrix.cancelledBookings} annulées
          </p>
        </div>
      </div>

      {matrix.riskWarnings.length > 0 && (
        <Notice tone={tone === 'forest' ? 'gold' : tone}>
          <p className="font-semibold">Points de vigilance</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            {matrix.riskWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Notice>
      )}
    </div>
  );
};

/* ----- Carte réservation ----- */

const BookingCard: React.FC<{ b: Booking }> = ({ b }) => {
  const title = b.vehicule ? `${b.vehicule.marque} ${b.vehicule.modele}` : 'Véhicule supprimé';
  const statut = String(b.statut);
  const caution = String(b.cautionStatut);

  return (
    <article className={`${CARD} p-4 sm:p-5`} aria-label={title}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 style={fontStyle} className="text-[16px] leading-tight text-brand-dark dark:text-white">
              {title}
            </h3>
            {b.vehicule && (
              <span className="font-mono text-[12px] font-semibold tracking-wide px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {b.vehicule.immatriculation}
              </span>
            )}
            <Pill tone={statusTone(statut)}>{humanize(statut)}</Pill>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">{fmtRange(b.dateDebut, b.dateFin)}</p>
          {b.proprietaire && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Hôte : <span className="font-medium text-slate-700 dark:text-slate-200">{b.proprietaire.fullName}</span>
              {b.proprietaire.phone && <span className="tabular-nums">, {b.proprietaire.phone}</span>}
            </p>
          )}
        </div>

        <div className="text-right space-y-1.5">
          <p style={fontStyle} className="text-lg tabular-nums text-brand-dark dark:text-white">
            {formatCurrency(b.totalLocataire)}
          </p>
          <div className="flex items-center justify-end gap-2 text-[12px] text-slate-500 dark:text-slate-400">
            <span className="tabular-nums">Caution {formatCurrency(b.cautionMontant)}</span>
            <Pill tone={statusTone(caution)}>{humanize(caution)}</Pill>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

const InspectorDrawer: React.FC<AdminTenantInspectorModalProps & { item: TenantItem }> = ({
  item,
  health360,
  healthError,
  onClose,
  onApprovePermis,
  onRejectPermis,
  onBanTenant,
  onUnbanTenant,
  isMutating,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();

  const [shown, setShown] = useState(false);
  const [tab, setTab] = useState<TabId>('permis');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useModalBehavior(panelRef, onClose);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ----- Données : jamais de valeurs inventées pendant le chargement ----- */
  const ready = Boolean(health360);

  const tenant = health360?.tenant || {
    id: item.id,
    userId: item.userId,
    prenom: item.utilisateur?.prenom || '',
    nom: item.utilisateur?.nom || '',
    fullName: item.utilisateur?.fullName || item.email,
    email: item.email,
    phone: item.phone,
    avatarUrl: item.utilisateur?.avatarUrl ?? null,
    role: item.role,
    statutKyc: item.statutKyc,
    kycRejectionReason: item.kycRejectionReason,
    isBanned: item.isBanned,
    registeredAt: item.createdAt,
    documents: { documentUrl: null, documentBackUrl: null, selfieUrl: null, permisUrl: item.permisUrl },
  };

  const initials =
    ((tenant.prenom?.[0] ?? '') + (tenant.nom?.[0] ?? '')).toUpperCase() || tenant.fullName?.[0]?.toUpperCase() || 'L';
  const kyc = KYC_BADGES[tenant.statutKyc] ?? KYC_DEFAULT;
  const hasPermis = Boolean(tenant.documents.permisUrl);
  const verified = tenant.statutKyc === 'VERIFIE';
  const canDecide = ready && hasPermis && !verified;

  // Les réservations les plus récentes d'abord
  const bookings = [...(health360?.bookings ?? [])].sort(
    (a, b) => (parseDate(b.dateDebut)?.getTime() ?? 0) - (parseDate(a.dateDebut)?.getTime() ?? 0),
  );

  /* ----- Documents : le permis est l'objet de la décision, il passe en premier ----- */
  const docs = [
    { id: 'permis', label: 'Permis de conduire', url: tenant.documents.permisUrl },
    { id: 'id_front', label: 'Pièce d’identité, recto', url: tenant.documents.documentUrl },
    { id: 'id_back', label: 'Pièce d’identité, verso', url: tenant.documents.documentBackUrl },
    { id: 'selfie', label: 'Selfie de vérification', url: tenant.documents.selfieUrl },
  ];
  const docsList: LightboxItem[] = docs
    .filter((d) => d.url)
    .map((d) => ({ id: d.id, src: d.url as string, title: d.label, caption: tenant.fullName }));

  const openDoc = (id: string) => setLightboxIndex(Math.max(docsList.findIndex((d) => d.id === id), 0));

  // Plus aucun document à afficher : on ferme (évite une réouverture fantôme)
  useEffect(() => {
    if (lightboxIndex !== null && docsList.length === 0) setLightboxIndex(null);
  }, [lightboxIndex, docsList.length]);

  /* ----- Actions ----- */
  const runDirect = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
    } catch {
      setActionError("L'action n'a pas abouti. Réessayez dans un instant.");
    }
  };

  // Depuis la visionneuse : on la ferme ensuite, pour que le résultat (ou l'erreur) soit visible
  const decideFromLightbox = async (fn: () => Promise<void>) => {
    await runDirect(fn);
    setLightboxIndex(null);
  };

  const renderDocActions = (lbItem: LightboxItem) => {
    if (lbItem.id !== 'permis' || !canDecide) return null;
    return (
      <>
        <button type="button" className={BTN_LIGHT} disabled={isMutating} onClick={() => decideFromLightbox(() => onApprovePermis(tenant.userId))}>
          <CheckCircle2 className="w-4 h-4" />
          Valider le permis
        </button>
        <button type="button" className={BTN_LIGHT_DANGER} disabled={isMutating} onClick={() => setPending({ kind: 'reject-permis' })}>
          <Ban className="w-4 h-4" />
          Rejeter
        </button>
      </>
    );
  };

  const buildDialog = (p: Pending) => {
    switch (p.kind) {
      case 'reject-permis':
        return {
          title: `Rejeter le permis de ${tenant.fullName} ?`,
          description: 'Indiquez le motif du rejet. Il permettra au locataire de comprendre ce qu’il doit corriger.',
          confirmLabel: 'Rejeter le permis',
          tone: 'danger' as const,
          reasonLabel: 'Motif du rejet',
          run: (reason: string) => onRejectPermis(tenant.userId, reason),
        };
      case 'ban':
        return {
          title: `Bannir ${tenant.fullName} ?`,
          description: 'Le compte du locataire sera bloqué. Indiquez le motif de cette décision.',
          confirmLabel: 'Bannir le locataire',
          tone: 'danger' as const,
          reasonLabel: 'Motif du bannissement',
          run: (reason: string) => onBanTenant(tenant.userId, reason),
        };
      case 'unban':
        return {
          title: `Débannir ${tenant.fullName} ?`,
          description: 'Le compte du locataire sera réactivé.',
          confirmLabel: 'Débannir le locataire',
          tone: 'neutral' as const,
          reasonLabel: undefined,
          run: () => onUnbanTenant(tenant.userId),
        };
    }
  };
  const dialog = pending ? buildDialog(pending) : null;

  /* ----- Onglets ----- */
  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'permis', label: 'Permis et KYC', icon: FileText },
    { id: 'bookings', label: 'Réservations', icon: CalendarRange, count: ready ? bookings.length : undefined },
    { id: 'governance', label: 'Gouvernance', icon: Settings2 },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;
    e.preventDefault();
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  if (typeof document === 'undefined') return null;

  const panelProps = (id: TabId) => ({
    role: 'tabpanel' as const,
    id: `${uid}-panel-${id}`,
    'aria-labelledby': `${uid}-tab-${id}`,
    tabIndex: 0,
    className: `space-y-4 outline-none ${FOCUS}`,
  });

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 font-sans">
        <div
          className={`absolute inset-0 bg-brand-dark/60 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none ${shown ? 'opacity-100' : 'opacity-0'
            }`}
          onMouseDown={onClose}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
          tabIndex={-1}
          className={`absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col bg-slate-50 dark:bg-slate-950 shadow-2xl outline-none border-l border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-out motion-reduce:transition-none ${shown ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* En-tête */}
          <header className="shrink-0 flex items-start gap-4 bg-white dark:bg-slate-900 px-4 py-4 sm:px-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[15px] font-semibold ring-1 ring-inset ring-champagne/25"
              style={{ backgroundColor: '#0A3D2E', color: '#F1DFB6' }}
            >
              {tenant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 id={`${uid}-title`} style={fontStyle} className="text-xl leading-tight tracking-tight text-brand-dark dark:text-white">
                  {tenant.fullName}
                </h2>
                <Pill tone={kyc.tone} icon={kyc.icon}>
                  {kyc.label}
                </Pill>
                <Pill tone={hasPermis ? (verified ? 'forest' : 'gold') : 'slate'} icon={FileText}>
                  {hasPermis ? (verified ? 'Permis validé' : 'Permis à valider') : 'Permis manquant'}
                </Pill>
                {tenant.isBanned && (
                  <Pill tone="rust" icon={Ban}>
                    Compte banni
                  </Pill>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{tenant.email}</span>
                {tenant.phone && <span className="tabular-nums">{tenant.phone}</span>}
              </div>
            </div>

            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label="Fermer"
              title="Fermer (Échap)"
              className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${FOCUS}`}
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Indicateur d'enregistrement */}
          <div className="h-0.5 shrink-0 bg-slate-200/60 dark:bg-slate-800" role="status">
            {isMutating && <div className="h-full w-full animate-pulse motion-reduce:animate-none bg-[#b27c2d]" />}
            <span className="sr-only">{isMutating ? 'Enregistrement en cours' : ''}</span>
          </div>

          {/* Onglets */}
          <div
            role="tablist"
            aria-label="Sections de l'audit"
            className="shrink-0 flex gap-1 overflow-x-auto scrollbar-none bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-2 sm:px-4"
          >
            {tabs.map((t, i) => {
              const selected = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={`relative flex h-12 items-center gap-2 px-3 text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${FOCUS} ${selected ? TONES.forest.text : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {t.label}
                  {t.count !== undefined && (
                    <span className="min-w-[1.5rem] rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums text-slate-600 dark:text-slate-300">
                      {t.count}
                    </span>
                  )}
                  {selected && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-main dark:bg-champagne" />}
                </button>
              );
            })}
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
            {actionError && (
              <div role="alert" className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Notice tone="rust">{actionError}</Notice>
                </div>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  aria-label="Masquer le message"
                  className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer ${FOCUS}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Santé du locataire */}
            {ready && health360 ? (
              <VitalSigns matrix={health360.healthMatrix} />
            ) : healthError ? (
              <Notice tone="gold" role="status">
                Les indicateurs d’audit n’ont pas pu être chargés. Fermez puis rouvrez la fiche pour réessayer.
              </Notice>
            ) : (
              <div
                aria-busy="true"
                className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-200/70 dark:bg-slate-800"
              >
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 space-y-3">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-6 w-24" />
                    <SkeletonBlock className="h-3 w-28" />
                  </div>
                ))}
              </div>
            )}

            {/* --- Permis et KYC --- */}
            {tab === 'permis' && (
              <section {...panelProps('permis')}>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Inscrit le {fmtDate(tenant.registeredAt)}</p>

                {tenant.statutKyc === 'REJETE' && tenant.kycRejectionReason && (
                  <Notice tone="rust">
                    <p className="font-semibold">Motif du rejet</p>
                    <p className="mt-0.5">{tenant.kycRejectionReason}</p>
                  </Notice>
                )}

                {canDecide && (
                  <div className={`${CARD} p-4 sm:p-5`}>
                    <ActionRow
                      title="Décision sur le permis"
                      description="Examinez les documents en plein écran, puis validez ou rejetez le permis."
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" className={BTN_PRIMARY} disabled={isMutating} onClick={() => runDirect(() => onApprovePermis(tenant.userId))}>
                          <CheckCircle2 className="w-4 h-4" />
                          Valider le permis
                        </button>
                        <button type="button" className={BTN_DANGER_OUTLINE} disabled={isMutating} onClick={() => setPending({ kind: 'reject-permis' })}>
                          <Ban className="w-4 h-4" />
                          Rejeter
                        </button>
                      </div>
                    </ActionRow>
                  </div>
                )}

                {!ready ? (
                  healthError ? null : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-busy="true">
                      {[0, 1, 2, 3].map((i) => (
                        <SkeletonBlock key={i} className="aspect-[4/3] w-full rounded-2xl" />
                      ))}
                    </div>
                  )
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {docs.map((d) => (
                      <li key={d.id}>
                        {d.url ? (
                          <button
                            type="button"
                            onClick={() => openDoc(d.id)}
                            aria-label={`Agrandir : ${d.label}`}
                            className={`group relative block w-full overflow-hidden rounded-2xl text-left cursor-zoom-in ${CARD} ${FOCUS}`}
                          >
                            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-slate-800">
                              {isPdfUrl(d.url) ? (
                                <FileText className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={d.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2 px-4 py-3 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                              {d.label}
                              <Maximize2 className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                            </div>
                          </button>
                        ) : (
                          <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="flex aspect-[4/3] items-center justify-center text-[13px] text-slate-400">Non transmis</div>
                            <div className="px-4 py-3 text-[13px] font-semibold text-slate-500 dark:text-slate-400">{d.label}</div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* --- Réservations --- */}
            {tab === 'bookings' && (
              <section {...panelProps('bookings')}>
                {!ready ? (
                  healthError ? null : (
                    <div className="space-y-3" aria-busy="true">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className={`${CARD} p-5 space-y-3`}>
                          <SkeletonBlock className="h-5 w-56" />
                          <SkeletonBlock className="h-4 w-40" />
                        </div>
                      ))}
                    </div>
                  )
                ) : bookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 text-center">
                    <CalendarRange className="mx-auto w-6 h-6 text-slate-400" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Aucune réservation</p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Ce locataire n’a pas encore effectué de location.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {plural(bookings.length, 'réservation')}, la plus récente en premier
                    </p>
                    {bookings.map((b) => (
                      <BookingCard key={b.id} b={b} />
                    ))}
                  </>
                )}
              </section>
            )}

            {/* --- Gouvernance --- */}
            {tab === 'governance' && (
              <section {...panelProps('governance')}>
                <div className={`${CARD} p-5 ${tenant.isBanned ? '' : 'border-[#a13d3d]/25'}`}>
                  <h3 style={fontStyle} className="text-base text-brand-dark dark:text-white mb-4">
                    Compte
                  </h3>
                  <ActionRow
                    title={tenant.isBanned ? 'Ce compte est banni' : 'Bannir le locataire'}
                    description={
                      tenant.isBanned
                        ? 'Le locataire ne peut plus utiliser son compte tant que le bannissement est actif.'
                        : 'Bloque le compte du locataire. Un motif est demandé.'
                    }
                  >
                    {tenant.isBanned ? (
                      <button type="button" className={BTN_PRIMARY} disabled={isMutating} onClick={() => setPending({ kind: 'unban' })}>
                        Débannir
                      </button>
                    ) : (
                      <button type="button" className={BTN_DANGER} disabled={isMutating} onClick={() => setPending({ kind: 'ban' })}>
                        <Ban className="w-4 h-4" />
                        Bannir
                      </button>
                    )}
                  </ActionRow>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && docsList.length > 0 && (
        <Lightbox
          items={docsList}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          renderActions={canDecide ? renderDocActions : undefined}
        />
      )}

      {pending && dialog && (
        <ActionDialog
          key={pending.kind}
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          reasonLabel={dialog.reasonLabel}
          onConfirm={dialog.run}
          onClose={() => setPending(null)}
        />
      )}
    </>,
    document.body,
  );
};

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const AdminTenantInspectorModal: React.FC<AdminTenantInspectorModalProps> = (props) => {
  if (!props.isOpen || !props.item) return null;
  // key : tout l'état interne repart de zéro quand on change de locataire
  return <InspectorDrawer key={props.item.id} {...props} item={props.item} />;
};