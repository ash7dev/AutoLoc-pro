'use client';

import React, { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car, CheckCircle2, XCircle, Search, Clock,
  MapPin, Fuel, AlertTriangle, Loader2,
  Eye, X, ChevronLeft, ChevronRight, Star,
  Key, Calendar, Users, Shield,
  Phone, Mail, Info, ZoomIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminVehicle } from '../../../lib/nestjs/admin';
import { ADMIN_PATHS } from '../../../lib/nestjs/admin';

// ── Types ──────────────────────────────────────────────────────────────────────

export type TabValue = 'ALL' | 'PENDING' | 'EN_ATTENTE_VALIDATION' | 'VERIFIE' | 'SUSPENDU' | 'BROUILLON' | 'ARCHIVE';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'ALL',      label: 'Tous'       },
  { value: 'PENDING',  label: 'En attente' },
  { value: 'VERIFIE',  label: 'Vérifié'    },
  { value: 'SUSPENDU', label: 'Suspendu'   },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  EN_ATTENTE_VALIDATION: { label: 'En attente', bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   border: 'border-amber-300/50'   },
  VERIFIE:               { label: 'Vérifié',    bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-300/50' },
  SUSPENDU:              { label: 'Suspendu',   bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     border: 'border-red-300/50'     },
  BROUILLON:             { label: 'Brouillon',  bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-200'      },
  ARCHIVE:               { label: 'Archivé',    bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-300',   border: 'border-slate-200'      },
};

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }
function getOwnerInitials(v: AdminVehicle) {
  const p = v.proprietaire?.prenom?.[0] ?? '';
  const n = v.proprietaire?.nom?.[0] ?? '';
  return (p + n).toUpperCase() || v.proprietaire?.email?.[0]?.toUpperCase() || '?';
}
function getOwnerName(v: AdminVehicle) {
  if (!v.proprietaire) return null;
  return `${v.proprietaire.prenom ?? ''} ${v.proprietaire.nom ?? ''}`.trim() || v.proprietaire.email;
}

// ── Lightbox ───────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm
      animate-in fade-in duration-200" onClick={onClose}>
      <button className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl
        border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all" onClick={onClose}>
        <X className="h-5 w-5" strokeWidth={2} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Aperçu"
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ── Photo gallery ──────────────────────────────────────────────────────────────

function PhotoGallery({ photos, onLightbox }: {
  photos: AdminVehicle['photos'];
  onLightbox: (url: string) => void;
}) {
  const [current, setCurrent] = useState(0);
  const main = photos[current];

  if (photos.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
        <Car className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="group relative h-52 cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        onClick={() => onLightbox(main.url)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main.url} alt="Photo principale"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

        <div className="absolute inset-0 flex items-center justify-center
          bg-black/0 group-hover:bg-black/25 transition-all duration-200">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity
            inline-flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-[11px] font-bold text-white">
            <ZoomIn className="w-3.5 h-3.5" strokeWidth={2} />Agrandir
          </span>
        </div>

        {main.estPrincipale && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full
            bg-black border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            <Star className="h-2.5 w-2.5 fill-emerald-400" strokeWidth={0} />Principale
          </div>
        )}

        {photos.length > 1 && (
          <>
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 backdrop-blur-sm
              px-2 py-0.5 text-[10px] font-bold text-white/90">{current + 1}/{photos.length}</div>
            <button className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center
              rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center
              rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photos.length); }}>
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {photos.map((p, i) => (
            <button key={p.id} onClick={() => setCurrent(i)}
              className={cn('relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                i === current ? 'border-black ring-2 ring-black/10' : 'border-transparent opacity-45 hover:opacity-70')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail item ────────────────────────────────────────────────────────────────

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-black/25" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-black/25">{label}</p>
        <p className="text-[13px] font-semibold text-black break-words">{value}</p>
      </div>
    </div>
  );
}

// ── Vehicle detail modal ───────────────────────────────────────────────────────

function VehicleDetailModal({ vehicle, pendingId, onClose, onValidate, onSuspend }: {
  vehicle: AdminVehicle;
  pendingId: string | null;
  onClose: () => void;
  onValidate: (id: string) => void;
  onSuspend: (id: string, name: string) => void;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const isLoading = pendingId === vehicle.id;
  const status = STATUS_CONFIG[vehicle.statut];
  const ownerName = getOwnerName(vehicle);
  const canValidate = ['EN_ATTENTE_VALIDATION', 'BROUILLON', 'SUSPENDU'].includes(vehicle.statut);
  const canReject   = ['EN_ATTENTE_VALIDATION', 'BROUILLON', 'VERIFIE'].includes(vehicle.statut);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && !lightboxUrl) onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, lightboxUrl]);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white
          shadow-2xl shadow-black/20 animate-in zoom-in-95 duration-200">

          {/* Header — noir comme tous les autres modals */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3
            bg-black px-6 py-4 overflow-hidden">
            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
            <div className="relative z-10 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Fiche véhicule</p>
              <h2 className="text-[16px] font-black tracking-tight text-white truncate">
                {vehicle.marque} <span className="text-emerald-400">{vehicle.modele}</span>
                <span className="ml-1.5 text-[13px] font-medium text-white/35">{vehicle.annee}</span>
              </h2>
              <p className="text-[11px] font-medium text-white/30 mt-0.5">{vehicle.immatriculation}</p>
            </div>
            <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                status.bg, status.text, status.border)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />{status.label}
              </span>
              <button onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl
                  border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 bg-slate-50/40">
            <PhotoGallery photos={vehicle.photos} onLightbox={setLightboxUrl} />

            {/* Prix */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
              <p className="text-[12px] font-bold text-black/35 uppercase tracking-wide">Prix par jour</p>
              <p className="text-[22px] font-black text-emerald-500 tabular-nums leading-none">
                {formatPrice(vehicle.prixParJour)}
                <span className="text-[12px] font-medium text-black/30 ml-1">FCFA</span>
              </p>
            </div>

            {/* Général */}
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3">Général</p>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={Car}      label="Type"         value={vehicle.type} />
                <DetailItem icon={Fuel}     label="Carburant"    value={vehicle.carburant} />
                <DetailItem icon={Key}      label="Transmission" value={vehicle.transmission} />
                <DetailItem icon={Users}    label="Places"       value={vehicle.nombrePlaces} />
                <DetailItem icon={Calendar} label="Créé le"      value={new Date(vehicle.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>
            </div>

            {/* Localisation */}
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3">Localisation</p>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={MapPin} label="Ville"         value={vehicle.ville} />
                <DetailItem icon={MapPin} label="Adresse"       value={vehicle.adresse} />
                <DetailItem icon={MapPin} label="Zone conduite" value={vehicle.zoneConduite} />
              </div>
            </div>

            {/* Conditions */}
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3">Conditions</p>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={Calendar} label="Durée minimale" value={vehicle.joursMinimum ? `${vehicle.joursMinimum} j` : null} />
                <DetailItem icon={Users}    label="Âge minimum"    value={vehicle.ageMinimum ? `${vehicle.ageMinimum} ans` : null} />
                <DetailItem icon={Shield}   label="Assurance"      value={vehicle.assurance} />
              </div>
            </div>

            {/* Équipements */}
            {vehicle.equipements.length > 0 && (
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3">Équipements</p>
                <div className="flex flex-wrap gap-1.5">
                  {vehicle.equipements.map((eq) => (
                    <span key={eq} className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11.5px] font-semibold text-black/60">{eq}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Règles */}
            {vehicle.reglesSpecifiques && (
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-2">Règles spécifiques</p>
                <p className="text-[13px] font-medium text-black/60 leading-relaxed whitespace-pre-wrap">
                  {vehicle.reglesSpecifiques}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Locations', value: vehicle.totalLocations, color: 'text-black'       },
                { label: 'Note / 5',  value: Number(vehicle.note).toFixed(1), color: 'text-amber-500' },
                { label: 'Avis',      value: vehicle.totalAvis,       color: 'text-black'       },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-white px-3 py-3 text-center">
                  <p className={cn('text-[20px] font-black tabular-nums leading-none', color)}>{value}</p>
                  <p className="text-[10px] font-bold text-black/25 uppercase tracking-wide mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Propriétaire */}
            {vehicle.proprietaire && (
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3">Propriétaire</p>
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl
                    bg-black text-emerald-400 text-[12px] font-black flex-shrink-0">
                    {getOwnerInitials(vehicle)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-black text-black">{ownerName}</p>
                    <p className="text-[11px] font-medium text-black/35">{vehicle.proprietaire.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon={Mail}  label="Email"     value={vehicle.proprietaire.email} />
                  <DetailItem icon={Phone} label="Téléphone" value={vehicle.proprietaire.telephone} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {(canValidate || canReject) && (
            <div className="sticky bottom-0 flex flex-col gap-2.5 border-t border-slate-100 bg-white px-6 py-4">
              {vehicle.statut === 'BROUILLON' && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50 px-3 py-2.5">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 text-amber-500 mt-0.5" strokeWidth={2} />
                  <p className="text-[12px] font-semibold text-amber-700 leading-snug">
                    Le KYC du propriétaire doit être approuvé en premier pour valider cette annonce.
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                {canValidate && vehicle.statut !== 'BROUILLON' && (
                  <button type="button" disabled={isLoading}
                    onClick={() => { onValidate(vehicle.id); onClose(); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                      bg-black text-emerald-400 py-2.5 text-[13px] font-bold
                      hover:bg-emerald-400 hover:text-black shadow-md shadow-black/15
                      hover:-translate-y-px active:translate-y-0 transition-all duration-200
                      disabled:opacity-40 disabled:cursor-not-allowed">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" strokeWidth={2} />}
                    {vehicle.statut === 'SUSPENDU' ? 'Réactiver' : "Approuver l'annonce"}
                  </button>
                )}
                {canReject && (
                  <button type="button" disabled={isLoading}
                    onClick={() => { onSuspend(vehicle.id, `${vehicle.marque} ${vehicle.modele}`); onClose(); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                      border border-slate-200 text-black/50 py-2.5 text-[13px] font-bold
                      hover:bg-red-50 hover:text-red-500 hover:border-red-200
                      transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    <XCircle className="h-4 w-4" strokeWidth={2} />
                    {vehicle.statut === 'VERIFIE' ? 'Suspendre' : 'Rejeter'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxUrl && <Lightbox src={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </>
  );
}

// ── Suspend dialog ─────────────────────────────────────────────────────────────

function SuspendDialog({ vehicleName, raison, onRaisonChange, onConfirm, onCancel, loading, isReject }: {
  vehicleName: string; raison: string;
  onRaisonChange: (v: string) => void;
  onConfirm: () => void; onCancel: () => void;
  loading: boolean; isReject?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-black/20
        overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-50 border border-red-200/60">
            <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[14px] font-black text-black leading-tight">
              {isReject ? "Rejeter l'annonce" : 'Suspendre le véhicule'}
            </p>
            <p className="text-[11.5px] font-medium text-black/40">{vehicleName}</p>
          </div>
        </div>
        <div className="p-5">
          <label className="block mb-1.5 text-[11.5px] font-bold text-black/50">
            Raison <span className="text-red-500">*</span>
          </label>
          <textarea value={raison} onChange={(e) => onRaisonChange(e.target.value)}
            placeholder={isReject ? 'Ex : Informations incorrectes, photos non conformes…' : 'Ex : Photos non conformes…'}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5
              text-[13px] font-medium text-black placeholder-black/25
              focus:border-red-400/50 focus:outline-none focus:ring-1 focus:ring-red-400/20
              transition-all resize-none" />
          <div className="flex gap-2.5 mt-4">
            <button type="button" onClick={onCancel} disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[12.5px] font-bold text-black/50
                hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-40">
              Annuler
            </button>
            <button type="button" onClick={onConfirm} disabled={loading || !raison.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                bg-red-500 text-white py-2.5 text-[12.5px] font-bold
                hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isReject ? 'Confirmer le rejet' : 'Confirmer la suspension'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vehicle card ───────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, pendingId, onValidate, onSuspend, onDetails }: {
  vehicle: AdminVehicle; pendingId: string | null;
  onValidate: (id: string) => void;
  onSuspend: (id: string, name: string) => void;
  onDetails: (vehicle: AdminVehicle) => void;
}) {
  const status = STATUS_CONFIG[vehicle.statut];
  const mainPhoto = vehicle.photos.find((p) => p.estPrincipale) ?? vehicle.photos[0];
  const ownerName = getOwnerName(vehicle);
  const isLoading = pendingId === vehicle.id;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden
      hover:shadow-lg hover:shadow-slate-200/80 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex gap-4 p-4">
        {/* Photo */}
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 group">
          {mainPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainPhoto.url} alt={`${vehicle.marque} ${vehicle.modele}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
            </div>
          )}
          {vehicle.photos.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 backdrop-blur-sm
              px-1.5 py-0.5 text-[9px] font-bold text-white/90">{vehicle.photos.length}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-[14.5px] font-black tracking-tight text-black leading-tight">
                {vehicle.marque} <span className="text-emerald-500">{vehicle.modele}</span>
              </h3>
              <p className="text-[11.5px] font-medium text-black/35">{vehicle.annee} · {vehicle.type}</p>
            </div>
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0',
              status.bg, status.text, status.border)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />{status.label}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] font-medium text-black/40">
              <MapPin className="h-3 w-3" strokeWidth={1.75} />{vehicle.ville}
            </span>
            {vehicle.carburant && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-black/40">
                <Fuel className="h-3 w-3" strokeWidth={1.75} />{vehicle.carburant}
              </span>
            )}
            {ownerName && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-black/40">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-md
                  bg-black text-emerald-400 text-[8px] font-black flex-shrink-0">
                  {getOwnerInitials(vehicle)}
                </span>
                {ownerName}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
            <p className="text-[15px] font-black text-emerald-500 tabular-nums leading-none">
              {formatPrice(vehicle.prixParJour)}
              <span className="text-[10.5px] font-medium text-black/30 ml-1">FCFA/j</span>
            </p>
            <span className="flex items-center gap-1 text-[10.5px] font-medium text-black/25">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              {new Date(vehicle.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
        <button type="button" onClick={() => onDetails(vehicle)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
            border border-slate-200 text-[12px] font-bold text-black/60
            hover:bg-white hover:border-slate-300 hover:text-black transition-all duration-150">
          <Eye className="h-3.5 w-3.5" strokeWidth={2} />Détails
        </button>

        {vehicle.statut === 'BROUILLON' ? (
          <div className="flex flex-1 items-center gap-1.5 rounded-xl border border-amber-200/60 bg-amber-50 px-2.5 py-2">
            <Info className="h-3 w-3 flex-shrink-0 text-amber-500" strokeWidth={2} />
            <span className="text-[10.5px] font-semibold text-amber-700 leading-tight">KYC à approuver en premier</span>
          </div>
        ) : (['EN_ATTENTE_VALIDATION', 'SUSPENDU'].includes(vehicle.statut)) && (
          <button type="button" disabled={isLoading} onClick={() => onValidate(vehicle.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              bg-black text-emerald-400 text-[12px] font-bold
              hover:bg-emerald-400 hover:text-black transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />}
            {vehicle.statut === 'SUSPENDU' ? 'Réactiver' : 'Approuver'}
          </button>
        )}

        {(['EN_ATTENTE_VALIDATION', 'BROUILLON', 'VERIFIE'].includes(vehicle.statut)) && (
          <button type="button" disabled={isLoading}
            onClick={() => onSuspend(vehicle.id, `${vehicle.marque} ${vehicle.modele}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
              border border-slate-200 text-[12px] font-bold text-black/50
              hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed">
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
            {vehicle.statut === 'VERIFIE' ? 'Suspendre' : 'Rejeter'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main list ──────────────────────────────────────────────────────────────────

export function AdminVehiclesList({ vehicles, currentStatut }: {
  vehicles: AdminVehicle[];
  currentStatut: TabValue;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch]               = useState('');
  const [pendingId, setPendingId]         = useState<string | null>(null);
  const [toast, setToast]                 = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<AdminVehicle | null>(null);
  const [suspendDialog, setSuspendDialog] = useState<{
    open: boolean; vehicleId: string; vehicleName: string; raison: string; isReject: boolean;
  }>({ open: false, vehicleId: '', vehicleName: '', raison: '', isReject: false });

  const filtered = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const owner = v.proprietaire ? `${v.proprietaire.prenom ?? ''} ${v.proprietaire.nom ?? ''}`.toLowerCase() : '';
    return v.marque.toLowerCase().includes(q) || v.modele.toLowerCase().includes(q) || owner.includes(q);
  });

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function getErrorMessage(res: Response, fallback: string) {
    const contentType = res.headers.get('content-type') ?? '';
    try {
      if (contentType.includes('application/json')) {
        const payload = await res.json() as { message?: string | string[] };
        if (Array.isArray(payload?.message)) return payload.message.join(' ');
        if (payload?.message) return payload.message;
      } else {
        const text = await res.text();
        if (text?.trim()) return text;
      }
    } catch {
      // ignore parsing errors
    }
    return fallback;
  }

  function changeTab(value: TabValue) {
    const url =
      value === 'ALL'     ? '/dashboard/admin/vehicles' :
      value === 'PENDING' ? '/dashboard/admin/vehicles?statut=PENDING' :
      `/dashboard/admin/vehicles?statut=${value}`;
    startTransition(() => router.push(url));
  }

  const handleValidate = useCallback(async (vehicleId: string) => {
    setPendingId(vehicleId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.validateVehicle(vehicleId)}`, { method: 'PATCH' });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Une erreur est survenue. Réessayez.'));
      showToast('success', 'Véhicule approuvé avec succès.');
      router.refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
    } finally { setPendingId(null); }
  }, [router]);

  async function handleSuspend() {
    if (!suspendDialog.raison.trim()) return;
    setPendingId(suspendDialog.vehicleId);
    try {
      const res = await fetch(`/api/nest${ADMIN_PATHS.suspendVehicle(suspendDialog.vehicleId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raison: suspendDialog.raison }),
      });
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Une erreur est survenue. Réessayez.'));
      setSuspendDialog({ open: false, vehicleId: '', vehicleName: '', raison: '', isReject: false });
      showToast('success', suspendDialog.isReject ? 'Annonce rejetée.' : 'Véhicule suspendu.');
      router.refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
    } finally { setPendingId(null); }
  }

  const pendingCount = vehicles.filter((v) => v.statut === 'EN_ATTENTE_VALIDATION' || v.statut === 'BROUILLON').length;
  const openSuspend = (id: string, name: string, isReject = false) =>
    setSuspendDialog({ open: true, vehicleId: id, vehicleName: name, raison: '', isReject });

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5 flex-wrap">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/25" strokeWidth={2} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un véhicule, propriétaire…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5
              text-[13px] font-medium text-black placeholder-black/25
              focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20
              transition-all shadow-sm" />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {TABS.map((tab) => (
            <button key={tab.value} type="button" onClick={() => changeTab(tab.value)}
              className={cn('inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all duration-200',
                currentStatut === tab.value
                  ? 'bg-black text-emerald-400 shadow-sm shadow-black/10'
                  : 'bg-slate-100 text-black/50 hover:bg-slate-200 hover:text-black')}>
              {tab.label}
              {tab.value === 'PENDING' && pendingCount > 0 && currentStatut !== 'PENDING' && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-4
                  rounded-full bg-amber-400/20 text-amber-600 text-[9px] font-bold px-1">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-[12px] font-medium text-black/30">
            {filtered.length} véhicule{filtered.length > 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2
            rounded-xl bg-black text-emerald-400 text-[12px] font-black">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16
          rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100">
            <Car className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-bold text-black/30">
            {search ? 'Aucun résultat pour cette recherche' : 'Aucun véhicule trouvé'}
          </p>
          {search && (
            <button type="button" onClick={() => setSearch('')}
              className="text-[12px] font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} pendingId={pendingId}
              onValidate={handleValidate}
              onSuspend={(id, name) => openSuspend(id, name, v.statut === 'EN_ATTENTE_VALIDATION' || v.statut === 'BROUILLON')}
              onDetails={setDetailVehicle} />
          ))}
        </div>
      )}

      {detailVehicle && (
        <VehicleDetailModal vehicle={detailVehicle} pendingId={pendingId}
          onClose={() => setDetailVehicle(null)}
          onValidate={handleValidate}
          onSuspend={(id, name) => { setDetailVehicle(null); openSuspend(id, name, detailVehicle.statut === 'EN_ATTENTE_VALIDATION' || detailVehicle.statut === 'BROUILLON'); }} />
      )}

      {suspendDialog.open && (
        <SuspendDialog vehicleName={suspendDialog.vehicleName} raison={suspendDialog.raison}
          onRaisonChange={(v) => setSuspendDialog((d) => ({ ...d, raison: v }))}
          onConfirm={handleSuspend}
          onCancel={() => setSuspendDialog({ open: false, vehicleId: '', vehicleName: '', raison: '', isReject: false })}
          loading={!!pendingId} isReject={suspendDialog.isReject} />
      )}

      {/* Toast — design system */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2.5',
          'rounded-2xl px-4 py-3 text-[13px] font-bold shadow-xl max-w-sm',
          'animate-in slide-in-from-bottom-2 duration-300',
          toast.type === 'success'
            ? 'bg-black border border-emerald-400/30 text-white'
            : 'bg-red-500 text-white',
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
            : <XCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
