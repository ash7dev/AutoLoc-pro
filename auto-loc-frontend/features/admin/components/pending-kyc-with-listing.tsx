'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck, Car, ChevronDown, ChevronUp,
  FileText, AlertTriangle, CheckCircle2,
  XCircle, Clock,
  Mail, Phone, Calendar, Loader2, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';
import type { AdminUser, AdminUserVehicle } from '../../../lib/nestjs/admin';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days > 30)  return `il y a ${Math.floor(days / 30)} mois`;
  if (days >= 1)  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours >= 1) return `il y a ${hours}h`;
  return `il y a ${mins} min`;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

function avatarInitials(prenom: string, nom: string) {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '??';
}

const TYPE_LABELS: Record<string, string> = {
  BERLINE: 'Berline', SUV: 'SUV', PICKUP: 'Pickup',
  MINIVAN: 'Minivan', UTILITAIRE: 'Utilitaire',
};
const CARBURANT_LABELS: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};
const TRANSMISSION_LABELS: Record<string, string> = {
  MANUELLE: 'Manuelle', AUTOMATIQUE: 'Automatique',
};

// ── Lightbox ───────────────────────────────────────────────────────────────────

function Lightbox({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex items-center justify-center
          w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>
      <div onClick={(e) => e.stopPropagation()} className="relative max-w-4xl max-h-[90vh] p-4">
        <img
          src={url}
          alt={label}
          className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
        />
        <p className="text-center text-white/50 text-[11px] font-medium mt-2">{label}</p>
      </div>
    </div>
  );
}

// ── Photo gallery ──────────────────────────────────────────────────────────────

function PhotoGallery({ photos }: { photos: AdminUserVehicle['photos'] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const sorted = [...photos].sort((a) => (a.estPrincipale ? -1 : 1));
  const main = sorted[0];
  const rest = sorted.slice(1);

  return (
    <>
      <div className="space-y-2">
        {main ? (
          <div
            className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer
              relative group"
            onClick={() => setLightboxUrl(main.url)}
          >
            <img src={main.url} alt="Photo principale" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors
              flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-bold
                bg-black/50 px-3 py-1 rounded-full transition-opacity">
                Agrandir
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl bg-slate-100 flex items-center justify-center">
            <Car className="w-8 h-8 text-slate-300" strokeWidth={1.25} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {rest.map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-slate-100
                  cursor-pointer hover:opacity-75 transition-opacity border border-slate-200"
                onClick={() => setLightboxUrl(p.url)}
              >
                <img src={p.url} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxUrl && (
        <Lightbox url={lightboxUrl} label="Photo du véhicule" onClose={() => setLightboxUrl(null)} />
      )}
    </>
  );
}

// ── Vehicle detail card ────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5
      border-b border-slate-100 last:border-0">
      <span className="text-[11.5px] font-semibold text-black/35 flex-shrink-0">{label}</span>
      <span className="text-[12px] font-bold text-black text-right leading-snug">{value}</span>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-1.5">{title}</p>
      <div className="rounded-xl border border-slate-100 bg-white px-3">{children}</div>
    </div>
  );
}

function VehicleDetailCard({ vehicle }: { vehicle: AdminUserVehicle }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-3">
      <PhotoGallery photos={vehicle.photos} />

      {/* Prix + toggle */}
      <div className="flex items-center justify-between rounded-xl bg-emerald-50
        border border-emerald-200/60 px-4 py-3">
        <span className="text-[12px] font-semibold text-emerald-700">Prix par jour</span>
        <span className="text-[22px] font-black text-emerald-600 leading-none">
          {formatPrice(vehicle.prixParJour)}
          <span className="text-[11px] font-medium text-emerald-400 ml-1">FCFA</span>
        </span>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          'w-full flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2',
          'text-[12px] font-bold transition-colors duration-200',
          showDetails
            ? 'border-slate-200 bg-slate-50 text-black/50 hover:bg-slate-100'
            : 'border-slate-200 bg-white text-black/70 hover:bg-slate-50',
        )}
      >
        {showDetails
          ? <><ChevronUp className="w-3.5 h-3.5" strokeWidth={2.5} /> Masquer les détails</>
          : <><ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} /> Voir les détails</>
        }
      </button>

      {showDetails && (
        <div className="space-y-4">
          <SectionBlock title="Général">
        <DetailItem label="Marque" value={vehicle.marque} />
        <DetailItem label="Modèle" value={vehicle.modele} />
        <DetailItem label="Année" value={vehicle.annee} />
        <DetailItem label="Type" value={TYPE_LABELS[vehicle.type] ?? vehicle.type} />
        <DetailItem
          label="Transmission"
          value={vehicle.transmission
            ? (TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission)
            : null}
        />
        <DetailItem label="Immatriculation" value={vehicle.immatriculation} />
      </SectionBlock>

      <SectionBlock title="Localisation">
        <DetailItem label="Ville" value={vehicle.ville} />
        <DetailItem label="Adresse" value={vehicle.adresse} />
      </SectionBlock>

      <SectionBlock title="Conditions de location">
        <DetailItem
          label="Carburant"
          value={vehicle.carburant
            ? (CARBURANT_LABELS[vehicle.carburant] ?? vehicle.carburant)
            : null}
        />
        <DetailItem
          label="Nb. places"
          value={vehicle.nombrePlaces ? `${vehicle.nombrePlaces} places` : null}
        />
        <DetailItem
          label="Durée min."
          value={`${vehicle.joursMinimum} jour${vehicle.joursMinimum > 1 ? 's' : ''}`}
        />
        <DetailItem label="Âge minimum" value={`${vehicle.ageMinimum} ans`} />
      </SectionBlock>

      {vehicle.equipements.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-1.5">
            Équipements
          </p>
          <div className="flex flex-wrap gap-1.5">
            {vehicle.equipements.map((eq) => (
              <span
                key={eq}
                className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200
                  px-2.5 py-1 text-[11px] font-semibold text-black/60"
              >
                {eq}
              </span>
            ))}
          </div>
        </div>
      )}

      {(vehicle.zoneConduite || vehicle.assurance || vehicle.reglesSpecifiques) && (
            <SectionBlock title="Règles & Conditions">
              <DetailItem label="Zone conduite" value={vehicle.zoneConduite} />
              <DetailItem label="Assurance" value={vehicle.assurance} />
              <DetailItem label="Règles spécifiques" value={vehicle.reglesSpecifiques} />
            </SectionBlock>
          )}

          <p className="flex items-center gap-1.5 text-[11px] font-medium text-black/30">
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            Annonce créée {formatRelative(vehicle.creeLe)}
          </p>
        </div>
      )}
    </div>
  );
}

// ── KYC document panel (Recto / Verso) ────────────────────────────────────────

function KycDocPanel({ kyc }: { kyc: NonNullable<AdminUser['kyc']> }) {
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  const docs = [
    { url: kyc.documentUrl, label: 'Recto — Face avant' },
    { url: kyc.selfieUrl,   label: 'Verso — Face arrière' },
  ];

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {docs.map(({ url, label }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-2">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                {label}
              </p>
              {url ? (
                <div
                  className="relative rounded-lg overflow-hidden cursor-pointer group aspect-[3/2]"
                  onClick={() => setLightbox({ url, label })}
                >
                  <img src={url} alt={label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25
                    transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-[10px]
                      font-bold bg-black/50 px-2 py-0.5 rounded-full transition-opacity">
                      Voir
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 aspect-[3/2]
                  rounded-lg border border-dashed border-slate-200 bg-white">
                  <FileText className="w-5 h-5 text-slate-300" strokeWidth={1.25} />
                  <p className="text-[10px] font-medium text-slate-400">Non disponible</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="flex items-center gap-1.5 text-[11px] font-medium text-black/30">
          <Clock className="w-3 h-3" strokeWidth={1.75} />
          Soumis {formatRelative(kyc.soumisLe)}
        </p>
      </div>

      {lightbox && (
        <Lightbox url={lightbox.url} label={lightbox.label} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────────

interface PendingUserRowProps {
  user: AdminUser;
  pendingId: string | null;
  onApproveKyc: (userId: string) => void;
  onValidateAll: (userId: string, brouillonIds: string[]) => void;
}

function PendingUserRow({
  user, pendingId, onApproveKyc, onValidateAll,
}: PendingUserRowProps) {
  const [expanded, setExpanded] = useState(false);

  const prenom   = user.utilisateur?.prenom ?? '';
  const nom      = user.utilisateur?.nom ?? '';
  const initials = avatarInitials(prenom, nom);
  const vehicles = user.vehicles ?? [];
  const isLoading = pendingId === user.id || vehicles.some((v) => pendingId === v.id);

  const brouillonVehicles   = vehicles.filter((v) => v.statut === 'BROUILLON');
  const brouillonVehicleIds = brouillonVehicles.map((v) => v.id);

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-200',
      expanded
        ? 'border-emerald-200/80 bg-emerald-50/20'
        : 'border-slate-200 bg-white hover:border-slate-300',
    )}>

      {/* ── Collapsed row ── */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        {/* Avatar */}
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full
          bg-black border border-emerald-400/20 text-emerald-400 text-[13px] font-black">
          {initials}
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-black text-black tracking-tight truncate">
            {prenom} {nom}
          </p>
          <p className="text-[12px] font-medium text-black/40 truncate">{user.email}</p>
        </div>

        {/* Status badges — stacked column */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60
            bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 whitespace-nowrap">
            <BadgeCheck className="w-2.5 h-2.5" strokeWidth={2} />
            KYC En attente
          </span>
          {brouillonVehicleIds.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-300/60
              bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 whitespace-nowrap">
              <Car className="w-2.5 h-2.5" strokeWidth={2} />
              {brouillonVehicleIds.length} annonce{brouillonVehicleIds.length > 1 ? 's' : ''} En attente
            </span>
          )}
        </div>

        {/* Chevron */}
        <div className={cn(
          'flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors',
          expanded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400',
        )}>
          {expanded
            ? <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
            : <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
          }
        </div>
      </button>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="border-t border-slate-200/60 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: KYC */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                <h4 className="text-[13px] font-black text-black">Pièce d&apos;identité</h4>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                {user.utilisateur?.telephone && (
                  <span className="flex items-center gap-2 text-[12px] font-medium text-black/50">
                    <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {user.utilisateur.telephone}
                  </span>
                )}
                <span className="flex items-center gap-2 text-[12px] font-medium text-black/50">
                  <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {user.email}
                </span>
                <span className="flex items-center gap-2 text-[12px] font-medium text-black/50">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Inscrit {formatRelative(user.createdAt)}
                </span>
              </div>

              {user.kyc && <KycDocPanel kyc={user.kyc} />}

              <div className="mt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onApproveKyc(user.id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl
                    bg-emerald-500 text-white text-[12.5px] font-bold px-3 py-2.5
                    hover:bg-emerald-600 transition-colors duration-200
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pendingId === user.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  }
                  Valider KYC uniquement
                </button>
              </div>
            </div>

            {/* Right: Vehicle(s) detail */}
            {brouillonVehicles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Car className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
                  <h4 className="text-[13px] font-black text-black">
                    Annonce{brouillonVehicles.length > 1 ? 's' : ''} en brouillon
                  </h4>
                  <span className="ml-auto text-[10.5px] font-bold text-black/30">
                    {brouillonVehicles.length} véhicule{brouillonVehicles.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-6">
                  {brouillonVehicles.map((v, idx) => (
                    <div key={v.id}>
                      {brouillonVehicles.length > 1 && (
                        <p className="text-[10px] font-bold uppercase tracking-widest
                          text-black/25 mb-2">
                          Véhicule {idx + 1}
                        </p>
                      )}
                      <VehicleDetailCard vehicle={v} />
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border
                  border-blue-200/60 p-3 mt-4">
                  <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                    strokeWidth={1.75} />
                  <p className="text-[11px] font-medium text-blue-700 leading-snug">
                    Bloquées en <span className="font-bold">brouillon</span> jusqu&apos;à la
                    validation du KYC. &ldquo;Valider tout&rdquo; les publie directement.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Double validation CTA */}
          {brouillonVehicleIds.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100
              flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-black/40">
                  KYC + Annonce en une seule action
                </p>
                <p className="text-[11px] font-medium text-black/25 mt-0.5">
                  Valide l&apos;identité et publie{' '}
                  {brouillonVehicleIds.length} annonce{brouillonVehicleIds.length > 1 ? 's' : ''}{' '}
                  simultanément
                </p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onValidateAll(user.id, brouillonVehicleIds)}
                className="inline-flex items-center gap-2 rounded-xl
                  bg-black text-emerald-400 text-[12.5px] font-bold px-5 py-2.5
                  hover:bg-emerald-400 hover:text-black
                  transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                }
                Valider tout — KYC + {brouillonVehicleIds.length} annonce{brouillonVehicleIds.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section principale ─────────────────────────────────────────────────────────

export function PendingKycWithListingSection() {
  const router = useRouter();
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nest/admin/users?kycStatus=EN_ATTENTE');
      if (!res.ok) throw new Error();
      const data: AdminUser[] = await res.json();
      setUsers(data.filter((u) =>
        u.vehicles?.some((v) => v.statut === 'BROUILLON') ?? false,
      ));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleApproveKyc(userId: string) {
    setPendingId(userId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(userId)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      showToast('success', 'KYC approuvé. Les véhicules sont passés en attente de validation.');
      router.refresh();
      await load();
    } catch {
      showToast('error', "Erreur lors de l'approbation KYC.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleValidateAll(userId: string, brouillonIds: string[]) {
    setPendingId(userId);
    try {
      const kycRes = await fetch(`/api/nest${ADMIN_PATHS.approveKyc(userId)}`, { method: 'PATCH' });
      if (!kycRes.ok) throw new Error('KYC');

      for (const vid of brouillonIds) {
        setPendingId(vid);
        await fetch(`/api/nest${ADMIN_PATHS.validateVehicle(vid)}`, { method: 'PATCH' });
      }

      showToast('success', 'KYC validé et annonces publiées avec succès.');
      router.refresh();
      await load();
    } catch {
      showToast('error', "Une erreur est survenue. Vérifiez l'état des éléments.");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) {
    return (
      <section className="mb-8">
        <div className="h-5 w-48 rounded-lg bg-slate-100 animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (users.length === 0) return null;

  return (
    <>
      <section className="mb-8" aria-labelledby="double-pending-heading">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border
                border-amber-300/60 bg-amber-50 px-2.5 py-1 text-[10.5px] font-bold text-amber-700">
                <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                Double validation requise
              </span>
            </div>
            <h2
              id="double-pending-heading"
              className="text-[17px] font-black tracking-tight text-black"
            >
              KYC{' '}
              <span className="text-black/40 font-semibold">+</span>{' '}
              Annonce en attente
            </h2>
            <p className="mt-0.5 text-[12.5px] font-medium text-black/40">
              KYC soumis avec une annonce simultanément — validation groupée disponible.
            </p>
          </div>

          <span className="flex-shrink-0 inline-flex items-center justify-center
            min-w-[32px] h-8 rounded-xl bg-amber-100 border border-amber-300/60
            text-[13px] font-black text-amber-700 px-2.5">
            {users.length}
          </span>
        </div>

        <div className="space-y-2">
          {users.map((user) => (
            <PendingUserRow
              key={user.id}
              user={user}
              pendingId={pendingId}
              onApproveKyc={handleApproveKyc}
              onValidateAll={handleValidateAll}
            />
          ))}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2.5',
          'rounded-2xl px-4 py-3 text-[13px] font-bold text-white shadow-xl max-w-sm',
          'animate-in slide-in-from-bottom-2 duration-300',
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500',
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            : <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
