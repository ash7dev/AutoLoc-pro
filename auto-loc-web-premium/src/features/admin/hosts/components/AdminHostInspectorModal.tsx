'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
  Car,
  FileText,
  Ban,
  CheckCircle2,
  Sparkles,
  Images,
  ImageOff,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Settings2,
} from 'lucide-react';
import { HostHealth360, HostItem } from '../hooks/useAdminHosts';
import { useModalBehavior } from '../hooks/useModalBehavior';
import { formatCurrency } from '@/lib/utils';
import { Lightbox, LightboxItem, isPdfUrl } from './Lightbox';
import { ActionDialog } from './ActionDialog';

interface AdminHostInspectorModalProps {
  item: HostItem | null;
  health360?: HostHealth360;
  /** À passer depuis la requête health360 : évite un état de chargement infini en cas d'échec */
  healthError?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onValidateVehicle: (vehicleId: string) => Promise<void>;
  onSuspendVehicle: (vehicleId: string, raison: string) => Promise<void>;
  onFeatureVehicle: (vehicleId: string, active: boolean) => Promise<void>;
  onDeletePhoto: (vehicleId: string, photoId: string) => Promise<void>;
  onSetMainPhoto: (vehicleId: string, photoId: string) => Promise<void>;
  onExecuteFleetAction: (hostId: string, action: 'SUSPEND_ALL' | 'ACTIVATE_ALL', raison?: string) => Promise<void>;
  onBanHost: (userId: string, raison?: string) => Promise<void>;
  onUnbanHost: (userId: string) => Promise<void>;
  isMutating?: boolean;
}

type FleetVehicle = NonNullable<HostHealth360['fleet']>[number];
type TabId = 'fleet' | 'kyc' | 'governance';
type Tone = 'forest' | 'gold' | 'rust' | 'slate';

type Pending =
  | { kind: 'suspend-vehicle'; vehicleId: string; label: string }
  | { kind: 'delete-photo'; vehicleId: string; photoId: string }
  | { kind: 'suspend-fleet' }
  | { kind: 'activate-fleet' }
  | { kind: 'ban' }
  | { kind: 'unban' };

type LightboxState =
  | { source: 'photos'; vehicleId: string; index: number }
  | { source: 'docs'; items: LightboxItem[]; index: number };

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
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
const BTN_OUTLINE = `${BTN} border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`;
const BTN_DANGER_OUTLINE = `${BTN} border border-[#a13d3d]/30 text-[#a13d3d] dark:text-[#e59a9a] hover:bg-[#a13d3d]/[0.06]`;
const BTN_DANGER = `${BTN} bg-[#a13d3d] text-white hover:brightness-110`;
const BTN_GOLD = `${BTN} border border-[#b27c2d]/40 text-[#8a5f1f] dark:text-[#e0b96a] hover:bg-[#b27c2d]/10`;
const BTN_LIGHT = 'inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne';

const KYC_BADGES: Record<string, { label: string; tone: Tone; icon: React.ElementType }> = {
  VERIFIE: { label: 'KYC vérifié', tone: 'forest', icon: ShieldCheck },
  EN_ATTENTE: { label: 'KYC en attente', tone: 'gold', icon: ShieldAlert },
  REJETE: { label: 'KYC rejeté', tone: 'rust', icon: ShieldX },
};
const KYC_DEFAULT = { label: 'KYC non vérifié', tone: 'slate' as Tone, icon: ShieldOff };

const VEHICLE_STATUS: Record<string, { label: string; tone: Tone; icon?: React.ElementType }> = {
  VERIFIE: { label: 'Vérifié', tone: 'forest', icon: CheckCircle2 },
  EN_ATTENTE_VALIDATION: { label: 'En attente de validation', tone: 'gold', icon: AlertTriangle },
  SUSPENDU: { label: 'Suspendu', tone: 'rust', icon: Ban },
};

const RISK_LABEL: Record<string, string> = { LOW: 'Faible', MEDIUM: 'Modéré', HIGH: 'Élevé', CRITICAL: 'Critique' };
const riskTone = (score: number): Tone => (score > 60 ? 'rust' : score > 30 ? 'gold' : 'forest');

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;
const fmtDate = (d: unknown) => {
  if (!d) return 'date inconnue';
  const date = new Date(d as string);
  return Number.isNaN(date.getTime())
    ? 'date inconnue'
    : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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

/* ----- Indicateurs de santé de l'hôte ----- */

const VitalSigns: React.FC<{ matrix: HostHealth360['healthMatrix'] }> = ({ matrix }) => {
  const tone = riskTone(matrix.riskScore);
  const level = RISK_LABEL[String(matrix.riskLevel)] ?? String(matrix.riskLevel);
  const cancelHigh = matrix.hostCancelRate > 15;

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
            aria-valuetext={`${matrix.riskScore} sur 100, risque ${level.toLowerCase()}`}
            className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.min(Math.max(matrix.riskScore, 0), 100)}%`, backgroundColor: TONES[tone].hex }}
            />
          </div>
          <p className={`text-[12px] font-semibold ${TONES[tone].text}`}>Risque {level.toLowerCase()}</p>
        </div>

        <div className={cell}>
          <p className={label}>Gains cumulés</p>
          <p style={fontStyle} className={`${value} text-[22px] truncate`}>
            {formatCurrency(matrix.grossEarnings)}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Séquestre en cours :{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
              {formatCurrency(matrix.escrowBalance)}
            </span>
          </p>
        </div>

        <div className={cell}>
          <p className={label}>Annulations par l&apos;hôte</p>
          <p style={fontStyle} className={`${value} ${cancelHigh ? TONES.rust.text : ''}`}>
            {matrix.hostCancelRate.toLocaleString('fr-FR')} %
          </p>
          <p className={`text-[12px] ${cancelHigh ? `font-semibold ${TONES.rust.text}` : 'text-slate-500 dark:text-slate-400'}`}>
            {cancelHigh ? 'Au-dessus du seuil de 15 %' : 'Sous le seuil de 15 %'}
          </p>
        </div>

        <div className={cell}>
          <p className={label}>Locations</p>
          <p style={fontStyle} className={value}>
            {matrix.totalBookings.toLocaleString('fr-FR')}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
            {matrix.completedBookings} terminées, {matrix.ongoingBookings} en cours
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

/* ----- Ligne document d'un véhicule ----- */

const DocRow: React.FC<{ label: string; available: boolean; onOpen: () => void }> = ({ label, available, onOpen }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 pl-3 pr-1.5 h-11 text-[13px]">
    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
      <FileText className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
      {label}
    </span>
    {available ? (
      <button
        type="button"
        onClick={onOpen}
        className={`h-8 px-3 rounded-full font-semibold cursor-pointer hover:bg-brand-main/[0.06] dark:hover:bg-white/10 ${TONES.forest.text} ${FOCUS}`}
      >
        Consulter
      </button>
    ) : (
      <span className={`pr-1.5 font-medium ${TONES.rust.text}`}>Manquante</span>
    )}
  </div>
);

/* ----- Carte véhicule ----- */

interface VehicleCardProps {
  v: FleetVehicle;
  busy?: boolean;
  onOpenPhotos: (index: number) => void;
  onOpenDoc: (which: 'carteGrise' | 'assurance') => void;
  onValidate: () => void;
  onSuspend: () => void;
  onFeature: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ v, busy, onOpenPhotos, onOpenDoc, onValidate, onSuspend, onFeature }) => {
  const photos = v.photos ?? [];
  const coverIdx = Math.max(
    photos.findIndex((p) => p.estPrincipale),
    0,
  );
  const cover = photos[coverIdx];

  const status = VEHICLE_STATUS[v.statut] ?? { label: String(v.statut), tone: 'slate' as Tone };
  const dev = v.priceDevPct;
  const devTone: Tone = dev < -30 ? 'rust' : dev > 40 ? 'gold' : 'forest';
  const devLabel = dev < -30 ? 'Sous le marché' : dev > 40 ? 'Au-dessus du marché' : 'Dans la moyenne';
  const meta = [v.type, v.ville, plural(v.totalLocations, 'location')].filter(Boolean).join(', ');

  return (
    <article className={`${CARD} p-4 sm:p-5`} aria-label={`${v.marque} ${v.modele}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {cover ? (
          <button
            type="button"
            onClick={() => onOpenPhotos(coverIdx)}
            aria-label={`Agrandir les photos de ${v.marque} ${v.modele}, ${plural(photos.length, 'photo')}`}
            className={`relative block w-full md:w-56 shrink-0 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 cursor-zoom-in ${FOCUS}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-brand-dark/75 text-white text-[12px] font-semibold">
              <Images className="w-3.5 h-3.5" />
              {photos.length}
            </span>
          </button>
        ) : (
          <div
            className={`w-full md:w-56 shrink-0 aspect-[4/3] flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#b27c2d]/50 bg-[#b27c2d]/[0.06] text-[13px] font-medium ${TONES.gold.text}`}
          >
            <ImageOff className="w-5 h-5" />
            Aucune photo
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 style={fontStyle} className="text-[17px] leading-tight text-brand-dark dark:text-white">
                  {v.marque} {v.modele} <span className="text-slate-400">{v.annee}</span>
                </h3>
                <span className="font-mono text-[12px] font-semibold tracking-wide px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {v.immatriculation}
                </span>
                <Pill tone={status.tone} icon={status.icon}>
                  {status.label}
                </Pill>
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">{meta}</p>
            </div>

            <div className="text-right space-y-1">
              <p style={fontStyle} className="text-lg tabular-nums text-brand-dark dark:text-white">
                {formatCurrency(v.prixParJour)}
                <span className="font-sans text-[13px] text-slate-500 dark:text-slate-400"> / jour</span>
              </p>
              <div className="flex items-center justify-end gap-2">
                {dev !== 0 && (
                  <>
                    <span className="text-[12px] text-slate-500 dark:text-slate-400">{devLabel}</span>
                    <Pill tone={devTone} icon={dev < 0 ? TrendingDown : TrendingUp}>
                      {dev > 0 ? `+${dev}` : dev} %
                    </Pill>
                  </>
                )}
              </div>
              {v.benchmarkPriceAvg > 0 && (
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  Moyenne {v.type} : {formatCurrency(v.benchmarkPriceAvg)}
                </p>
              )}
            </div>
          </div>

          {v.priceWarning && <Notice tone="gold">{v.priceWarning}</Notice>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <DocRow label="Carte grise" available={Boolean(v.hasCarteGrise && v.carteGriseUrl)} onOpen={() => onOpenDoc('carteGrise')} />
            <DocRow label="Assurance" available={Boolean(v.hasAssuranceDoc && v.assuranceDocUrl)} onOpen={() => onOpenDoc('assurance')} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {v.statut !== 'VERIFIE' && (
              <button type="button" className={BTN_PRIMARY} onClick={onValidate} disabled={busy}>
                <CheckCircle2 className="w-4 h-4" />
                Valider
              </button>
            )}
            {v.statut !== 'SUSPENDU' && (
              <button type="button" className={BTN_DANGER_OUTLINE} onClick={onSuspend} disabled={busy}>
                <Ban className="w-4 h-4" />
                Suspendre
              </button>
            )}
            <button type="button" className={BTN_GOLD} onClick={onFeature} disabled={busy}>
              <Sparkles className="w-4 h-4" />
              Mettre en avant
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ----- Ligne d'action de gouvernance ----- */

const ActionRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
    <div className="min-w-0">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
      <p className="mt-0.5 max-w-md text-[13px] leading-snug text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

type DrawerProps = Omit<AdminHostInspectorModalProps, 'item'> & { item: HostItem };

const InspectorDrawer: React.FC<DrawerProps> = ({
  item,
  health360,
  healthError,
  onClose,
  onValidateVehicle,
  onSuspendVehicle,
  onFeatureVehicle,
  onDeletePhoto,
  onSetMainPhoto,
  onExecuteFleetAction,
  onBanHost,
  onUnbanHost,
  isMutating,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const uid = useId();

  const [shown, setShown] = useState(false);
  const [tab, setTab] = useState<TabId>('fleet');
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useModalBehavior(panelRef, onClose);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* ----- Données : jamais de valeurs inventées pendant le chargement ----- */
  const ready = Boolean(health360);
  const fleet = health360?.fleet ?? [];

  const host = health360?.host || {
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
    documents: { documentUrl: null, documentBackUrl: null, selfieUrl: null, permisUrl: null },
  };

  const initials =
    ((host.prenom?.[0] ?? '') + (host.nom?.[0] ?? '')).toUpperCase() || host.fullName?.[0]?.toUpperCase() || 'H';
  const kyc = KYC_BADGES[host.statutKyc] ?? KYC_DEFAULT;
  const awaitingValidation = fleet.filter((v) => v.statut === 'EN_ATTENTE_VALIDATION').length;

  /* ----- Visionneuse : les éléments sont dérivés des données vivantes ----- */
  const photoItems = (v: FleetVehicle | undefined): LightboxItem[] =>
    v ? (v.photos ?? []).map((p) => ({
      id: p.id,
      src: p.url,
      title: `${v.marque} ${v.modele}`,
      caption: p.estPrincipale ? 'Photo de couverture' : undefined,
    }))
      : [];

  const lightboxItems: LightboxItem[] = !lightbox
    ? []
    : lightbox.source === 'docs'
      ? lightbox.items
      : photoItems(fleet.find((v) => v.id === lightbox.vehicleId));

  // Plus rien à afficher (ex. dernière photo supprimée) : on ferme
  useEffect(() => {
    if (lightbox && lightboxItems.length === 0) setLightbox(null);
  }, [lightbox, lightboxItems.length]);

  const openVehicleDoc = (v: FleetVehicle, which: 'carteGrise' | 'assurance') => {
    const docs: LightboxItem[] = [];
    if (v.hasCarteGrise && v.carteGriseUrl) {
      docs.push({ id: 'carteGrise', src: v.carteGriseUrl, title: 'Carte grise', caption: `${v.marque} ${v.modele}` });
    }
    if (v.hasAssuranceDoc && v.assuranceDocUrl) {
      docs.push({ id: 'assurance', src: v.assuranceDocUrl, title: "Attestation d'assurance", caption: `${v.marque} ${v.modele}` });
    }
    setLightbox({ source: 'docs', items: docs, index: Math.max(docs.findIndex((d) => d.id === which), 0) });
  };

  const renderPhotoActions = (lbItem: LightboxItem) => {
    if (lightbox?.source !== 'photos') return null;
    const v = fleet.find((x) => x.id === lightbox.vehicleId);
    const photo = v?.photos?.find((p) => p.id === lbItem.id);
    if (!v || !photo) return null;
    return (
      <>
        {!photo.estPrincipale && (
          <button type="button" className={BTN_LIGHT} disabled={isMutating} onClick={() => runDirect(() => onSetMainPhoto(v.id, photo.id))}>
            Définir comme couverture
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#a13d3d]/80 hover:bg-[#a13d3d] text-white text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
          disabled={isMutating}
          onClick={() => setPending({ kind: 'delete-photo', vehicleId: v.id, photoId: photo.id })}
        >
          Supprimer la photo
        </button>
      </>
    );
  };

  /* ----- Actions ----- */
  const runDirect = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
    } catch {
      setActionError("L'action n'a pas abouti. Réessayez dans un instant.");
    }
  };

  const buildDialog = (p: Pending) => {
    switch (p.kind) {
      case 'suspend-vehicle':
        return {
          title: `Suspendre ${p.label} ?`,
          description: 'Le véhicule passera en statut Suspendu.',
          confirmLabel: 'Suspendre le véhicule',
          tone: 'danger' as const,
          reasonLabel: 'Motif de suspension',
          run: (reason: string) => onSuspendVehicle(p.vehicleId, reason),
        };
      case 'delete-photo':
        return {
          title: 'Supprimer cette photo ?',
          description: 'Cette action est définitive.',
          confirmLabel: 'Supprimer la photo',
          tone: 'danger' as const,
          reasonLabel: undefined,
          run: () => onDeletePhoto(p.vehicleId, p.photoId),
        };
      case 'suspend-fleet':
        return {
          title: 'Suspendre toute la flotte ?',
          description: `Les ${plural(fleet.length, 'véhicule')} de ${host.fullName} passeront en statut Suspendu.`,
          confirmLabel: 'Suspendre la flotte',
          tone: 'danger' as const,
          reasonLabel: 'Motif de suspension de la flotte',
          run: (reason: string) => onExecuteFleetAction(host.id, 'SUSPEND_ALL', reason),
        };
      case 'activate-fleet':
        return {
          title: 'Réactiver toute la flotte ?',
          description:
            'Tous les véhicules passeront en statut Vérifié, y compris ceux qui n’ont pas encore été validés individuellement.',
          confirmLabel: 'Réactiver la flotte',
          tone: 'neutral' as const,
          reasonLabel: undefined,
          run: () => onExecuteFleetAction(host.id, 'ACTIVATE_ALL'),
        };
      case 'ban':
        return {
          title: `Bannir ${host.fullName} ?`,
          description: 'Le compte de l’hôte sera bloqué. Indiquez le motif de cette décision.',
          confirmLabel: 'Bannir l’hôte',
          tone: 'danger' as const,
          reasonLabel: 'Motif du bannissement',
          run: (reason: string) => onBanHost(host.userId, reason),
        };
      case 'unban':
        return {
          title: `Débannir ${host.fullName} ?`,
          description: 'Le compte de l’hôte ne sera plus banni.',
          confirmLabel: 'Débannir l’hôte',
          tone: 'neutral' as const,
          reasonLabel: undefined,
          run: () => onUnbanHost(host.userId),
        };
    }
  };
  const dialog = pending ? buildDialog(pending) : null;

  /* ----- Onglets ----- */
  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'fleet', label: 'Flotte', icon: Car, count: ready ? fleet.length : undefined },
    { id: 'kyc', label: 'Identité KYC', icon: ShieldCheck },
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

  /* ----- Documents KYC ----- */
  const kycDocs = [
    { id: 'recto', label: 'Pièce d’identité, recto', url: host.documents.documentUrl },
    { id: 'verso', label: 'Pièce d’identité, verso', url: host.documents.documentBackUrl },
    { id: 'selfie', label: 'Selfie', url: host.documents.selfieUrl },
    { id: 'permis', label: 'Permis de conduire', url: host.documents.permisUrl },
  ];
  const kycItems: LightboxItem[] = kycDocs
    .filter((d) => d.url)
    .map((d) => ({ id: d.id, src: d.url as string, title: d.label, caption: host.fullName }));

  const fleetActionsDisabled = isMutating || !ready || fleet.length === 0;

  if (typeof document === 'undefined') return null;

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
              {host.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={host.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 id={`${uid}-title`} style={fontStyle} className="text-xl leading-tight tracking-tight text-brand-dark dark:text-white">
                  {host.fullName}
                </h2>
                <Pill tone={kyc.tone} icon={kyc.icon}>
                  {kyc.label}
                </Pill>
                {host.isBanned && (
                  <Pill tone="rust" icon={Ban}>
                    Compte banni
                  </Pill>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{host.email}</span>
                {host.phone && <span className="tabular-nums">{host.phone}</span>}
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

            {/* Santé de l'hôte */}
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

            {/* --- Flotte --- */}
            {tab === 'fleet' && (
              <section role="tabpanel" id={`${uid}-panel-fleet`} aria-labelledby={`${uid}-tab-fleet`} tabIndex={0} className={`space-y-4 outline-none ${FOCUS}`}>
                {!ready ? (
                  healthError ? null : (
                    <div className="space-y-4" aria-busy="true">
                      {[0, 1].map((i) => (
                        <div key={i} className={`${CARD} p-5 flex gap-4`}>
                          <SkeletonBlock className="h-36 w-56 hidden md:block" />
                          <div className="flex-1 space-y-3">
                            <SkeletonBlock className="h-5 w-56" />
                            <SkeletonBlock className="h-4 w-40" />
                            <SkeletonBlock className="h-11 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : fleet.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 text-center">
                    <Car className="mx-auto w-6 h-6 text-slate-400" strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Aucun véhicule enregistré</p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">Cet hôte n’a pas encore publié d’annonce.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {plural(fleet.length, 'véhicule')}
                      {awaitingValidation > 0 && (
                        <span className={`font-semibold ${TONES.gold.text}`}>, dont {awaitingValidation} à valider</span>
                      )}
                    </p>
                    {fleet.map((v) => (
                      <VehicleCard
                        key={v.id}
                        v={v}
                        busy={isMutating}
                        onOpenPhotos={(index) => setLightbox({ source: 'photos', vehicleId: v.id, index })}
                        onOpenDoc={(which) => openVehicleDoc(v, which)}
                        onValidate={() => runDirect(() => onValidateVehicle(v.id))}
                        onSuspend={() => setPending({ kind: 'suspend-vehicle', vehicleId: v.id, label: `${v.marque} ${v.modele}` })}
                        onFeature={() => runDirect(() => onFeatureVehicle(v.id, true))}
                      />
                    ))}
                  </>
                )}
              </section>
            )}

            {/* --- KYC --- */}
            {tab === 'kyc' && (
              <section role="tabpanel" id={`${uid}-panel-kyc`} aria-labelledby={`${uid}-tab-kyc`} tabIndex={0} className={`space-y-4 outline-none ${FOCUS}`}>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  Inscrit le {fmtDate(host.registeredAt)}
                </p>

                {host.statutKyc === 'REJETE' && host.kycRejectionReason && (
                  <Notice tone="rust">
                    <p className="font-semibold">Motif du rejet</p>
                    <p className="mt-0.5">{host.kycRejectionReason}</p>
                  </Notice>
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
                    {kycDocs.map((d) => (
                      <li key={d.id}>
                        {d.url ? (
                          <button
                            type="button"
                            aria-label={`Agrandir : ${d.label}`}
                            onClick={() =>
                              setLightbox({ source: 'docs', items: kycItems, index: Math.max(kycItems.findIndex((k) => k.id === d.id), 0) })
                            }
                            className={`block w-full overflow-hidden rounded-2xl text-left cursor-zoom-in ${CARD} ${FOCUS}`}
                          >
                            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-slate-800">
                              {isPdfUrl(d.url) ? (
                                <FileText className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={d.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                              )}
                            </div>
                            <div className="px-4 py-3 text-[13px] font-semibold text-slate-800 dark:text-slate-100">{d.label}</div>
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

            {/* --- Gouvernance --- */}
            {tab === 'governance' && (
              <section role="tabpanel" id={`${uid}-panel-governance`} aria-labelledby={`${uid}-tab-governance`} tabIndex={0} className={`space-y-5 outline-none ${FOCUS}`}>
                <div className={`${CARD} p-5`}>
                  <h3 style={fontStyle} className="text-base text-brand-dark dark:text-white mb-4">
                    Flotte
                  </h3>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <ActionRow
                      title="Suspendre toute la flotte"
                      description={ready ? `Les ${plural(fleet.length, 'véhicule')} passent en statut Suspendu.` : 'Chargement de la flotte…'}
                    >
                      <button type="button" className={BTN_DANGER_OUTLINE} disabled={fleetActionsDisabled} onClick={() => setPending({ kind: 'suspend-fleet' })}>
                        <Ban className="w-4 h-4" />
                        Suspendre
                      </button>
                    </ActionRow>
                    <ActionRow
                      title="Réactiver toute la flotte"
                      description="Tous les véhicules repassent en statut Vérifié."
                    >
                      <button type="button" className={BTN_OUTLINE} disabled={fleetActionsDisabled} onClick={() => setPending({ kind: 'activate-fleet' })}>
                        <CheckCircle2 className="w-4 h-4" />
                        Réactiver
                      </button>
                    </ActionRow>
                  </div>
                </div>

                <div className={`${CARD} p-5 border-[#a13d3d]/25`}>
                  <h3 style={fontStyle} className="text-base text-brand-dark dark:text-white mb-4">
                    Compte
                  </h3>
                  <ActionRow
                    title={host.isBanned ? 'Ce compte est banni' : 'Bannir l’hôte'}
                    description={
                      host.isBanned
                        ? 'L’hôte ne peut plus utiliser son compte tant que le bannissement est actif.'
                        : 'Bloque le compte de l’hôte. Un motif est demandé.'
                    }
                  >
                    {host.isBanned ? (
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

      {lightbox && lightboxItems.length > 0 && (
        <Lightbox
          items={lightboxItems}
          index={lightbox.index}
          onIndexChange={(index) => setLightbox((s) => (s ? { ...s, index } : s))}
          onClose={() => setLightbox(null)}
          renderActions={lightbox.source === 'photos' ? renderPhotoActions : undefined}
        />
      )}

      {pending && dialog && (
        <ActionDialog
          key={JSON.stringify(pending)}
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

export const AdminHostInspectorModal: React.FC<AdminHostInspectorModalProps> = (props) => {
  if (!props.isOpen || !props.item) return null;
  // key : tout l'état interne (onglet, visionneuse, dialogues) repart de zéro quand on change d'hôte
  return <InspectorDrawer key={props.item.id} {...props} item={props.item} />;
};