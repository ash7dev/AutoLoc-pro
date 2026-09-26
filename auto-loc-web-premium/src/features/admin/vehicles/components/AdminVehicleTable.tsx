'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Eye,
  Clock,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Star,
  CheckCircle,
  Loader2,
  ChevronDown,
  Check,
  Camera,
  Car,
} from 'lucide-react';
import type { AdminVehicleQueueItem } from '../../../../core/api/adminAnalyticsApi';

interface AdminVehicleTableProps {
  items: AdminVehicleQueueItem[];
  isLoading: boolean;
  onSelectVehicle: (vehicle: AdminVehicleQueueItem) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  totalItems?: number;
  onLoadMore?: () => void;
}

const DISPLAY_FONT = { fontFamily: 'var(--font-gloock, Georgia, "Times New Roman", serif)' };
const GOLD = '#b27c2d';
const RUST = '#a13d3d';

const TEXT = 'text-slate-900 dark:text-white';
const MUTED = 'text-slate-500 dark:text-slate-400';

const fmt = (n: number) => n.toLocaleString('fr-FR');

const NEUTRAL_BADGE = 'bg-slate-100 text-slate-600 ring-slate-500/20';

const STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  EN_ATTENTE_VALIDATION: {
    label: 'En attente',
    badge: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  VERIFIE: {
    label: 'Vérifié',
    badge: 'bg-brand-main/[0.08] text-brand-main ring-brand-main/20',
    dot: 'bg-brand-main',
  },
  SUSPENDU: {
    label: 'Suspendu',
    badge: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    dot: 'bg-rose-500',
  },
  BROUILLON: {
    label: 'Brouillon',
    badge: NEUTRAL_BADGE,
    dot: 'bg-slate-400',
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const humanize = (v?: string | null) => {
  if (!v) return 'Inconnu';
  const t = v.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const fmtDate = (v: string | number | Date) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const mainPhotoOf = (item: AdminVehicleQueueItem) => {
  const photos = item.photos ?? [];
  return photos.find((p) => p.estPrincipale) || photos[0];
};

const isPendingItem = (item: AdminVehicleQueueItem) => item.statut === 'EN_ATTENTE_VALIDATION';
const isUrgentItem = (item: AdminVehicleQueueItem) =>
  isPendingItem(item) && item.slaWaitHours >= 24;

const accentOf = (item: AdminVehicleQueueItem) =>
  isUrgentItem(item) ? RUST : isPendingItem(item) ? GOLD : undefined;

const tintOf = (item: AdminVehicleQueueItem) =>
  isUrgentItem(item) ? 'bg-rose-50/40 dark:bg-rose-950/10' : '';

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function StatusBadge({ statut }: { statut: string }) {
  const st = STATUS[statut] ?? { label: humanize(statut), badge: NEUTRAL_BADGE, dot: 'bg-slate-400' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${st.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

function VehicleCell({ item }: { item: AdminVehicleQueueItem }) {
  const photo = mainPhotoOf(item);
  const photoCount = item.photos?.length ?? 0;
  const meta = [item.ville, item.transmission].filter(Boolean).join(', ');
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-main/10 ring-1 ring-slate-200 dark:ring-slate-700">
        {photo ? (
          <Image
            src={photo.url}
            alt={`${item.marque} ${item.modele}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-main/40">
            <Car className="h-5 w-5" />
          </div>
        )}
        {photoCount > 0 && (
          <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded bg-black/60 px-1 text-[10px] font-medium tabular-nums text-white backdrop-blur">
            <Camera className="h-2.5 w-2.5" />
            {photoCount}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-semibold ${TEXT}`}>
            {item.marque} {item.modele}
          </span>
          {item.annee ? <span className={`text-xs ${MUTED}`}>{item.annee}</span> : null}
          {item.isFeatured && (
            <span title="Mis en avant sur l'accueil" className="shrink-0">
              <Star className="h-3.5 w-3.5" style={{ color: GOLD, fill: GOLD }} />
              <span className="sr-only">Mis en avant sur l'accueil</span>
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {item.immatriculation || 'Plaque inconnue'}
          </span>
          {meta && <span className={`truncate text-xs ${MUTED}`}>{meta}</span>}
        </div>
      </div>
    </div>
  );
}

function OwnerCell({ item }: { item: AdminVehicleQueueItem }) {
  if (!item.proprietaire) {
    return <span className={`text-sm italic ${MUTED}`}>Anonyme</span>;
  }
  const verified = item.proprietaire.statutKyc === 'VERIFIE';
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={`truncate text-sm font-medium ${TEXT}`}>
          {item.proprietaire.prenom} {item.proprietaire.nom}
        </span>
        {verified ? (
          <span title="KYC vérifié" className="shrink-0">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="sr-only">KYC vérifié</span>
          </span>
        ) : (
          <span title="KYC non vérifié" className="shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span className="sr-only">KYC non vérifié</span>
          </span>
        )}
      </div>
      <p className={`truncate text-xs ${MUTED}`}>
        {item.proprietaire.telephone || item.proprietaire.email || 'Contact non renseigné'}
      </p>
    </div>
  );
}

function PriceCell({ item }: { item: AdminVehicleQueueItem }) {
  const delivery = [item.proposeLivraisonDakar && 'Dakar', item.proposeLivraisonAibd && 'AIBD']
    .filter(Boolean)
    .join(', ');
  return (
    <div className="whitespace-nowrap">
      <div className="flex items-baseline gap-1.5">
        <span style={DISPLAY_FONT} className="text-lg tabular-nums text-brand-main dark:text-champagne">
          {fmt(item.prixParJour)}
        </span>
        <span className={`text-xs ${MUTED}`}>FCFA / jour</span>
      </div>
      <p className={`mt-0.5 text-xs ${MUTED}`}>{delivery ? `Livraison ${delivery}` : 'Sur place'}</p>
    </div>
  );
}

function DocChip({
  label,
  state,
  icon: Icon,
}: {
  label: string;
  state: 'ok' | 'missing' | 'option';
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    ok: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    missing: 'bg-rose-50 text-rose-800 ring-rose-600/20',
    option: 'text-slate-500 ring-slate-200 dark:ring-slate-700',
  }[state];
  const suffix = { ok: 'OK', missing: 'manquante', option: 'optionnelle' }[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
    >
      <Icon className="h-3 w-3" />
      {label}
      <span className="font-normal opacity-80">{suffix}</span>
    </span>
  );
}

function DocChips({ item }: { item: AdminVehicleQueueItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DocChip label="Carte grise" state={item.carteGriseUrl ? 'ok' : 'missing'} icon={FileText} />
      <DocChip label="Assurance" state={item.assurance ? 'ok' : 'option'} icon={ShieldCheck} />
    </div>
  );
}

function WaitCell({ item }: { item: AdminVehicleQueueItem }) {
  if (!isPendingItem(item)) {
    return <span className={`whitespace-nowrap text-xs ${MUTED}`}>Créé le {fmtDate(item.creeLe)}</span>;
  }
  const urgent = isUrgentItem(item);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ring-1 ring-inset ${urgent
          ? 'bg-rose-50 text-rose-800 ring-rose-600/25'
          : 'bg-amber-50 text-amber-800 ring-amber-600/20'
        }`}
    >
      {urgent && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500 motion-reduce:animate-none" />
      )}
      <Clock className="h-3 w-3" />
      {item.slaWaitHours} h d'attente
    </span>
  );
}

function Skel({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none dark:bg-slate-800 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */
export const AdminVehicleTable: React.FC<AdminVehicleTableProps> = ({
  items,
  isLoading,
  onSelectVehicle,
  hasMore = false,
  isLoadingMore = false,
  totalItems = 0,
  onLoadMore,
}) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Scroll infini via Intersection Observer
  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  const shell =
    'overflow-hidden rounded-[28px] border border-brand-main/10 bg-white shadow-[0_20px_50px_-30px_rgba(10,61,46,0.35)] dark:border-slate-800 dark:bg-slate-900';

  /* État vide */
  if (!isLoading && items.length === 0) {
    return (
      <div className={`${shell} flex flex-col items-center px-6 py-16 text-center`}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-main text-champagne">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p style={DISPLAY_FONT} className="mt-5 text-xl text-brand-main dark:text-champagne">
          Aucun véhicule trouvé
        </p>
        <p className={`mt-1 max-w-sm text-sm ${MUTED}`}>
          Aucun véhicule ne correspond à cette recherche ou à ce statut de modération.
        </p>
      </div>
    );
  }

  const total = Math.max(totalItems, items.length);
  const remaining = Math.max(0, total - items.length);
  const loadedShare = total > 0 ? Math.round((items.length / total) * 100) : 100;
  const thCls = `px-4 py-3.5 text-xs font-medium ${MUTED}`;

  return (
    <div className={shell}>
      {/* Tableau (tablette et bureau) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Véhicules en modération</caption>
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800">
              <th scope="col" className={thCls}>Véhicule</th>
              <th scope="col" className={thCls}>Propriétaire</th>
              <th scope="col" className={thCls}>Tarif</th>
              <th scope="col" className={thCls}>Documents</th>
              <th scope="col" className={thCls}>Attente</th>
              <th scope="col" className={thCls}>Statut</th>
              <th scope="col" className={`${thCls} text-right`}>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="px-4 py-4"><Skel className="h-12 w-56" /></td>
                  <td className="px-4 py-4"><Skel className="h-4 w-32" /><Skel className="mt-2 h-3 w-24" /></td>
                  <td className="px-4 py-4"><Skel className="h-5 w-28" /><Skel className="mt-2 h-3 w-20" /></td>
                  <td className="px-4 py-4"><Skel className="h-6 w-44" /></td>
                  <td className="px-4 py-4"><Skel className="h-6 w-24" /></td>
                  <td className="px-4 py-4"><Skel className="h-6 w-20" /></td>
                  <td className="px-4 py-4"><Skel className="ml-auto h-8 w-24" /></td>
                </tr>
              ))
              : items.map((item) => {
                const accent = accentOf(item);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectVehicle(item)}
                    className={`group cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-brand-main/[0.04] dark:border-slate-800/60 dark:hover:bg-champagne/[0.05] ${tintOf(
                      item
                    )}`}
                  >
                    <td
                      className="max-w-[300px] px-4 py-4"
                      style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}
                    >
                      <VehicleCell item={item} />
                    </td>
                    <td className="max-w-[220px] px-4 py-4"><OwnerCell item={item} /></td>
                    <td className="px-4 py-4"><PriceCell item={item} /></td>
                    <td className="px-4 py-4"><DocChips item={item} /></td>
                    <td className="px-4 py-4"><WaitCell item={item} /></td>
                    <td className="px-4 py-4"><StatusBadge statut={item.statut} /></td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(item);
                        }}
                        aria-label={`Inspecter ${item.marque} ${item.modele}`}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-brand-main/25 px-3.5 py-1.5 text-sm font-medium text-brand-main transition hover:border-brand-main hover:bg-brand-main hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2 dark:border-champagne/30 dark:text-champagne dark:hover:bg-champagne dark:hover:text-brand-main"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Inspecter
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <ul className="divide-y divide-slate-100 md:hidden dark:divide-slate-800/60">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="space-y-3 p-4">
              <Skel className="h-12 w-56" />
              <Skel className="h-8 w-44" />
              <Skel className="h-6 w-52" />
            </li>
          ))
          : items.map((item) => {
            const accent = accentOf(item);
            return (
              <li key={item.id} className={tintOf(item)}>
                <button
                  type="button"
                  onClick={() => onSelectVehicle(item)}
                  aria-label={`Inspecter ${item.marque} ${item.modele}`}
                  className="group block w-full space-y-4 p-4 text-left transition-colors hover:bg-brand-main/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-main"
                  style={accent ? { boxShadow: `inset 3px 0 0 0 ${accent}` } : undefined}
                >
                  <div className="flex items-start justify-between gap-3">
                    <VehicleCell item={item} />
                    <StatusBadge statut={item.statut} />
                  </div>

                  <OwnerCell item={item} />

                  <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <PriceCell item={item} />
                    <WaitCell item={item} />
                  </div>

                  <DocChips item={item} />
                </button>
              </li>
            );
          })}
      </ul>

      {/* Pied : scroll infini */}
      <div
        ref={loadMoreRef}
        aria-live="polite"
        className="border-t border-slate-200/80 bg-[#F6F7F5] px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40"
      >
        {isLoadingMore ? (
          <div className={`flex items-center justify-center gap-2.5 py-1 text-sm ${MUTED}`}>
            <Loader2 className="h-4 w-4 animate-spin text-brand-main motion-reduce:animate-none dark:text-champagne" />
            Chargement des véhicules suivants…
          </div>
        ) : hasMore ? (
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className={`text-sm tabular-nums ${MUTED}`}>
                <span className={`font-semibold ${TEXT}`}>{items.length}</span> sur{' '}
                <span className={`font-semibold ${TEXT}`}>{total}</span> véhicules
              </p>
              <div
                aria-hidden
                className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
              >
                <div className="h-full rounded-full bg-brand-main" style={{ width: `${loadedShare}%` }} />
              </div>
            </div>
            <button
              type="button"
              onClick={onLoadMore}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-main px-5 py-2.5 text-sm font-semibold text-champagne shadow-md shadow-brand-main/20 transition hover:bg-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2"
            >
              Charger la suite
              <ChevronDown className="h-4 w-4" />
              {remaining > 0 && (
                <span className="rounded-full bg-champagne/20 px-2 text-xs tabular-nums">
                  +{remaining}
                </span>
              )}
            </button>
          </div>
        ) : (
          <p className={`flex items-center justify-center gap-2 py-1 text-sm ${MUTED}`}>
            <Check className="h-4 w-4 text-brand-main dark:text-champagne" />
            Tous les véhicules sont chargés ({items.length})
          </p>
        )}
      </div>
    </div>
  );
};