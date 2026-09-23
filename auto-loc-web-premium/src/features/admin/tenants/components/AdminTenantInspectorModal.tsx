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
  ExternalLink,
  Luggage,
  CalendarRange,
  DollarSign,
  Settings2,
} from 'lucide-react';
import { TenantHealth360, TenantItem } from '../hooks/useAdminTenants';
import { useModalBehavior } from '@/src/features/admin/hosts/hooks/useModalBehavior';
import { Lightbox, LightboxItem } from '@/src/features/admin/hosts/components/Lightbox';
import { ActionDialog } from '@/src/features/admin/hosts/components/ActionDialog';
import { formatCurrency } from '@/lib/utils';

interface AdminTenantInspectorModalProps {
  item: TenantItem | null;
  health360?: TenantHealth360;
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

type Pending =
  | { kind: 'reject-permis' }
  | { kind: 'ban' }
  | { kind: 'unban' };

const fontStyle = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const TONES: Record<Tone, { hex: string; text: string }> = {
  forest: { hex: '#0A3D2E', text: 'text-[#0A3D2E] dark:text-[#F1DFB6]' },
  gold: { hex: '#b27c2d', text: 'text-[#8a5f1f] dark:text-[#e0b96a]' },
  rust: { hex: '#a13d3d', text: 'text-[#a13d3d] dark:text-[#e59a9a]' },
  slate: { hex: '#64748b', text: 'text-slate-600 dark:text-slate-300' },
};

const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E] dark:focus-visible:outline-[#F1DFB6]';
const CARD = 'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs';

const BTN = `inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full text-[13px] font-semibold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-[#0A3D2E] text-[#F1DFB6] hover:brightness-125`;
const BTN_DANGER_OUTLINE = `${BTN} border border-[#a13d3d]/30 text-[#a13d3d] dark:text-[#e59a9a] hover:bg-[#a13d3d]/[0.06]`;

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

const VitalSigns: React.FC<{ matrix: TenantHealth360['healthMatrix'] }> = ({ matrix }) => {
  const tone = matrix.riskScore > 60 ? 'rust' : matrix.riskScore > 30 ? 'gold' : 'forest';
  const cell = 'bg-white dark:bg-slate-900 p-4 space-y-2 min-w-0';
  const label = 'text-[12px] text-slate-500 dark:text-slate-400';
  const value = 'text-[26px] leading-none tabular-nums text-[#041912] dark:text-white';

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
            className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${Math.min(Math.max(matrix.riskScore, 0), 100)}%`, backgroundColor: TONES[tone].hex }}
            />
          </div>
          <p className={`text-[12px] font-semibold ${TONES[tone].text}`}>Risque {matrix.riskLevel.toLowerCase()}</p>
        </div>

        <div className={cell}>
          <p className={label}>Total dépense GMV</p>
          <p style={fontStyle} className={`${value} text-[22px] truncate`}>
            {formatCurrency(matrix.totalSpent)}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Locations effectuées
          </p>
        </div>

        <div className={cell}>
          <p className={label}>Note Locataire</p>
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xl">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{matrix.noteLocataire > 0 ? matrix.noteLocataire.toFixed(1) : '—'}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Avis des propriétaires
          </p>
        </div>

        <div className={cell}>
          <p className={label}>Locations</p>
          <p style={fontStyle} className={value}>
            {matrix.totalBookings.toLocaleString('fr-FR')}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
            {matrix.completedBookings} terminées • {matrix.cancelledBookings} annulées
          </p>
        </div>
      </div>

      {matrix.riskWarnings.length > 0 && (
        <Notice tone={tone === 'forest' ? 'gold' : tone}>
          <p className="font-semibold">Points de vigilance conducteur</p>
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
    documents: {
      documentUrl: null,
      documentBackUrl: null,
      selfieUrl: null,
      permisUrl: item.permisUrl,
    },
  };

  const bookings = health360?.bookings ?? [];
  const initials = ((tenant.prenom?.[0] ?? '') + (tenant.nom?.[0] ?? '')).toUpperCase() || 'L';

  const docsList: LightboxItem[] = [
    { id: 'permis', src: tenant.documents.permisUrl || '', title: 'Permis de Conduire', caption: tenant.fullName },
    { id: 'id_front', src: tenant.documents.documentUrl || '', title: 'Pièce d’identité (Recto)', caption: tenant.fullName },
    { id: 'id_back', src: tenant.documents.documentBackUrl || '', title: 'Pièce d’identité (Verso)', caption: tenant.fullName },
    { id: 'selfie', src: tenant.documents.selfieUrl || '', title: 'Selfie de vérification', caption: tenant.fullName },
  ].filter((d) => d.src);

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
      case 'reject-permis':
        return {
          title: `Rejeter le permis de ${tenant.fullName} ?`,
          description: 'Indiquez le motif de rejet du permis de conduire.',
          confirmLabel: 'Rejeter le permis',
          tone: 'danger' as const,
          reasonLabel: 'Motif du rejet',
          run: (reason: string) => onRejectPermis(tenant.userId, reason),
        };
      case 'ban':
        return {
          title: `Bannir le locataire ${tenant.fullName} ?`,
          description: 'Le compte locataire sera immédiatement bloqué.',
          confirmLabel: 'Bannir le locataire',
          tone: 'danger' as const,
          reasonLabel: 'Motif du bannissement',
          run: (reason: string) => onBanTenant(tenant.userId, reason),
        };
      case 'unban':
        return {
          title: `Débannir ${tenant.fullName} ?`,
          description: 'Le compte locataire sera réactivé.',
          confirmLabel: 'Débannir le locataire',
          tone: 'neutral' as const,
          reasonLabel: undefined,
          run: () => onUnbanTenant(tenant.userId),
        };
    }
  };

  const dialog = pending ? buildDialog(pending) : null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 font-sans">
        <div
          className={`absolute inset-0 bg-[#041912]/60 backdrop-blur-[2px] transition-opacity duration-200 ${
            shown ? 'opacity-100' : 'opacity-0'
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
          className={`absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col bg-slate-50 dark:bg-slate-950 shadow-2xl outline-none border-l border-slate-200/80 dark:border-slate-800 transition-transform duration-300 ease-out ${
            shown ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <header className="shrink-0 flex items-start gap-4 bg-white dark:bg-slate-900 px-4 py-4 sm:px-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[15px] font-semibold ring-1 ring-inset ring-[#F1DFB6]/25"
              style={{ backgroundColor: '#0A3D2E', color: '#F1DFB6' }}
            >
              {tenant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 id={`${uid}-title`} style={fontStyle} className="text-xl leading-tight tracking-tight text-[#041912] dark:text-white">
                  {tenant.fullName}
                </h2>
                {tenant.statutKyc === 'VERIFIE' ? (
                  <Pill tone="forest" icon={ShieldCheck}>
                    KYC & Permis Vérifiés
                  </Pill>
                ) : tenant.documents.permisUrl ? (
                  <Pill tone="gold" icon={FileText}>
                    Permis Transmis
                  </Pill>
                ) : (
                  <Pill tone="slate" icon={ShieldAlert}>
                    Non Vérifié
                  </Pill>
                )}
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
              className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${FOCUS}`}
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Progress Bar */}
          <div className="h-0.5 shrink-0 bg-slate-200/60 dark:bg-slate-800" role="status">
            {isMutating && <div className="h-full w-full animate-pulse bg-[#b27c2d]" />}
          </div>

          {/* Tabs */}
          <div className="shrink-0 flex gap-1 overflow-x-auto scrollbar-none bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-2 sm:px-4">
            <button
              type="button"
              onClick={() => setTab('permis')}
              className={`flex h-12 items-center gap-2 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'permis' ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-[#F1DFB6]' : 'border-transparent text-slate-500'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Permis & Pièces KYC</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('bookings')}
              className={`flex h-12 items-center gap-2 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'bookings' ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-[#F1DFB6]' : 'border-transparent text-slate-500'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Réservations & Cautions ({bookings.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('governance')}
              className={`flex h-12 items-center gap-2 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === 'governance' ? 'border-[#0A3D2E] text-[#0A3D2E] dark:text-[#F1DFB6]' : 'border-transparent text-slate-500'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Gouvernance Compte</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {actionError && <Notice tone="rust">{actionError}</Notice>}

            {/* Vital Signs Risk Matrix */}
            {ready && health360 ? (
              <VitalSigns matrix={health360.healthMatrix} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBlock key={i} className="h-20" />
                ))}
              </div>
            )}

            {/* TAB 1: PERMIS & KYC */}
            {tab === 'permis' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Permis de Conduire & Documents d’Identité
                  </h3>
                  {tenant.documents.permisUrl && tenant.statutKyc !== 'VERIFIE' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => runDirect(() => onApprovePermis(tenant.userId))}
                        disabled={isMutating}
                        className={BTN_PRIMARY}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Valider le permis</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPending({ kind: 'reject-permis' })}
                        disabled={isMutating}
                        className={BTN_DANGER_OUTLINE}
                      >
                        <Ban className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Permis de conduire */}
                  <div className={`${CARD} p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Permis de conduire
                      </span>
                      {tenant.documents.permisUrl && (
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(0)}
                          className="text-xs font-bold text-[#0A3D2E] dark:text-[#F1DFB6] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Agrandir HD</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {tenant.documents.permisUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tenant.documents.permisUrl}
                        alt="Permis"
                        className="w-full h-52 object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                        onClick={() => setLightboxIndex(0)}
                      />
                    ) : (
                      <div className="h-52 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                        <FileText className="w-8 h-8" />
                        <span>Permis non encore fourni</span>
                      </div>
                    )}
                  </div>

                  {/* Piece d'identité / Selfie */}
                  <div className={`${CARD} p-4 space-y-3`}>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Pièce d’identité & Selfie KYC
                    </span>
                    {tenant.documents.documentUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tenant.documents.documentUrl}
                        alt="ID"
                        className="w-full h-52 object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                        onClick={() => setLightboxIndex(docsList.findIndex((d) => d.id === 'id_front'))}
                      />
                    ) : (
                      <div className="h-52 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                        <ShieldAlert className="w-8 h-8" />
                        <span>Pièce d’identité non fournie</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BOOKINGS & ESCROW */}
            {tab === 'bookings' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Historique des Locations & Séquestre Cautions
                </h3>
                {!bookings.length ? (
                  <div className={`${CARD} p-8 text-center text-slate-500 text-xs`}>
                    Aucune réservation enregistrée pour ce locataire.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className={`${CARD} p-4 space-y-3`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {b.vehicule ? `${b.vehicule.marque} ${b.vehicule.modele}` : 'Véhicule'}
                              </span>
                              {b.vehicule && (
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                  {b.vehicule.immatriculation}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {b.statut}
                              </span>
                            </div>
                            {b.proprietaire && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Hôte : {b.proprietaire.fullName} ({b.proprietaire.phone})
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">
                              {formatCurrency(b.totalLocataire)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Caution : {formatCurrency(b.cautionMontant)} ({b.cautionStatut})
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-4">
                          <span>Du : {new Date(b.dateDebut).toLocaleDateString('fr-FR')}</span>
                          <span>Au : {new Date(b.dateFin).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GOVERNANCE */}
            {tab === 'governance' && (
              <div className={`${CARD} p-6 space-y-6`}>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Gouvernance Administrateur du Compte Locataire
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gérez les accès et le statut de ce conducteur sur la plateforme AutoLoc.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Statut du Compte
                    </h4>
                    <p className="text-xs text-slate-500">
                      Actuel : {tenant.isBanned ? 'Banni / Accès Bloqué' : 'Compte Actif'}
                    </p>
                  </div>

                  {tenant.isBanned ? (
                    <button
                      type="button"
                      onClick={() => setPending({ kind: 'unban' })}
                      disabled={isMutating}
                      className={BTN_PRIMARY}
                    >
                      Débannir le locataire
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPending({ kind: 'ban' })}
                      disabled={isMutating}
                      className={BTN_DANGER_OUTLINE}
                    >
                      <Ban className="w-4 h-4" />
                      <span>Bannir le locataire</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for HD Documents */}
      {lightboxIndex !== null && docsList.length > 0 && (
        <Lightbox
          items={docsList}
          index={lightboxIndex}
          onIndexChange={(i) => setLightboxIndex(i)}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Action Dialog Confirmation Modal */}
      {dialog && (
        <ActionDialog
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
    document.body
  );
};

export const AdminTenantInspectorModal: React.FC<AdminTenantInspectorModalProps> = (props) => {
  if (!props.isOpen || !props.item) return null;
  return <InspectorDrawer key={props.item.id} {...props} item={props.item} />;
};
